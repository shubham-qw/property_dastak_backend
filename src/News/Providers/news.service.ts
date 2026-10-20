import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import dbInstance from '../../Database/dbConn/nodeDB';
import { CreateNewsDto, UpdateNewsDto, NewsResponseDto } from '../dto/news.dto';

type NewsRow = {
  id: number;
  title: string;
  image: string;
  created_at: Date;
  news_url : string;
};

@Injectable()
export class NewsService {
  private mapRowToDto(row: NewsRow): NewsResponseDto {
    return {
      id: row.id,
      title: row.title,
      image: row.image,
      created_at: row.created_at,
      news_url : row.news_url
    };
  }

  async createNews(dto: CreateNewsDto, imagePath: string): Promise<NewsResponseDto> {
    const sql = `
      INSERT INTO news (title, image, news_url)
      VALUES ($1, $2,$3)
      RETURNING id, title, image, created_at, news_url
    `;

    try {
      const res = await dbInstance.query(sql, [dto.title, imagePath,dto.news_url]);
      return this.mapRowToDto(res.rows[0] as NewsRow);
    } catch (e: any) {
      throw new BadRequestException(`Failed to create news: ${e.message}`);
    }
  }

  async listLatestNews(): Promise<NewsResponseDto[]> {
    const sql = `
      SELECT id, title, image, created_at, news_url
      FROM news
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const res = await dbInstance.query(sql);
    return (res.rows as NewsRow[]).map((row) => this.mapRowToDto(row));
  }

  async updateNews(
    id: number,
    dto: UpdateNewsDto,
    imagePath?: string,
  ): Promise<NewsResponseDto> {
    const existing = await dbInstance.query(
      'SELECT id, title, image, created_at, news_url FROM news WHERE id = $1',
      [id],
    );
    if (!existing.rows.length) {
      throw new NotFoundException('News not found');
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.title !== undefined) {
      fields.push(`title = $${idx}`);
      values.push(dto.title);
      idx++;
    }

    if (dto.news_url !== undefined) {
      fields.push(`news_url = $${idx}`);
      values.push(dto.news_url);
      idx++;
    }

    if (imagePath) {
      fields.push(`image = $${idx}`);
      values.push(imagePath);
      idx++;
    }

    if (!fields.length) {
      return this.mapRowToDto(existing.rows[0] as NewsRow);
    }

    const sql = `
      UPDATE news
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, title, image, created_at, news_url
    `;
    values.push(id);

    try {
      const res = await dbInstance.query(sql, values);
      return this.mapRowToDto(res.rows[0] as NewsRow);
    } catch (e: any) {
      throw new BadRequestException(`Failed to update news: ${e.message}`);
    }
  }

  async deleteNews(id: number): Promise<void> {
    const res = await dbInstance.query('DELETE FROM news WHERE id = $1', [id]);
    if (!res.rowCount) {
      throw new NotFoundException('News not found');
    }
  }
}
