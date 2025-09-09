import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BaseLeadDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  pincode: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class MoversPackersLeadDto extends BaseLeadDto {
  @IsString()
  @IsIn(['local', 'intercity'])
  moveType: string;
}

export class InteriorDesignersLeadDto extends BaseLeadDto {}

export class HomeLoanLeadDto extends BaseLeadDto {}

export class VastuLeadDto extends BaseLeadDto {
  @IsString()
  @IsIn(['online', 'offline'])
  consultationType: string;
}

export type LeadServiceType =
  | 'movers_packers'
  | 'interior_designers'
  | 'home_loan'
  | 'vastu';


