import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface GoogleMapsAddressComponent {
  street?: string;
  streetNumber?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface GoogleMapsVerifyResponse {
  formatted_address: string;
  components: GoogleMapsAddressComponent;
  isPartialMatch: boolean;
}

export interface AutocompleteSuggestion {
  formatted_address: string;
  components: GoogleMapsAddressComponent;
  placeId?: string;
}

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  private readonly placesAutocompleteUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
  private readonly placesDetailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    if (!this.apiKey) {
      this.logger.warn('GOOGLE_MAPS_API_KEY is not configured');
    }
  }

  async verifyAddress(address: string): Promise<GoogleMapsVerifyResponse> {
    if (!this.apiKey) {
      throw new BadRequestException(
        'Google Maps API is not configured on the server',
      );
    }

    try {
      const url = `${this.baseUrl}?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          timeout: 5000,
        }),
      );

      const { data } = response;

      // Verificar el estado de la respuesta de Google
      if (data.status === 'ZERO_RESULTS') {
        throw new BadRequestException(
          'No se encontró la dirección ingresada. Por favor, verifica que sea correcta.',
        );
      }

      if (data.status === 'INVALID_REQUEST') {
        throw new BadRequestException(
          'La dirección ingresada no es válida. Por favor, verifica el formato.',
        );
      }

      if (data.status === 'REQUEST_DENIED') {
        this.logger.error('Google Maps API request denied:', data.error_message);
        throw new BadRequestException(
          'Error en la configuración del servicio de validación de direcciones.',
        );
      }

      if (data.status === 'OVER_QUERY_LIMIT') {
        this.logger.error('Google Maps API quota exceeded');
        throw new BadRequestException(
          'El servicio de validación está temporalmente no disponible.',
        );
      }

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        throw new BadRequestException(
          'No se pudo verificar la dirección. Por favor, intenta nuevamente.',
        );
      }

      // Tomar el primer resultado
      const result = data.results[0];
      const isPartialMatch = result.partial_match === true;

      // Parsear los componentes de la dirección
      const components = this.parseAddressComponents(result.address_components);

      return {
        formatted_address: result.formatted_address,
        components,
        isPartialMatch,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('Error calling Google Maps API:', error.message);
      throw new BadRequestException(
        'Error al verificar la dirección. Por favor, intenta nuevamente.',
      );
    }
  }

  private parseAddressComponents(
    addressComponents: any[],
  ): GoogleMapsAddressComponent {
    const components: GoogleMapsAddressComponent = {};

    for (const component of addressComponents) {
      const types = component.types;

      if (types.includes('street_number')) {
        components.streetNumber = component.long_name;
      }

      if (types.includes('route')) {
        components.street = component.long_name;
      }

      if (
        types.includes('sublocality') ||
        types.includes('sublocality_level_1') ||
        types.includes('neighborhood')
      ) {
        components.neighborhood = component.long_name;
      }

      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        components.city = component.long_name;
      }

      if (types.includes('administrative_area_level_1')) {
        components.state = component.long_name;
      }

      if (types.includes('country')) {
        components.country = component.long_name;
      }

      if (types.includes('postal_code')) {
        components.postalCode = component.long_name;
      }
    }

    return components;
  }

  async autocompleteAddress(
    query: string,
    city?: string,
  ): Promise<AutocompleteSuggestion[]> {
    if (!this.apiKey) {
      throw new BadRequestException(
        'Google Maps API is not configured on the server',
      );
    }

    try {
      // Construir parámetros para la API de Autocomplete
      const params = new URLSearchParams({
        input: query,
        key: this.apiKey,
        language: 'es',
        region: 'ar', // Argentina
        types: 'address', // Solo direcciones
      });

      // Si hay ciudad, agregar filtro por componente
      if (city) {
        params.append('components', `country:ar|locality:${encodeURIComponent(city)}`);
      } else {
        params.append('components', 'country:ar');
      }

      const autocompleteUrl = `${this.placesAutocompleteUrl}?${params.toString()}`;

      const autocompleteResponse = await firstValueFrom(
        this.httpService.get(autocompleteUrl, {
          timeout: 5000,
        }),
      );

      const { data: autocompleteData } = autocompleteResponse;

      // Verificar el estado de la respuesta
      if (autocompleteData.status === 'REQUEST_DENIED') {
        this.logger.error('Google Places API request denied:', autocompleteData.error_message);
        throw new BadRequestException(
          'Error en la configuración del servicio de búsqueda de direcciones.',
        );
      }

      if (autocompleteData.status === 'OVER_QUERY_LIMIT') {
        this.logger.error('Google Places API quota exceeded');
        throw new BadRequestException(
          'El servicio de búsqueda está temporalmente no disponible.',
        );
      }

      if (
        autocompleteData.status !== 'OK' ||
        !autocompleteData.predictions ||
        autocompleteData.predictions.length === 0
      ) {
        // Si no hay resultados, devolver array vacío en lugar de error
        return [];
      }

      // Limitar a 5 sugerencias
      const predictions = autocompleteData.predictions.slice(0, 5);

      // Obtener detalles de cada predicción
      const suggestions = await Promise.all(
        predictions.map(async (prediction: any) => {
          try {
            const detailsParams = new URLSearchParams({
              place_id: prediction.place_id,
              key: this.apiKey,
              language: 'es',
            });

            const detailsUrl = `${this.placesDetailsUrl}?${detailsParams.toString()}`;

            const detailsResponse = await firstValueFrom(
              this.httpService.get(detailsUrl, {
                timeout: 5000,
              }),
            );

            const { data: detailsData } = detailsResponse;

            if (detailsData.status !== 'OK' || !detailsData.result) {
              // Si falla obtener detalles, usar la descripción de la predicción
              return {
                formatted_address: prediction.description,
                components: {},
                placeId: prediction.place_id,
              };
            }

            const result = detailsData.result;
            const components = this.parseAddressComponents(
              result.address_components || [],
            );

            return {
              formatted_address: result.formatted_address || prediction.description,
              components,
              placeId: prediction.place_id,
            };
          } catch (error) {
            this.logger.warn(
              `Error getting details for place ${prediction.place_id}:`,
              error.message,
            );
            // Si falla obtener detalles, devolver al menos la predicción básica
            return {
              formatted_address: prediction.description,
              components: {},
              placeId: prediction.place_id,
            };
          }
        }),
      );

      return suggestions;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('Error calling Google Places API:', error.message);
      throw new BadRequestException(
        'Error al buscar direcciones. Por favor, intenta nuevamente.',
      );
    }
  }
}

