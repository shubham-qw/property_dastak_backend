import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { PortalUserService } from './Providers/portalUser.service';
import { JwtService } from './Providers/jwt.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  controllers: [UserController],
  providers: [PortalUserService, JwtService, JwtAuthGuard],
  exports: [PortalUserService, JwtService, JwtAuthGuard]
})
export class UserModule {}

