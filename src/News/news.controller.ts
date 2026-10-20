import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { NewsService } from './Providers/news.service';
import { CreateNewsDto, UpdateNewsDto, NewsResponseDto } from './dto/news.dto';
import { JwtAuthGuard } from '../User/guards/jwt-auth.guard';
import { AdminGuard } from '../Admin/guards/admin.guard';

const imageUpload = FileInterceptor('image', {
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
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith('image/')) {
      return cb(new BadRequestException('only image files are allowed'), false);
    }
    cb(null, true);
  },
});

@Controller('news')
@UsePipes(new ValidationPipe({ transform: true }))
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async listLatestNews(): Promise<NewsResponseDto[]> {
    return this.newsService.listLatestNews();
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(imageUpload)
  @HttpCode(HttpStatus.CREATED)
  async createNews(
    @Body() dto: CreateNewsDto,
    @UploadedFile() file: any,
  ): Promise<NewsResponseDto> {
    if (!file) {
      throw new BadRequestException('image file is required');
    }
    const imagePath = '/uploads/' + file.filename;
    return this.newsService.createNews(dto, imagePath);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(imageUpload)
  @HttpCode(HttpStatus.OK)
  async updateNews(
    @Param('id') id: string,
    @Body() dto: UpdateNewsDto,
    @UploadedFile() file: any,
  ): Promise<NewsResponseDto> {
    const imagePath = file ? '/uploads/' + file.filename : undefined;
    return this.newsService.updateNews(parseInt(id, 10), dto, imagePath);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNews(@Param('id') id: string): Promise<void> {
    return this.newsService.deleteNews(parseInt(id, 10));
  }
}
