import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './Providers/news.service';
import { UserModule } from '../User/user.module';
import { AdminGuard } from '../Admin/guards/admin.guard';

@Module({
  imports: [UserModule],
  controllers: [NewsController],
  providers: [NewsService, AdminGuard],
})
export class NewsModule {}
