import { Module } from '@nestjs/common';
import { ReelsController } from './reels.controller';
import { ReelsService } from './Providers/reels.service';
import { UserModule } from '../User/user.module';

@Module({
  imports: [UserModule],
  controllers: [ReelsController],
  providers: [ReelsService],
  exports: [ReelsService],
})
export class ReelsModule {}


