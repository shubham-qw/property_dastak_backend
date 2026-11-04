import { Module } from '@nestjs/common';
import { MapsController } from './maps.controller';
import { MapsService } from './Providers/maps.service';
import { GoogleMapsProvider } from './Providers/google/google-maps.provider';
import { MAPS_PROVIDER } from './Providers/maps.provider.interface';
import { UserModule } from '../User/user.module';

@Module({
  imports: [UserModule],
  controllers: [MapsController],
  providers: [
    MapsService,
    {
      provide: MAPS_PROVIDER,
      useClass: GoogleMapsProvider,
    },
  ],
})
export class MapsModule {}
