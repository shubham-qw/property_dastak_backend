import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReelDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  thumbnail_path?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  duration_seconds?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_verified?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateReelDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  thumbnail_path?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  duration_seconds?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_verified?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;
}

export class ReelResponseDto {
  id: number;
  description: string | null;
  media_path: string;
  thumbnail_path: string | null;
  duration_seconds: number | null;
  views_count: number;
  likes_count: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type ReelCreatorSummaryDto = {
  id: number;
  user_uuid: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  class: string;
};

export type ReelWithUserResponseDto = ReelResponseDto & {
  user: ReelCreatorSummaryDto | null;
};

