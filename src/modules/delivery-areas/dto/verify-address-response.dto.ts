import { DeliveryArea } from '../../../schemas/delivery-area.schema';

export class VerifyAddressResponseDto {
  zones: DeliveryArea[];
  formattedAddress: string;
  lat: number;
  lng: number;
}
