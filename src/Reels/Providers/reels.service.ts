import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import dbInstance from '../../Database/dbConn/nodeDB';
import {
  CreateReelDto,
  UpdateReelDto,
  ReelResponseDto,
  ReelWithUserResponseDto,
} from '../dto/reel.dto';

type ReelListParams = {
  userId?: string | null;
  limit: number;
  offset: number;
};

type ReelRow = {
  id: number;
  description: string | null;
  media_path: string;
  thumbnail_path: string | null;
  duration_seconds: number | null;
  views_count: string | number;
  likes_count: string | number;
  is_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

type ReelListAlgorithm = (params: ReelListParams) => Promise<ReelRow[]>;

@Injectable()
export class ReelsService {
  // Pluggable strategy for listing reels
  private listAlgorithm: ReelListAlgorithm;

  constructor() {
    // Default strategy: simple DB fetch
    this.listAlgorithm = this.defaultListAlgorithm.bind(this);
  }

  setListAlgorithm(algorithm: ReelListAlgorithm) {
    this.listAlgorithm = algorithm;
  }

  private async defaultListAlgorithm(params: ReelListParams): Promise<ReelRow[]> {
    const values: any[] = [];
    let where = 'WHERE is_active = true';

    values.push(params.limit);
    const limitIndex = values.length;
    values.push(params.offset);
    const offsetIndex = values.length;

    const sql = `
      SELECT
        id,
        description,
        media_path,
        thumbnail_path,
        duration_seconds,
        views_count,
        likes_count,
        is_verified,
        is_active,
        created_at,
        updated_at
      FROM properties_reels
      ${where}
      ORDER BY created_at DESC
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `;

    const res = await dbInstance.query(sql, values);
    return res.rows as ReelRow[];
  }

  private mapRowToDto(row: ReelRow): ReelResponseDto {
    return {
      id: row.id,
      description: row.description,
      media_path: row.media_path,
      thumbnail_path: row.thumbnail_path,
      duration_seconds: row.duration_seconds,
      views_count: typeof row.views_count === 'string' ? parseInt(row.views_count, 10) : row.views_count,
      likes_count: typeof row.likes_count === 'string' ? parseInt(row.likes_count, 10) : row.likes_count,
      is_verified: row.is_verified,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async createReel(
    dto: CreateReelDto,
    mediaPath: string,
    createdByUserUuid?: string | null,
  ): Promise<ReelResponseDto> {
    const sql = `
      INSERT INTO properties_reels (
        description,
        media_path,
        thumbnail_path,
        duration_seconds,
        is_verified,
        is_active,
        created_by
      ) VALUES ($1, $2, $3, $4, COALESCE($5, false), COALESCE($6, true), $7)
      RETURNING *
    `;

    const values = [
      dto.description ?? null,
      mediaPath,
      dto.thumbnail_path ?? null,
      dto.duration_seconds ?? null,
      dto.is_verified ?? null,
      dto.is_active ?? null,
      createdByUserUuid ?? null,
    ];

    try {
      const res = await dbInstance.query(sql, values);
      const row = res.rows[0] as ReelRow;
      return this.mapRowToDto(row);
    } catch (e: any) {
      throw new BadRequestException(`Failed to create reel: ${e.message}`);
    }
  }

  async getReelById(id: number): Promise<ReelResponseDto> {
    const sql = `
      SELECT *
      FROM properties_reels
      WHERE id = $1
    `;
    const res = await dbInstance.query(sql, [id]);

    if (!res.rows.length) {
      throw new NotFoundException('Reel not found');
    }

    return this.mapRowToDto(res.rows[0] as ReelRow);
  }

  async updateReel(id: number, dto: UpdateReelDto): Promise<ReelResponseDto> {
    // Ensure reel exists
    await this.getReelById(id);

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    (Object.entries(dto) as [keyof UpdateReelDto, any][]).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    });

    if (!fields.length) {
      return this.getReelById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    const sql = `
      UPDATE properties_reels
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    values.push(id);

    try {
      const res = await dbInstance.query(sql, values);
      return this.mapRowToDto(res.rows[0] as ReelRow);
    } catch (e: any) {
      throw new BadRequestException(`Failed to update reel: ${e.message}`);
    }
  }

  async deleteReel(id: number): Promise<void> {
    // For now perform a hard delete. You can switch to soft delete
    // by updating is_active=false instead.
    const sql = 'DELETE FROM properties_reels WHERE id = $1';
    const res = await dbInstance.query(sql, [id]);

    if (!res.rowCount) {
      throw new NotFoundException('Reel not found');
    }
  }

  async listReels(params: ReelListParams): Promise<ReelResponseDto[]> {
    const rows = await this.listAlgorithm(params);
    return rows.map((row) => this.mapRowToDto(row));
  }

  async listReelsWithUserForAdmin(
    limit: number,
    offset: number,
  ): Promise<ReelWithUserResponseDto[]> {
    const sql = `
      SELECT
        pr.id,
        pr.description,
        pr.media_path,
        pr.thumbnail_path,
        pr.duration_seconds,
        pr.views_count,
        pr.likes_count,
        pr.is_verified,
        pr.is_active,
        pr.created_at,
        pr.updated_at,
        u.id AS creator_user_id,
        u.user_uuid AS creator_user_uuid,
        u.first_name AS creator_first_name,
        u.last_name AS creator_last_name,
        u.phone_number AS creator_phone_number,
        u.email AS creator_email,
        u.class AS creator_class
      FROM properties_reels pr
      LEFT JOIN users u ON u.user_uuid = pr.created_by
      ORDER BY pr.created_at DESC
      LIMIT $1
      OFFSET $2
    `;

    const res = await dbInstance.query(sql, [limit, offset]);
    return res.rows.map((row: any) => {
      const reel = this.mapRowToDto(row as ReelRow);
      const user =
        row.creator_user_id != null
          ? {
              id: row.creator_user_id,
              user_uuid: row.creator_user_uuid,
              first_name: row.creator_first_name,
              last_name: row.creator_last_name,
              phone_number: row.creator_phone_number,
              email: row.creator_email,
              class: row.creator_class,
            }
          : null;
      return { ...reel, user };
    });
  }
}


