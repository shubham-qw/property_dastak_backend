import { IsEmail, IsString, IsEnum, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

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

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  })
  password: string;

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

export class LoginUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  password: string;
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

