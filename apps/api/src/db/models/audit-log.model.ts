import type { Role } from '@plaksha/shared-types';
import {
  Column,
  CreatedAt,
  DataType,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({ tableName: 'audit_logs', timestamps: true, updatedAt: false, underscored: true })
export class AuditLog extends Model<AuditLog> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Column({ type: DataType.UUID, allowNull: true })
  declare actorUserId: string | null;

  @Column({ type: DataType.STRING(32), allowNull: true })
  declare actorRole: Role | null;

  @Index('audit_logs_action')
  @Column({ type: DataType.STRING(64), allowNull: false })
  declare action: string;

  @Index('audit_logs_resource')
  @Column({ type: DataType.STRING(64), allowNull: false })
  declare resourceType: string;

  @Column({ type: DataType.STRING(128), allowNull: true })
  declare resourceId: string | null;

  @Column({ type: DataType.STRING(64), allowNull: true })
  declare ip: string | null;

  @Column({ type: DataType.STRING(512), allowNull: true })
  declare userAgent: string | null;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare before: Record<string, unknown> | null;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare after: Record<string, unknown> | null;

  @Index('audit_logs_occurred_at')
  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare occurredAt: Date;

  @CreatedAt
  declare createdAt: Date;
}
