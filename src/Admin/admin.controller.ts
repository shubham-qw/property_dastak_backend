import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../User/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminService } from './admin.service';
import { AdminVerifyDto } from './dto/admin.dto';

@Controller('admin')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('properties')
  @HttpCode(HttpStatus.OK)
  listProperties(
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ) {
    const limit =
      limitStr !== undefined ? Math.min(200, Math.max(1, parseInt(limitStr, 10) || 50)) : 50;
    const offset =
      offsetStr !== undefined ? Math.max(0, parseInt(offsetStr, 10) || 0) : 0;
    return this.adminService.listProperties(limit, offset);
  }

  @Get('reels')
  @HttpCode(HttpStatus.OK)
  listReels(
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ) {
    const limit =
      limitStr !== undefined ? Math.min(200, Math.max(1, parseInt(limitStr, 10) || 50)) : 50;
    const offset =
      offsetStr !== undefined ? Math.max(0, parseInt(offsetStr, 10) || 0) : 0;
    return this.adminService.listReelsWithUser(limit, offset);
  }

  @Patch('verify')
  @HttpCode(HttpStatus.OK)
  verify(@Body() dto: AdminVerifyDto) {
    return this.adminService.verify(dto);
  }
}
