import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { ReelsService } from './Providers/reels.service';
import { CreateReelDto, UpdateReelDto, ReelResponseDto } from './dto/reel.dto';
import { JwtAuthGuard } from '../User/guards/jwt-auth.guard';

@Controller('reels')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(JwtAuthGuard)
export class ReelsController {
  constructor(private readonly reelsService: ReelsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = './uploads';
          try {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          } catch (e) {
            // ignore; multer will throw if it truly can't write
          }
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async createReel(
    @Body() dto: CreateReelDto,
    @UploadedFile() file: any,
    @Req() _req: any,
  ): Promise<ReelResponseDto> {
    // If later you want user-based attribution, you can use req.user here.
    if (!file) {
      throw new BadRequestException('video file is required');
    }
    const mediaPath = '/uploads/' + file.filename;
    return this.reelsService.createReel(dto, mediaPath);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listReels(
    @Req() req: any,
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ): Promise<ReelResponseDto[]> {
    const userId: string | null = req.user?.user_uuid ?? null;
    const limit =
      limitStr !== undefined ? Math.max(1, parseInt(limitStr, 10) || 1) : 20;
    const offset =
      offsetStr !== undefined ? Math.max(0, parseInt(offsetStr, 10) || 0) : 0;

    return this.reelsService.listReels({
      userId,
      limit,
      offset,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getReelById(@Param('id') id: string): Promise<ReelResponseDto> {
    return this.reelsService.getReelById(parseInt(id, 10));
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateReel(
    @Param('id') id: string,
    @Body() dto: UpdateReelDto,
  ): Promise<ReelResponseDto> {
    return this.reelsService.updateReel(parseInt(id, 10), dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReel(@Param('id') id: string): Promise<void> {
    return this.reelsService.deleteReel(parseInt(id, 10));
  }
}

