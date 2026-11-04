import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  AddressComponent,
  GeocodeResponseDto,
  PlaceDetailsResponseDto,
  PlacesAutocompleteResponseDto,
  ReverseGeocodeResponseDto,
} from '../../dto/maps.dto';
import { IMapsProvider } from '../maps.provider.interface';

const GEOCODE_BASE = 'https://maps.googleapis.com/maps/api/geocode/json';
const PLACES_AUTO_URL = 'https://places.googleapis.com/v1/places:autocomplete';
const PLACES_AUTO_FIELD_MASK =
  'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat,suggestions.placePrediction.types';
const PLACES_DETAILS_BASE = 'https://places.googleapis.com/v1/places';
const PLACES_DETAILS_FIELD_MASK =
  'id,displayName,formattedAddress,location,addressComponents,types,googleMapsUri';

@Injectable()
export class GoogleMapsProvider implements IMapsProvider {
  private get apiKey(): string {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) {
      throw new InternalServerErrorException('GOOGLE_MAPS_API_KEY is not configured');
    }
    return key;
  }

  // ── Geocoding ─────────────────────────────────────────────────────────────

  async geocode(address: string): Promise<GeocodeResponseDto> {
    const url = new URL(GEOCODE_BASE);
    url.searchParams.set('address', address);
    url.searchParams.set('key', this.apiKey);

    const data = await this.getJson(url.toString());
    this.assertGeocodeStatus(data);

    const result = data.results?.[0];
    if (!result) {
      throw new BadRequestException('No geocoding results found for the given address');
    }

    return {
      place_id: result.place_id,
      formatted_address: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      components: this.mapAddressComponents(result.address_components),
    };
  }

  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResponseDto> {
    const url = new URL(GEOCODE_BASE);
    url.searchParams.set('latlng', `${lat},${lng}`);
    url.searchParams.set('key', this.apiKey);

    const data = await this.getJson(url.toString());
    this.assertGeocodeStatus(data);

    const result = data.results?.[0];
    if (!result) {
      throw new BadRequestException('No results found for the given coordinates');
    }

    return {
      place_id: result.place_id,
      formatted_address: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      components: this.mapAddressComponents(result.address_components),
    };
  }

  // ── Places Autocomplete ───────────────────────────────────────────────────

  async placesAutocomplete(opts: {
    input: string;
    language?: string;
    region?: string;
    type_filter?: string;
  }): Promise<PlacesAutocompleteResponseDto> {
    const body: Record<string, any> = { input: opts.input };

    if (opts.language) {
      body.languageCode = opts.language;
    }

    // neutral "IN|US" → Google's includedRegionCodes: ["IN", "US"]
    if (opts.region) {
      body.includedRegionCodes = opts.region
        .split('|')
        .map((r) => r.trim().toUpperCase())
        .filter(Boolean);
    }

    // neutral type_filter → Google's includedPrimaryTypes
    if (opts.type_filter) {
      body.includedPrimaryTypes = opts.type_filter
        .split('|')
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const data = await this.postJson(PLACES_AUTO_URL, body, PLACES_AUTO_FIELD_MASK);

    return {
      predictions: (data.suggestions ?? []).map((s: any) => {
        const p = s.placePrediction;
        return {
          place_id: p.placeId,
          description: p.text?.text ?? '',
          main_text: p.structuredFormat?.mainText?.text ?? '',
          secondary_text: p.structuredFormat?.secondaryText?.text ?? '',
          types: p.types ?? [],
        };
      }),
    };
  }

  // ── Place Details ─────────────────────────────────────────────────────────

  async placeDetails(placeId: string, language?: string): Promise<PlaceDetailsResponseDto> {
    const url = new URL(`${PLACES_DETAILS_BASE}/${encodeURIComponent(placeId)}`);
    if (language) url.searchParams.set('languageCode', language);

    const data = await this.getJson(url.toString(), {
      'X-Goog-Api-Key': this.apiKey,
      'X-Goog-FieldMask': PLACES_DETAILS_FIELD_MASK,
    });

    return {
      place_id: data.id,
      name: data.displayName?.text ?? '',
      formatted_address: data.formattedAddress ?? '',
      lat: data.location?.latitude ?? 0,
      lng: data.location?.longitude ?? 0,
      types: data.types ?? [],
      // Google's addressComponents use longText/shortText → mapped to neutral name/short_name
      components: (data.addressComponents ?? []).map((c: any): AddressComponent => ({
        name: c.longText,
        short_name: c.shortText,
        types: c.types,
      })),
      // Google-specific field mapped to neutral maps_uri
      maps_uri: data.googleMapsUri,
    };
  }

  // ── HTTP helpers ──────────────────────────────────────────────────────────

  private async getJson(url: string, extraHeaders: Record<string, string> = {}): Promise<any> {
    let res: Response;
    try {
      res = await fetch(url, { headers: extraHeaders });
    } catch (err: any) {
      throw new InternalServerErrorException(`Google API request failed: ${err.message}`);
    }

    if (res.status === 404) {
      throw new BadRequestException('Place not found');
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new InternalServerErrorException(
        `Google API error ${res.status}: ${(body as any)?.error?.message ?? res.statusText}`,
      );
    }

    return res.json();
  }

  private async postJson(url: string, body: object, fieldMask: string): Promise<any> {
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': fieldMask,
        },
        body: JSON.stringify(body),
      });
    } catch (err: any) {
      throw new InternalServerErrorException(`Google API request failed: ${err.message}`);
    }

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new InternalServerErrorException(
        `Google API error ${res.status}: ${(errBody as any)?.error?.message ?? res.statusText}`,
      );
    }

    return res.json();
  }

  private assertGeocodeStatus(data: any) {
    if (data.status === 'REQUEST_DENIED') {
      throw new InternalServerErrorException(`Google API: ${data.error_message ?? data.status}`);
    }
    if (data.status === 'INVALID_REQUEST') {
      throw new BadRequestException(`Google API: ${data.error_message ?? data.status}`);
    }
  }

  // Google Geocoding API uses long_name/short_name → mapped to neutral name/short_name
  private mapAddressComponents(raw: any[]): AddressComponent[] {
    return (raw ?? []).map((c) => ({
      name: c.long_name,
      short_name: c.short_name,
      types: c.types,
    }));
  }
}
