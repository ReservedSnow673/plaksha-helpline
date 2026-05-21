import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { ChatMessage } from './chat-message.model';
import { Incident } from './incident.model';

@Table({ tableName: 'chat_threads', timestamps: true, updatedAt: false, underscored: true })
export class ChatThread extends Model<ChatThread> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => Incident)
  @Index({ name: 'chat_threads_incident_unique', unique: true })
  @Column({ type: DataType.UUID, allowNull: false })
  declare incidentId: string;

  @CreatedAt
  declare createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  declare closedAt: Date | null;

  @BelongsTo(() => Incident)
  declare incident?: Incident;

  @HasMany(() => ChatMessage, { foreignKey: 'threadId' })
  declare messages?: ChatMessage[];
}
