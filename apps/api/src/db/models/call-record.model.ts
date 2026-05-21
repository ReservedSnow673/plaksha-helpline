import type { CallDirection, CallProvider, CallStatus, Language } from '@plaksha/shared-types';
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

@Table({ tableName: 'call_records', timestamps: true, underscored: true })
export class CallRecord extends Model<CallRecord> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Index('call_records_incident_id')
  @Column({ type: DataType.UUID, allowNull: true })
  declare incidentId: string | null;

  @Column({ type: DataType.STRING(16), allowNull: false })
  declare provider: CallProvider;

  @Index({ name: 'call_records_provider_sid', unique: true })
  @Column({ type: DataType.STRING(128), allowNull: false })
  declare providerCallSid: string;

  @Column({ type: DataType.STRING(16), allowNull: false })
  declare direction: CallDirection;

  @Index('call_records_from')
  @Column({ type: DataType.STRING(32), allowNull: false })
  declare fromE164: string;

  @Column({ type: DataType.STRING(32), allowNull: false })
  declare toE164: string;

  @Column({ type: DataType.STRING(8), allowNull: true })
  declare language: Language | null;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: [] })
  declare ivrPath: string[];

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare startedAt: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  declare answeredAt: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare endedAt: Date | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare durationSeconds: number | null;

  @Column({ type: DataType.STRING(16), allowNull: false, defaultValue: 'RINGING' })
  declare status: CallStatus;

  @Column({ type: DataType.STRING(512), allowNull: true })
  declare recordingUrl: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare recordingConsent: boolean;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
