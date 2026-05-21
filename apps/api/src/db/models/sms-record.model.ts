import type { CallDirection, CallProvider } from '@plaksha/shared-types';
import {
  Column,
  CreatedAt,
  DataType,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({ tableName: 'sms_records', timestamps: true, updatedAt: false, underscored: true })
export class SmsRecord extends Model<SmsRecord> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Index('sms_records_incident_id')
  @Column({ type: DataType.UUID, allowNull: true })
  declare incidentId: string | null;

  @Column({ type: DataType.STRING(16), allowNull: false })
  declare provider: CallProvider;

  @Index({ name: 'sms_records_provider_id_unique', unique: true })
  @Column({ type: DataType.STRING(128), allowNull: false })
  declare providerMessageId: string;

  @Column({ type: DataType.STRING(16), allowNull: false })
  declare direction: CallDirection;

  @Index('sms_records_from')
  @Column({ type: DataType.STRING(32), allowNull: false })
  declare fromE164: string;

  @Column({ type: DataType.STRING(32), allowNull: false })
  declare toE164: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare body: string;

  @Column({ type: DataType.STRING(16), allowNull: false, defaultValue: 'QUEUED' })
  declare status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';

  @CreatedAt
  declare createdAt: Date;
}
