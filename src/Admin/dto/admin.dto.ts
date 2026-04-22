import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

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

  @IsIn(['accepted', 'rejected'])
  is_verified: 'accepted' | 'rejected';
}
