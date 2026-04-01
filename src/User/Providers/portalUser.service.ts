import { Injectable, ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import dbInstance from '../../Database/dbConn/nodeDB';
import { CreateUserDto, UserResponseDto, UserClass, AuthResponseDto, SignupResponseDto, SendOtpDto, VerifyOtpDto, OtpStatusResponseDto, VerifyOtpResponseDto } from '../dto/user.dto';
import { JwtService } from './jwt.service';

@Injectable()
export class PortalUserService {
  private readonly SALT_ROUNDS = 12;
  private readonly OTP_EXPIRY_MS = 5 * 60 * 1000;
  private readonly TEMP_OTP = '000000';
  private readonly otpStore = new Map<string, { otp: string; expiresAt: number }>();
  private readonly verifiedSignupPhones = new Map<string, number>();

  constructor(private readonly jwtService: JwtService) {}

  async createUser(createUserDto: CreateUserDto): Promise<SignupResponseDto> {
    const { email, phone_number, ...userData } = createUserDto;

    try {
      // Check if user already exists with email or phone
      const existingUser = await this.findUserByEmailOrPhone(email, phone_number);
      if (existingUser) {
        throw new ConflictException('User with this email or phone number already exists');
      }

      const verifiedUntil = this.verifiedSignupPhones.get(phone_number);
      if (!verifiedUntil || Date.now() > verifiedUntil) {
        this.verifiedSignupPhones.delete(phone_number);
        throw new UnauthorizedException('Phone number is not OTP verified. Please verify OTP first');
      }

      // Keep password/salt columns populated until schema is migrated.
      // OTP is now the auth mechanism.
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(`otp_auth_${uuidv4()}`, salt);

      // Generate UUID
      const user_uuid = uuidv4();

      // Insert user into database
      const query = `
        INSERT INTO users (user_uuid, first_name, last_name, phone_number, email, password, salt, class)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, user_uuid, first_name, last_name, phone_number, email, class, created_at, updated_at
      `;

      const values = [
        user_uuid,
        userData.first_name,
        userData.last_name,
        phone_number,
        email,
        hashedPassword,
        salt,
        userData.class
      ];

      const result = await dbInstance.query(query, values);
      const newUser = result.rows[0];

      const userResponse = {
        id: newUser.id,
        user_uuid: newUser.user_uuid,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        phone_number: newUser.phone_number,
        email: newUser.email,
        class: newUser.class as UserClass,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at
      };

      // Generate JWT token
      const tokenPayload = {
        sub: newUser.id,
        user_uuid: newUser.user_uuid,
        email: newUser.email,
        class: newUser.class,
      };

      const access_token = this.jwtService.generateToken(tokenPayload);
      const expires_in = this.jwtService.getTokenExpirationTime();
      this.verifiedSignupPhones.delete(phone_number);

      return {
        user: userResponse,
        access_token,
        token_type: 'Bearer',
        expires_in,
        message: 'User registered successfully'
      };

    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async sendOtp(sendOtpDto: SendOtpDto): Promise<OtpStatusResponseDto> {
    const { phone_number } = sendOtpDto;
    const expiresAt = Date.now() + this.OTP_EXPIRY_MS;

    this.otpStore.set(phone_number, {
      otp: this.TEMP_OTP,
      expiresAt,
    });

    // TODO: Integrate SMS gateway API here to send OTP to user phone number.
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    const { phone_number, otp } = verifyOtpDto;
    const otpRecord = this.otpStore.get(phone_number);

    if (!otpRecord) {
      throw new UnauthorizedException('OTP not found. Please request a new OTP');
    }

    if (Date.now() > otpRecord.expiresAt) {
      this.otpStore.delete(phone_number);
      throw new UnauthorizedException('OTP has expired. Please request a new OTP');
    }

    if (otpRecord.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    this.otpStore.delete(phone_number);
    const expires_in = this.jwtService.getTokenExpirationTime();

    const user = await this.findUserByPhone(phone_number);
    if (!user) {
      this.verifiedSignupPhones.set(phone_number, Date.now() + this.OTP_EXPIRY_MS);
      const signupTokenPayload = {
        sub: 0,
        user_uuid: 'otp_signup',
        phone_number,
        purpose: 'signup',
        otp_verified: true,
      };
      return {
        is_new_user: true,
        message: 'OTP verified. Complete signup to continue',
        phone_number,
        access_token: this.jwtService.generateToken(signupTokenPayload),
        token_type: 'Bearer',
        expires_in,
      };
    }

    const userResponse = this.mapUserRowToResponse(user);
    const tokenPayload = {
      sub: user.id,
      user_uuid: user.user_uuid,
      email: user.email,
      class: user.class,
    };

    return {
      is_new_user: false,
      message: 'OTP verified and login successful',
      user: userResponse,
      access_token: this.jwtService.generateToken(tokenPayload),
      token_type: 'Bearer',
      expires_in,
    };
  }

  async findUserByEmailOrPhone(email: string, phone_number: string): Promise<any> {
    const query = `
      SELECT id, user_uuid, first_name, last_name, phone_number, email, class, created_at, updated_at
      FROM users 
      WHERE email = $1 OR phone_number = $2
    `;
    
    const result = await dbInstance.query(query, [email, phone_number]);
    return result.rows[0] || null;
  }

  async findUserByPhone(phone_number: string): Promise<any> {
    const query = `
      SELECT id, user_uuid, first_name, last_name, phone_number, email, class, created_at, updated_at
      FROM users
      WHERE phone_number = $1
      LIMIT 1
    `;
    const result = await dbInstance.query(query, [phone_number]);
    return result.rows[0] || null;
  }

  async findUserById(id: number): Promise<UserResponseDto> {
    const query = `
      SELECT id, user_uuid, first_name, last_name, phone_number, email, class, created_at, updated_at
      FROM users 
      WHERE id = $1
    `;
    
    const result = await dbInstance.query(query, [id]);
    const user = result.rows[0];
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      user_uuid: user.user_uuid,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      email: user.email,
      class: user.class as UserClass,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }

  async findUserByUuid(user_uuid: string): Promise<UserResponseDto> {
    const query = `
      SELECT id, user_uuid, first_name, last_name, phone_number, email, class, created_at, updated_at
      FROM users 
      WHERE user_uuid = $1
    `;
    
    const result = await dbInstance.query(query, [user_uuid]);
    const user = result.rows[0];
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      user_uuid: user.user_uuid,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      email: user.email,
      class: user.class as UserClass,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }

  async loginUser(verifyOtpDto: VerifyOtpDto): Promise<AuthResponseDto> {
    const verifyResult = await this.verifyOtp(verifyOtpDto);
    if (verifyResult.is_new_user || !verifyResult.user || !verifyResult.access_token) {
      throw new BadRequestException('User not found. Please complete signup');
    }

    return {
      user: verifyResult.user,
      access_token: verifyResult.access_token,
      token_type: verifyResult.token_type || 'Bearer',
      expires_in: verifyResult.expires_in || this.jwtService.getTokenExpirationTime(),
    };
  }

  private mapUserRowToResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      user_uuid: user.user_uuid,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      email: user.email,
      class: user.class as UserClass,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const query = `
      SELECT id, user_uuid, first_name, last_name, phone_number, email, class, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `;
    
    const result = await dbInstance.query(query);
    
    return result.rows.map(user => ({
      id: user.id,
      user_uuid: user.user_uuid,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      email: user.email,
      class: user.class as UserClass,
      created_at: user.created_at,
      updated_at: user.updated_at
    }));
  }

  async updateUser(id: number, updateData: Partial<CreateUserDto>): Promise<UserResponseDto> {
    // Check if user exists
    await this.findUserById(id);

    const otherData = updateData;
    let query = 'UPDATE users SET ';
    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic query
    const updates: string[] = [];
    for (const [key, value] of Object.entries(otherData)) {
      if (value !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    query += updates.join(', ') + ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    const result = await dbInstance.query(query, values);
    const updatedUser = result.rows[0];

    return {
      id: updatedUser.id,
      user_uuid: updatedUser.user_uuid,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      phone_number: updatedUser.phone_number,
      email: updatedUser.email,
      class: updatedUser.class as UserClass,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at
    };
  }

  async deleteUser(id: number): Promise<void> {
    // Check if user exists
    await this.findUserById(id);

    const query = 'DELETE FROM users WHERE id = $1';
    await dbInstance.query(query, [id]);
  }
}

