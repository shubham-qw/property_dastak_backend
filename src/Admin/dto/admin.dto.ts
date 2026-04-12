import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class AdminVerifyDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  property_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  reel_id?: number;

  @Type(() => Boolean)
  @IsBoolean()
  is_verified: boolean;
}
