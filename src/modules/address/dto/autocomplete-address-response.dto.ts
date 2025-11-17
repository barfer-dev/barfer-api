export class AutocompleteSuggestionDto {
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
  placeId?: string;
}

export class AutocompleteAddressResponseDto {
  suggestions: AutocompleteSuggestionDto[];
}

