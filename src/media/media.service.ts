import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { existsSync, statSync, createReadStream, readdirSync, mkdirSync, writeFileSync } from 'fs';
import { join, normalize, extname } from 'path';

@Injectable()
export class MediaService {
  // Single uploads folder at project root
  private uploadsRoot = process.cwd();
  //normalize(join(process.cwd(), 'uploads'));

  constructor() {
    // ensure uploads dir exists
    if (!existsSync(this.uploadsRoot)) mkdirSync(this.uploadsRoot, { recursive: true });
  }

  // Prevent path traversal and ensure file exists
  resolvePath(filename: string) {
    if (!filename) throw new BadRequestException('filename required');
    const safeName = filename.replace(/\0/g, '');
    const fullPath = normalize(join(this.uploadsRoot, safeName));
    if (!fullPath.startsWith(this.uploadsRoot)) {
      throw new NotFoundException('Invalid filename');
    }
    if (!existsSync(fullPath)) {
      throw new NotFoundException('File not found');
    }
    return fullPath;
  }

  getStats(fullPath: string) {
    return statSync(fullPath);
  }

  createReadStream(fullPath: string, start?: number, end?: number) {
    return createReadStream(fullPath, start !== undefined && end !== undefined ? { start, end } : undefined);
  }

  listFiles() {
    return readdirSync(this.uploadsRoot).filter(Boolean);
  }

  getMimeTypeFromExt(filename: string) {
    const ext = extname(filename).toLowerCase();
    const map: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.mkv': 'video/x-matroska',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.ogg': 'video/ogg',
    };
    return map[ext] || 'application/octet-stream';
  }

  // Optional helper to save a buffer to uploads (if needed later)
  saveFile(buffer: Buffer, destFileName: string) {
    const dest = normalize(join(this.uploadsRoot, destFileName));
    if (!dest.startsWith(this.uploadsRoot)) throw new BadRequestException('Invalid destination');
    const parent = dest.replace(/\\/g, '/').split('/').slice(0, -1).join('/');
    if (!existsSync(parent)) mkdirSync(parent, { recursive: true });
    writeFileSync(dest, buffer);
    return dest;
  }
}