import {
  GeocodeResponseDto,
  PlaceDetailsResponseDto,
  PlacesAutocompleteResponseDto,
  ReverseGeocodeResponseDto,
} from '../dto/maps.dto';

export const MAPS_PROVIDER = Symbol('MAPS_PROVIDER');

export interface IMapsProvider {
  geocode(address: string): Promise<GeocodeResponseDto>;

  reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResponseDto>;

  placesAutocomplete(opts: {
    input: string;
    language?: string;
    region?: string;
    type_filter?: string;
  }): Promise<PlacesAutocompleteResponseDto>;

  placeDetails(placeId: string, language?: string): Promise<PlaceDetailsResponseDto>;
}
