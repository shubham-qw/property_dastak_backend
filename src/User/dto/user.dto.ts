import { IsEmail, IsString, IsEnum, MinLength, MaxLength, Matches } from 'class-validator';

export enum UserClass {
  BUYER = 'buyer',
  SELLER = 'seller',
  USER = 'user'
}

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  first_name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  last_name: string;

  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid international format'
  })
  phone_number: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsEnum(UserClass, { message: 'Class must be one of: buyer, seller, user' })
  class: UserClass;
}

export class UserResponseDto {
  id: number;
  user_uuid: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  class: UserClass;
  created_at: Date;
  updated_at: Date;
}

export class SendOtpDto {
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid international format',
  })
  phone_number: string;
}

export class VerifyOtpDto {
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid international format',
  })
  phone_number: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit number' })
  otp: string;
}

// JWT Response DTOs
export class AuthResponseDto {
  user: UserResponseDto;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class SignupResponseDto {
  user: UserResponseDto;
  access_token: string;
  token_type: string;
  expires_in: number;
  message: string;
}

export class OtpStatusResponseDto {
  message: string;
}

export class VerifyOtpResponseDto {
  is_new_user: boolean;
  message: string;
  user?: UserResponseDto;
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  phone_number?: string;
}

