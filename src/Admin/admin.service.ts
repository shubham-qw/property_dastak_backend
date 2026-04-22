import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PropertyService } from '../Property/Providers/property.service';
import { ReelsService } from '../Reels/Providers/reels.service';
import { AdminVerifyDto } from './dto/admin.dto';
import dbInstance from '../Database/dbConn/nodeDB';

@Injectable()
export class AdminService {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly reelsService: ReelsService,
  ) {}

  listProperties(limit = 50, offset = 0) {
    return this.propertyService.listPropertiesForAdmin(limit, offset);
  }

  listReelsWithUser(limit = 50, offset = 0) {
    return this.reelsService.listReelsWithUserForAdmin(limit, offset);
  }

  async verify(dto: AdminVerifyDto) {
    if (dto.property_id == null && dto.reel_id == null) {
      throw new BadRequestException(
        'Provide at least one of property_id or reel_id',
      );
    }

    const result: {
      property_id?: number;
      reel_id?: number;
      is_verified: 'accepted' | 'rejected';
    } = { is_verified: dto.is_verified };

    if (dto.property_id != null) {
      const res = await dbInstance.query(
        `UPDATE properties
         SET is_verified = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id`,
        [dto.is_verified, dto.property_id],
      );
      if (!res.rowCount) {
        throw new NotFoundException(`Property ${dto.property_id} not found`);
      }
      result.property_id = dto.property_id;
    }

    if (dto.reel_id != null) {
      const res = await dbInstance.query(
        `UPDATE properties_reels
         SET is_verified = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id`,
        [dto.is_verified, dto.reel_id],
      );
      if (!res.rowCount) {
        throw new NotFoundException(`Reel ${dto.reel_id} not found`);
      }
      result.reel_id = dto.reel_id;
    }

    return result;
  }
}
