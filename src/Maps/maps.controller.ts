import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { MapsService } from './Providers/maps.service';
import {
  GeocodeDto,
  GeocodeResponseDto,
  PlaceDetailsDto,
  PlaceDetailsResponseDto,
  PlacesAutocompleteDto,
  PlacesAutocompleteResponseDto,
  ReverseGeocodeDto,
  ReverseGeocodeResponseDto,
} from './dto/maps.dto';
import { JwtAuthGuard } from '../User/guards/jwt-auth.guard';

@Controller('maps')
//@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  /**
   * GET /maps/geocode?address=...
   * Convert a human-readable address into coordinates.
   */
  @Get('geocode')
  @HttpCode(HttpStatus.OK)
  async geocode(@Query() query: GeocodeDto): Promise<GeocodeResponseDto> {
    return this.mapsService.geocode(query.address);
  }

  /**
   * GET /maps/reverse-geocode?lat=...&lng=...
   * Convert coordinates into a human-readable address.
   */
  @Get('reverse-geocode')
  @HttpCode(HttpStatus.OK)
  async reverseGeocode(
    @Query() query: ReverseGeocodeDto,
  ): Promise<ReverseGeocodeResponseDto> {
    return this.mapsService.reverseGeocode(query.lat, query.lng);
  }

  /**
   * GET /maps/places/autocomplete?input=...&language=en&components=country:in&types=geocode
   * Return place suggestions for a partial search string.
   */
  @Get('places/autocomplete')
  @HttpCode(HttpStatus.OK)
  async placesAutocomplete(
    @Query() query: PlacesAutocompleteDto,
  ): Promise<PlacesAutocompleteResponseDto> {
    return this.mapsService.placesAutocomplete({
      input: query.input,
      language: query.language,
      region: query.region,
      type_filter: query.type_filter,
    });
  }

  /**
   * GET /maps/places/details?place_id=...&language=en
   * Fetch full details for a place using its place_id.
   */
  @Get('places/details')
  @HttpCode(HttpStatus.OK)
  async placeDetails(
    @Query() query: PlaceDetailsDto,
  ): Promise<PlaceDetailsResponseDto> {
    return this.mapsService.placeDetails(query.place_id, query.language);
  }
}
