import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsDecimal, IsInt, Min, MaxLength, IsIn, IsObject } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum PropertyFor {
  SELL = 'sell',
  LEASE_RENT = 'lease/rent',
  PG_HOTEL = 'pg/hotel'
}

export enum AvailabilityStatus {
  READY_TO_MOVE = 'ready_to_move',
  UNDER_CONSTRUCTION = 'under_construction'
}

export enum Ownership {
  FREEHOLD = 'freehold',
  LEASEHOLD = 'leasehold',
  CO_OPERATIVE = 'co-operative',
  POWER_OF_ATTORNEY = 'power_of_attorney'
}

export enum ParkingType {
  COVERED = 'covered',
  OPEN = 'open'
}

// Property Details DTO
export class PropertyDetailsDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  rooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  balconies?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  other_rooms?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  floors?: number;
}

export class PropertySizeDto {
  @IsOptional()
  @IsObject()
  property_size?: object;
}

// Parking DTO
export class ParkingDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  parking_count?: number;

  @IsOptional()
  @IsEnum(ParkingType)
  parking_type?: ParkingType;
}

// Create Property DTO
export class CreatePropertyDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsEnum(PropertyFor)
  property_for: PropertyFor;

  @IsString()
  @MaxLength(20)
  property_type: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(100)
  locality: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sub_locality?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  apartment?: string;

  @IsOptional()
  @IsObject()
  property_size?: object;

  @IsEnum(AvailabilityStatus)
  availability_status: AvailabilityStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  property_age?: number;

  @IsOptional()
  @IsEnum(Ownership)
  ownership?: Ownership;

  @IsOptional()
  @IsString()
  @IsDecimal({ decimal_digits: '1,2', force_decimal: true })
  price_per_sqft?: number;

  @IsOptional()
  @IsString()
  @IsDecimal({ decimal_digits: '1,2', force_decimal: true })
  brokerage_charge?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  property_features?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  property_amenities?: string[];

  // Property Details
  @IsOptional()
  @Type(() => PropertyDetailsDto)
  property_details?: PropertyDetailsDto;

  // Parking
  @IsOptional()
  @Type(() => ParkingDto)
  parking?: ParkingDto;
}

// Update Property DTO
export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsEnum(PropertyFor)
  property_for?: PropertyFor;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  property_type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  locality?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sub_locality?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  apartment?: string;

  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability_status?: AvailabilityStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  property_age?: number;

  @IsOptional()
  @IsEnum(Ownership)
  ownership?: Ownership;

  @IsOptional()
  @Type(() => Number)
  @IsDecimal()
  price_per_sqft?: number;

  @IsOptional()
  @Type(() => Number)
  @IsDecimal()
  brokerage_charge?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  property_features?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  property_amenities?: string[];

  // Property Details
  @IsOptional()
  @Type(() => PropertyDetailsDto)
  property_details?: PropertyDetailsDto;

  // Parking
  @IsOptional()
  @Type(() => ParkingDto)
  parking?: ParkingDto;
}

// Property Details Response DTO
export class PropertyDetailsResponseDto {
  property_id: number;
  rooms?: number;
  bathrooms?: number;
  balconies?: number;
  other_rooms?: string;
  floors?: number;
}

// Parking Response DTO
export class ParkingResponseDto {
  property_id: number;
  parking_count?: number;
  parking_type?: ParkingType;
}

// Property Response DTO
export class PropertyResponseDto {
  id: number;
  title?: string;
  property_for: PropertyFor;
  property_type: string;
  city: string;
  locality: string;
  sub_locality?: string;
  apartment?: string;
  availability_status: AvailabilityStatus;
  property_age?: number;
  ownership?: Ownership;
  price_per_sqft?: number;
  brokerage_charge?: number;
  description?: string;
  property_features?: string[];
  property_amenities?: string[];
  created_at: Date;
  updated_at: Date;
  property_details?: PropertyDetailsResponseDto;
  parking?: ParkingResponseDto;
  property_size?: PropertySizeDto;
}
