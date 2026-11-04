import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

// ── Shared ─────────────────────────────────────────────────────────────────

export class AddressComponent {
  name: string;
  short_name: string;
  types: string[];
}

// ── Geocoding ──────────────────────────────────────────────────────────────

export class GeocodeDto {
  @IsString()
  @IsNotEmpty()
  address: string;
}

export class ReverseGeocodeDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  lng: number;
}

export class GeocodeResponseDto {
  place_id: string;
  formatted_address: string;
  lat: number;
  lng: number;
  components: AddressComponent[];
}

export class ReverseGeocodeResponseDto {
  place_id: string;
  formatted_address: string;
  lat: number;
  lng: number;
  components: AddressComponent[];
}

// ── Place Details ──────────────────────────────────────────────────────────

export class PlaceDetailsDto {
  @IsString()
  @IsNotEmpty()
  place_id: string;

  @IsOptional()
  @IsString()
  language?: string;
}

export class PlaceDetailsResponseDto {
  place_id: string;
  name: string;
  formatted_address: string;
  lat: number;
  lng: number;
  types: string[];
  components: AddressComponent[];
  maps_uri?: string;
}

// ── Places Autocomplete ────────────────────────────────────────────────────

export class PlacesAutocompleteDto {
  @IsString()
  @IsNotEmpty()
  input: string;

  @IsOptional()
  @IsString()
  language?: string;

  /**
   * ISO 3166-1 alpha-2 country code(s) to restrict results.
   * Single: "IN"  |  Multiple (pipe-separated): "IN|US"
   */
  @IsOptional()
  @IsString()
  region?: string;

  /**
   * Generic type filter: "address" | "city" | "region" | "establishment" | "geocode"
   * Multiple (pipe-separated): "address|city"
   */
  @IsOptional()
  @IsString()
  type_filter?: string;
}

export class PlacePredictionDto {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
  types: string[];
}

export class PlacesAutocompleteResponseDto {
  predictions: PlacePredictionDto[];
}
