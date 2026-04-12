import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';
import { UserModule } from '../User/user.module';
import { PropertyModule } from '../Property/property.module';
import { ReelsModule } from '../Reels/reels.module';

@Module({
  imports: [UserModule, PropertyModule, ReelsModule],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}
