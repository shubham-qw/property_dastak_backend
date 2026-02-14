import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import dbInstance from '../../Database/dbConn/nodeDB';
import { CreateUserDto, UserResponseDto, LoginUserDto, UserClass, AuthResponseDto, SignupResponseDto } from '../dto/user.dto';
import { JwtService } from './jwt.service';

@Injectable()
export class PortalUserService {
  private readonly SALT_ROUNDS = 12;

  constructor(private readonly jwtService: JwtService) {}

  async createUser(createUserDto: CreateUserDto): Promise<SignupResponseDto> {
    const { email, phone_number, password, ...userData } = createUserDto;

    try {
      // Check if user already exists with email or phone
      const existingUser = await this.findUserByEmailOrPhone(email, phone_number);
      if (existingUser) {
        throw new ConflictException('User with this email or phone number already exists');
      }

      // Generate salt and hash password
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, salt);

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
      };

      const access_token = this.jwtService.generateToken(tokenPayload);
      const expires_in = this.jwtService.getTokenExpirationTime();

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

  async findUserByEmailOrPhone(email: string, phone_number: string): Promise<any> {
    const query = `
      SELECT id, user_uuid, first_name, last_name, phone_number, email, class, created_at, updated_at
      FROM users 
      WHERE email = $1 OR phone_number = $2
    `;
    
    const result = await dbInstance.query(query, [email, phone_number]);
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

  async loginUser(loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    const { email, password } = loginUserDto;

    // Find user by email
    const query = `
      SELECT id, user_uuid, first_name, last_name, phone_number, email, password, salt, class, created_at, updated_at
      FROM users 
      WHERE email = $1
    `;
    
    const result = await dbInstance.query(query, [email]);
    const user = result.rows[0];
    
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const userResponse = {
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

    // Generate JWT token
    const tokenPayload = {
      sub: user.id,
      user_uuid: user.user_uuid,
      email: user.email,
      class: user.class
    };

    const access_token = this.jwtService.generateToken(tokenPayload);
    const expires_in = this.jwtService.getTokenExpirationTime();

    return {
      user: userResponse,
      access_token,
      token_type: 'Bearer',
      expires_in
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

    const { password, ...otherData } = updateData;
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

    // Handle password update if provided
    if (password) {
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, salt);
      updates.push(`password = $${paramCount}`, `salt = $${paramCount + 1}`);
      values.push(hashedPassword, salt);
      paramCount += 2;
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

