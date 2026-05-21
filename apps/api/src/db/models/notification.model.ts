import type { NotificationChannel, NotificationStatus, Priority } from '@plaksha/shared-types';
import {
  Column,
  CreatedAt,
  DataType,
  Index,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'notifications', timestamps: true, underscored: true })
export class Notification extends Model<Notification> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Index('notifications_user_id')
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @Column({ type: DataType.STRING(16), allowNull: false })
  declare channel: NotificationChannel;

  @Column({ type: DataType.UUID, allowNull: true })
  declare incidentId: string | null;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare payload: Record<string, unknown>;

  @Column({ type: DataType.STRING(4), allowNull: false, defaultValue: 'P3' })
  declare priority: Priority;

  @Index('notifications_status')
  @Column({ type: DataType.STRING(16), allowNull: false, defaultValue: 'QUEUED' })
  declare status: NotificationStatus;

  @Column({ type: DataType.STRING(128), allowNull: true })
  declare providerMessageId: string | null;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare attemptCount: number;

  @Column({ type: DataType.DATE, allowNull: true })
  declare lastAttemptAt: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare deliveredAt: Date | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare error: string | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
