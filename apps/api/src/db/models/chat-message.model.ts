import {
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { ChatThread } from './chat-thread.model';

@Table({ tableName: 'chat_messages', timestamps: true, updatedAt: false, underscored: true })
export class ChatMessage extends Model<ChatMessage> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => ChatThread)
  @Index('chat_messages_thread_id')
  @Column({ type: DataType.UUID, allowNull: false })
  declare threadId: string;

  @Column({ type: DataType.UUID, allowNull: true })
  declare senderUserId: string | null;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare body: string;

  @Column({ type: DataType.STRING(512), allowNull: true })
  declare attachmentUrl: string | null;

  @Column({ type: DataType.STRING(64), allowNull: true })
  declare attachmentType: string | null;

  @Column({ type: DataType.STRING(128), allowNull: true })
  declare clientMessageId: string | null;

  @CreatedAt
  declare createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  declare readAt: Date | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare system: boolean;
}
