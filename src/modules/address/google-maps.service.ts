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

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

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
}

