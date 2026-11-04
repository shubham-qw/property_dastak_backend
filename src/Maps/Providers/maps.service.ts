import { Inject, Injectable } from '@nestjs/common';
import {
  GeocodeResponseDto,
  PlaceDetailsResponseDto,
  PlacesAutocompleteResponseDto,
  ReverseGeocodeResponseDto,
} from '../dto/maps.dto';
import { IMapsProvider, MAPS_PROVIDER } from './maps.provider.interface';

@Injectable()
export class MapsService {
  constructor(
    @Inject(MAPS_PROVIDER) private readonly provider: IMapsProvider,
  ) {}

  geocode(address: string): Promise<GeocodeResponseDto> {
    return this.provider.geocode(address);
  }

  reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResponseDto> {
    return this.provider.reverseGeocode(lat, lng);
  }

  placesAutocomplete(opts: {
    input: string;
    language?: string;
    region?: string;
    type_filter?: string;
  }): Promise<PlacesAutocompleteResponseDto> {
    return this.provider.placesAutocomplete(opts);
  }

  placeDetails(placeId: string, language?: string): Promise<PlaceDetailsResponseDto> {
    return this.provider.placeDetails(placeId, language);
  }
}
