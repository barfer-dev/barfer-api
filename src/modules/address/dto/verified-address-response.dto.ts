export class VerifiedAddressResponseDto {
  formatted_address: string;
  
  components: {
    street?: string;
    streetNumber?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  
  isPartialMatch: boolean;
}

