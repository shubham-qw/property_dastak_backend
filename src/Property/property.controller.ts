import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  UseGuards,
  Req,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PropertyService } from './Providers/property.service';
import { CreatePropertyDto, UpdatePropertyDto, PropertyResponseDto } from './dto/property.dto';
import { SavePropertiesBodyDto, SavePropertiesDto } from './dto/SaveProperty.dto';
import { JwtAuthGuard } from '../User/guards/jwt-auth.guard';

@Controller('properties')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(JwtAuthGuard)
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProperty(@Body() createPropertyDto: CreatePropertyDto, @Req() req: any): Promise<PropertyResponseDto> {

    const userId = req.user.user_uuid;

    return this.propertyService.createProperty(createPropertyDto, userId);
  }

  @Post(':id/media')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 },
  ], {
    storage: diskStorage({
      destination: './uploads',
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      }
    })
  }))
  @HttpCode(HttpStatus.CREATED)
  async uploadMedia(
    @Param('id') id: string,
    @UploadedFiles() files: { images?: any[]; video?: any[] }
  ) {
    const propertyId = parseInt(id);
    const items: Array<{ media_type: 'image' | 'video'; url: string }> = [];
    const base = '/uploads/';
    for (const f of files.images || []) items.push({ media_type: 'image', url: base + f.filename });
    for (const f of files.video || []) items.push({ media_type: 'video', url: base + f.filename });
    await this.propertyService.addMedia(propertyId, items);
    return { uploaded: items.length, items };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllProperties(@Req() req: any): Promise<PropertyResponseDto[]> {
    const userId = req.user.user_uuid;
    return this.propertyService.getAllProperties(userId);
  }

  @Get('/most-clicked')
  async mostClicked(@Query('limit') limitStr?: string) {
    const limit = limitStr ? Math.max(1, parseInt(limitStr, 10) || 1) : 1;
    const data = await this.propertyService.getMostClickedProperties(limit);

    //If user asked for a single and none found, return 404-like empty result
    if (limit === 1) {
      if (!data || data.length === 0) return { message: 'No property found' };
      return data[0];
    }

    return data;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPropertyById(@Param('id') id: string): Promise<PropertyResponseDto> {
    return this.propertyService.getPropertyById(parseInt(id));
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateProperty(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto
  ): Promise<PropertyResponseDto> {
    return this.propertyService.updateProperty(parseInt(id), updatePropertyDto);
  }


  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProperty(@Param('id') id: string): Promise<void> {
    return this.propertyService.deleteProperty(parseInt(id));
  }

  @Get('search/city/:city')
  @HttpCode(HttpStatus.OK)
  async getPropertiesByCity(@Param('city') city: string): Promise<PropertyResponseDto[]> {
    return this.propertyService.getPropertiesByCity(city);
  }

  @Get('search/type/:type')
  @HttpCode(HttpStatus.OK)
  async getPropertiesByType(@Param('type') type: string): Promise<PropertyResponseDto[]> {
    return this.propertyService.getPropertiesByType(type);
  }

  @Post('user/save')
  @HttpCode(HttpStatus.CREATED)
  async saveProperties(@Body() SavePropertiesBody: SavePropertiesBodyDto, @Req() req: any): Promise<void> {

    const userId = req.user.sub;
    const propertyId = SavePropertiesBody.propertyId;
    await this.propertyService.saveProperties(userId, propertyId);
  }

  @Get('user/save')
  @HttpCode(HttpStatus.OK)
  async getSaveProperties(@Req() req: any): Promise<SavePropertiesDto[]> {

    const userId = req.user.sub;
    const saveProperties = await this.propertyService.getSavedProperties(userId);
    return saveProperties 
  }
}
