import { Module } from '@nestjs/common';
import { PropertyController } from './property.controller';
import { PropertyService } from './Providers/property.service';
import { UserModule } from '../User/user.module';

@Module({
  imports: [UserModule],
  controllers: [PropertyController],
  providers: [PropertyService],
  exports: [PropertyService]
})
export class PropertyModule {}
