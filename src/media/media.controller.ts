import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { MediaService } from './media.service';

type MediaType = 'image' | 'video';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // Example: GET /media?fileName=sample.mp4&mediaType=video
  @Get()
  async streamByQuery(
    @Query('fileName') fileName: string,
    @Query('mediaType') mediaType: MediaType,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!fileName) {
      return res.status(400).json({ error: 'fileName query parameter is required' });
    }
    if (!mediaType || (mediaType !== 'image' && mediaType !== 'video')) {
      return res.status(400).json({ error: "mediaType query parameter must be 'image' or 'video'" });
    }

    // Resolve safe path and stats
    let fullPath: string;
    try {
      fullPath = this.mediaService.resolvePath(fileName);
    } catch (err: any) {
      return res.status(err.status || 404).json({ error: err.message || 'File not found' });
    }

    const mimeType = this.mediaService.getMimeTypeFromExt(fileName);

    if (mediaType === 'image') {
      // Serve image: browsers expect the full file (no Range usually)
      res.setHeader('Content-Type', mimeType);
      const stream = this.mediaService.createReadStream(fullPath);
      stream.on('error', (err) => {
        console.error('Image stream error', err);
        if (!res.headersSent) res.sendStatus(500);
      });
      return stream.pipe(res);
    }

    // mediaType === 'video' -> support Range requests
    const stat = this.mediaService.getStats(fullPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
      // No range -> send entire file (may be large)
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', String(fileSize));
      const stream = this.mediaService.createReadStream(fullPath);
      stream.on('error', (err) => {
        console.error('Video stream error', err);
        if (!res.headersSent) res.sendStatus(500);
      });
      return stream.pipe(res);
    }

    // Parse Range header: "bytes=start-end"
    const parts = (range || '').replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    // Validate the range
    if (isNaN(start) || isNaN(end) || start >= fileSize || end >= fileSize || start > end) {
      res.status(416).setHeader('Content-Range', `bytes */${fileSize}`).end();
      return;
    }

    const chunkSize = end - start + 1;
    const stream = this.mediaService.createReadStream(fullPath, start, end);

    res.status(206).set({
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': String(chunkSize),
      'Content-Type': mimeType,
    });

    stream.on('error', (err) => {
      console.error('Video stream error', err);
      if (!res.headersSent) res.sendStatus(500);
    });

    return stream.pipe(res);
  }
}
