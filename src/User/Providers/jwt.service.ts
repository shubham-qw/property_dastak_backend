import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt.config';

interface JwtPayload {
  sub: number;
  user_uuid: string;
  email: string;
  class: string;
}

@Injectable()
export class JwtService {
  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.signOptions.expiresIn,
    } as jwt.SignOptions);
  }

  verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret);
      
      return decoded as unknown as JwtPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  decodeToken(token: string): JwtPayload | null {
    const decoded = jwt.decode(token);
    return decoded as unknown as JwtPayload | null;
  }

  getTokenExpirationTime(): number {
    const expiresIn = jwtConfig.signOptions.expiresIn;
    if (typeof expiresIn === 'string') {
      // Convert string like '24h' to seconds
      const unit = expiresIn.slice(-1);
      const value = parseInt(expiresIn.slice(0, -1));
      
      switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 60 * 60;
        case 'd': return value * 60 * 60 * 24;
        default: return 24 * 60 * 60; // Default to 24 hours
      }
    }
    return 24 * 60 * 60; // Default to 24 hours in seconds
  }
}
