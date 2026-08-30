import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import dbInstance from '../../Database/dbConn/nodeDB';
import {
  ChatMessageDto,
  ConversationDto,
  ChatUserSummaryDto,
} from '../dto/chat.dto';

@Injectable()
export class ChatService {
  private onlineUserIds = new Set<number>();

  setUserOnline(userId: number) {
    this.onlineUserIds.add(userId);
  }

  setUserOffline(userId: number) {
    this.onlineUserIds.delete(userId);
  }

  isUserOnline(userId: number): boolean {
    return this.onlineUserIds.has(userId);
  }

  getOnlineUserIds(): number[] {
    return Array.from(this.onlineUserIds);
  }

  async resolveUserByUuid(userUuid: string): Promise<{ id: number; user_uuid: string }> {
    const res = await dbInstance.query(
      'SELECT id, user_uuid FROM users WHERE user_uuid = $1',
      [userUuid],
    );
    if (!res.rows.length) {
      throw new NotFoundException('User not found');
    }
    return res.rows[0];
  }

  async resolveUserById(userId: number): Promise<{ id: number; user_uuid: string; first_name: string; last_name: string }> {
    const res = await dbInstance.query(
      'SELECT id, user_uuid, first_name, last_name FROM users WHERE id = $1',
      [userId],
    );
    if (!res.rows.length) {
      throw new NotFoundException('User not found');
    }
    return res.rows[0];
  }

  private mapMessage(row: any): ChatMessageDto {
    return {
      id: Number(row.id),
      conversation_id: Number(row.conversation_id),
      sender_id: Number(row.sender_id),
      sender_uuid: row.sender_uuid,
      content: row.content,
      created_at: row.created_at,
      is_read: !!row.is_read,
    };
  }

  private mapUserSummary(row: any): ChatUserSummaryDto {
    return {
      id: Number(row.id),
      user_uuid: row.user_uuid,
      first_name: row.first_name,
      last_name: row.last_name,
      is_online: this.isUserOnline(Number(row.id)),
    };
  }

  async assertParticipant(conversationId: number, userId: number): Promise<void> {
    const res = await dbInstance.query(
      `
        SELECT 1
        FROM conversation_participants
        WHERE conversation_id = $1 AND user_id = $2
      `,
      [conversationId, userId],
    );
    if (!res.rows.length) {
      throw new ForbiddenException('Not a participant of this conversation');
    }
  }

  async findDirectConversationId(userA: number, userB: number): Promise<number | null> {
    const res = await dbInstance.query(
      `
        SELECT c.id
        FROM conversations c
        JOIN conversation_participants p1
          ON p1.conversation_id = c.id AND p1.user_id = $1
        JOIN conversation_participants p2
          ON p2.conversation_id = c.id AND p2.user_id = $2
        WHERE (
          SELECT COUNT(*) FROM conversation_participants cp
          WHERE cp.conversation_id = c.id
        ) = 2
        LIMIT 1
      `,
      [userA, userB],
    );
    return res.rows.length ? Number(res.rows[0].id) : null;
  }

  async getOrCreateDirectConversation(
    currentUserId: number,
    otherUserUuid: string,
  ): Promise<ConversationDto> {
    if (!otherUserUuid) {
      throw new BadRequestException('other_user_uuid is required');
    }

    const other = await this.resolveUserByUuid(otherUserUuid);
    if (other.id === currentUserId) {
      throw new BadRequestException('Cannot start a conversation with yourself');
    }

    let conversationId = await this.findDirectConversationId(currentUserId, other.id);

    if (!conversationId) {
      const client = await dbInstance.connection();
      try {
        await client.query('BEGIN');
        const conv = await client.query(
          `INSERT INTO conversations DEFAULT VALUES RETURNING id, created_at, updated_at`,
        );
        conversationId = Number(conv.rows[0].id);
        await client.query(
          `
            INSERT INTO conversation_participants (conversation_id, user_id)
            VALUES ($1, $2), ($1, $3)
          `,
          [conversationId, currentUserId, other.id],
        );
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }

    return this.getConversationForUser(conversationId, currentUserId);
  }

  async getConversationForUser(
    conversationId: number,
    userId: number,
  ): Promise<ConversationDto> {
    await this.assertParticipant(conversationId, userId);

    const res = await dbInstance.query(
      `
        SELECT
          c.id,
          c.created_at,
          c.updated_at,
          u.id AS other_id,
          u.user_uuid AS other_user_uuid,
          u.first_name AS other_first_name,
          u.last_name AS other_last_name,
          lm.id AS last_message_id,
          lm.conversation_id AS last_message_conversation_id,
          lm.sender_id AS last_message_sender_id,
          su.user_uuid AS last_message_sender_uuid,
          lm.content AS last_message_content,
          lm.created_at AS last_message_created_at,
          lm.is_read AS last_message_is_read,
          (
            SELECT COUNT(*)::int
            FROM chat_messages m
            WHERE m.conversation_id = c.id
              AND m.sender_id <> $2
              AND m.is_read = false
          ) AS unread_count
        FROM conversations c
        JOIN conversation_participants cp
          ON cp.conversation_id = c.id AND cp.user_id <> $2
        JOIN users u ON u.id = cp.user_id
        LEFT JOIN LATERAL (
          SELECT *
          FROM chat_messages
          WHERE conversation_id = c.id
          ORDER BY created_at DESC
          LIMIT 1
        ) lm ON true
        LEFT JOIN users su ON su.id = lm.sender_id
        WHERE c.id = $1
      `,
      [conversationId, userId],
    );

    if (!res.rows.length) {
      throw new NotFoundException('Conversation not found');
    }

    const row = res.rows[0];
    return {
      id: Number(row.id),
      created_at: row.created_at,
      updated_at: row.updated_at,
      other_user: this.mapUserSummary({
        id: row.other_id,
        user_uuid: row.other_user_uuid,
        first_name: row.other_first_name,
        last_name: row.other_last_name,
      }),
      last_message: row.last_message_id
        ? this.mapMessage({
            id: row.last_message_id,
            conversation_id: row.last_message_conversation_id,
            sender_id: row.last_message_sender_id,
            sender_uuid: row.last_message_sender_uuid,
            content: row.last_message_content,
            created_at: row.last_message_created_at,
            is_read: row.last_message_is_read,
          })
        : null,
      unread_count: row.unread_count ?? 0,
    };
  }

  async listConversations(userId: number): Promise<ConversationDto[]> {
    const res = await dbInstance.query(
      `
        SELECT
          c.id,
          c.created_at,
          c.updated_at,
          u.id AS other_id,
          u.user_uuid AS other_user_uuid,
          u.first_name AS other_first_name,
          u.last_name AS other_last_name,
          lm.id AS last_message_id,
          lm.conversation_id AS last_message_conversation_id,
          lm.sender_id AS last_message_sender_id,
          su.user_uuid AS last_message_sender_uuid,
          lm.content AS last_message_content,
          lm.created_at AS last_message_created_at,
          lm.is_read AS last_message_is_read,
          (
            SELECT COUNT(*)::int
            FROM chat_messages m
            WHERE m.conversation_id = c.id
              AND m.sender_id <> $1
              AND m.is_read = false
          ) AS unread_count
        FROM conversations c
        JOIN conversation_participants me
          ON me.conversation_id = c.id AND me.user_id = $1
        JOIN conversation_participants cp
          ON cp.conversation_id = c.id AND cp.user_id <> $1
        JOIN users u ON u.id = cp.user_id
        LEFT JOIN LATERAL (
          SELECT *
          FROM chat_messages
          WHERE conversation_id = c.id
          ORDER BY created_at DESC
          LIMIT 1
        ) lm ON true
        LEFT JOIN users su ON su.id = lm.sender_id
        ORDER BY COALESCE(lm.created_at, c.updated_at) DESC
      `,
      [userId],
    );

    return res.rows.map((row: any) => ({
      id: Number(row.id),
      created_at: row.created_at,
      updated_at: row.updated_at,
      other_user: this.mapUserSummary({
        id: row.other_id,
        user_uuid: row.other_user_uuid,
        first_name: row.other_first_name,
        last_name: row.other_last_name,
      }),
      last_message: row.last_message_id
        ? this.mapMessage({
            id: row.last_message_id,
            conversation_id: row.last_message_conversation_id,
            sender_id: row.last_message_sender_id,
            sender_uuid: row.last_message_sender_uuid,
            content: row.last_message_content,
            created_at: row.last_message_created_at,
            is_read: row.last_message_is_read,
          })
        : null,
      unread_count: row.unread_count ?? 0,
    }));
  }

  async listMessages(
    conversationId: number,
    userId: number,
    limit = 50,
    offset = 0,
  ): Promise<ChatMessageDto[]> {
    await this.assertParticipant(conversationId, userId);

    const res = await dbInstance.query(
      `
        SELECT
          m.id,
          m.conversation_id,
          m.sender_id,
          u.user_uuid AS sender_uuid,
          m.content,
          m.created_at,
          m.is_read
        FROM chat_messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.conversation_id = $1
        ORDER BY m.created_at DESC
        LIMIT $2 OFFSET $3
      `,
      [conversationId, limit, offset],
    );

    return res.rows.map((row: any) => this.mapMessage(row));
  }

  async sendMessage(
    senderId: number,
    opts: { conversationId?: number; toUserUuid?: string; content: string },
  ): Promise<{ message: ChatMessageDto; participantIds: number[] }> {
    const content = (opts.content || '').trim();
    if (!content) {
      throw new BadRequestException('Message content is required');
    }

    let conversationId = opts.conversationId;

    if (!conversationId) {
      if (!opts.toUserUuid) {
        throw new BadRequestException('conversation_id or to_user_uuid is required');
      }
      const conv = await this.getOrCreateDirectConversation(senderId, opts.toUserUuid);
      conversationId = conv.id;
    } else {
      await this.assertParticipant(conversationId, senderId);
    }

    const sender = await this.resolveUserById(senderId);

    const insert = await dbInstance.query(
      `
        INSERT INTO chat_messages (conversation_id, sender_id, content)
        VALUES ($1, $2, $3)
        RETURNING id, conversation_id, sender_id, content, created_at, is_read
      `,
      [conversationId, senderId, content],
    );

    await dbInstance.query(
      `UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [conversationId],
    );

    const message = this.mapMessage({
      ...insert.rows[0],
      sender_uuid: sender.user_uuid,
    });

    const participants = await dbInstance.query(
      `SELECT user_id FROM conversation_participants WHERE conversation_id = $1`,
      [conversationId],
    );

    return {
      message,
      participantIds: participants.rows.map((r: any) => Number(r.user_id)),
    };
  }

  async markConversationRead(conversationId: number, userId: number): Promise<void> {
    await this.assertParticipant(conversationId, userId);

    await dbInstance.query(
      `
        UPDATE chat_messages
        SET is_read = true
        WHERE conversation_id = $1
          AND sender_id <> $2
          AND is_read = false
      `,
      [conversationId, userId],
    );

    await dbInstance.query(
      `
        UPDATE conversation_participants
        SET last_read_at = CURRENT_TIMESTAMP
        WHERE conversation_id = $1 AND user_id = $2
      `,
      [conversationId, userId],
    );
  }

  async getParticipantIds(conversationId: number): Promise<number[]> {
    const res = await dbInstance.query(
      `SELECT user_id FROM conversation_participants WHERE conversation_id = $1`,
      [conversationId],
    );
    return res.rows.map((r: any) => Number(r.user_id));
  }

  async getPresenceByUuids(
    userUuids: string[],
  ): Promise<Array<{ user_uuid: string; status: 'online' | 'offline' }>> {
    if (!userUuids?.length) return [];

    const res = await dbInstance.query(
      `SELECT id, user_uuid FROM users WHERE user_uuid = ANY($1::uuid[])`,
      [userUuids],
    );

    return res.rows.map((row: any) => ({
      user_uuid: row.user_uuid,
      status: this.isUserOnline(Number(row.id)) ? 'online' : 'offline',
    }));
  }
}
