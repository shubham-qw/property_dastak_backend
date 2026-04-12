import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './User/user.module';
import { PropertyModule } from './Property/property.module';
import { LeadsModule } from './Leads/leads.module';
import { MediaModule } from './media/media.module';
import { ReelsModule } from './Reels/reels.module';
import { AdminModule } from './Admin/admin.module';

@Module({
  imports: [
    UserModule,
    PropertyModule,
    LeadsModule,
    MediaModule,
    ReelsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
