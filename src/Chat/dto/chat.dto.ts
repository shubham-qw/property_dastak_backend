import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StartConversationDto {
  @IsUUID()
  other_user_uuid: string;
}

export class SendMessageDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  conversation_id?: number;

  @IsOptional()
  @IsUUID()
  to_user_uuid?: string;

  @IsString()
  @MaxLength(4000)
  content: string;
}

export class GetMessagesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

export class MarkReadDto {
  @Type(() => Number)
  @IsInt()
  conversation_id: number;
}

export type ChatUserSummaryDto = {
  id: number;
  user_uuid: string;
  first_name: string;
  last_name: string;
  is_online: boolean;
};

export type ChatMessageDto = {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_uuid: string;
  content: string;
  created_at: Date;
  is_read: boolean;
};

export type ConversationDto = {
  id: number;
  created_at: Date;
  updated_at: Date;
  other_user: ChatUserSummaryDto;
  last_message: ChatMessageDto | null;
  unread_count: number;
};

/** Client → Server WS event types */
export type ClientWsEvent =
  | { type: 'ping' }
  | { type: 'join'; conversation_id: number }
  | { type: 'leave'; conversation_id: number }
  | { type: 'send_message'; conversation_id?: number; to_user_uuid?: string; content: string }
  | { type: 'typing'; conversation_id: number; is_typing: boolean }
  | { type: 'mark_read'; conversation_id: number }
  | { type: 'get_presence'; user_uuids: string[] };

/** Server → Client WS event types */
export type ServerWsEvent =
  | { type: 'connected'; user_id: number; user_uuid: string; reconnect: boolean }
  | { type: 'pong'; ts: number }
  | { type: 'message'; message: ChatMessageDto }
  | { type: 'typing'; conversation_id: number; user_id: number; user_uuid: string; is_typing: boolean }
  | { type: 'presence'; user_uuid: string; status: 'online' | 'offline' }
  | { type: 'presence_list'; users: Array<{ user_uuid: string; status: 'online' | 'offline' }> }
  | { type: 'conversation_updated'; conversation: ConversationDto }
  | { type: 'error'; code: string; message: string };
