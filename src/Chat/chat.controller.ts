import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../User/guards/jwt-auth.guard';
import { ChatService } from './Providers/chat.service';
import {
  ConversationDto,
  ChatMessageDto,
  GetMessagesQueryDto,
  StartConversationDto,
  SendMessageDto,
} from './dto/chat.dto';
import { ChatGateway } from './Providers/chat.gateway';

@Controller('chat')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get('conversations')
  @HttpCode(HttpStatus.OK)
  async listConversations(@Req() req: any): Promise<ConversationDto[]> {
    return this.chatService.listConversations(Number(req.user.sub));
  }

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  async startConversation(
    @Body() dto: StartConversationDto,
    @Req() req: any,
  ): Promise<ConversationDto> {
    return this.chatService.getOrCreateDirectConversation(
      Number(req.user.sub),
      dto.other_user_uuid,
    );
  }

  @Get('conversations/:id/messages')
  @HttpCode(HttpStatus.OK)
  async getMessages(
    @Param('id') id: string,
    @Query() query: GetMessagesQueryDto,
    @Req() req: any,
  ): Promise<ChatMessageDto[]> {
    return this.chatService.listMessages(
      parseInt(id, 10),
      Number(req.user.sub),
      query.limit ?? 50,
      query.offset ?? 0,
    );
  }

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(@Body() dto: SendMessageDto, @Req() req: any) {
    const userId = Number(req.user.sub);
    const { message, participantIds } = await this.chatService.sendMessage(
      userId,
      {
        conversationId: dto.conversation_id,
        toUserUuid: dto.to_user_uuid,
        content: dto.content,
      },
    );

    // Fan-out over WS so online peers get the message live
    for (const pid of participantIds) {
      this.chatGateway.sendToUser(pid, { type: 'message', message });
    }

    return message;
  }

  @Put('conversations/:id/read')
  @HttpCode(HttpStatus.OK)
  async markRead(@Param('id') id: string, @Req() req: any) {
    await this.chatService.markConversationRead(
      parseInt(id, 10),
      Number(req.user.sub),
    );
    return { ok: true };
  }

  @Get('presence/:userUuid')
  @HttpCode(HttpStatus.OK)
  async getPresence(@Param('userUuid') userUuid: string) {
    const [presence] = await this.chatService.getPresenceByUuids([userUuid]);
    return (
      presence || {
        user_uuid: userUuid,
        status: 'offline' as const,
      }
    );
  }
}
