import { Module } from '@nestjs/common';
import { UserModule } from '../User/user.module';
import { ChatController } from './chat.controller';
import { ChatService } from './Providers/chat.service';
import { ChatGateway } from './Providers/chat.gateway';

@Module({
  imports: [UserModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
