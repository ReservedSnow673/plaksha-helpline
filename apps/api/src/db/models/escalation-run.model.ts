import type { EscalationOutcome } from '@plaksha/shared-types';
import {
  Column,
  CreatedAt,
  DataType,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({ tableName: 'escalation_runs', timestamps: true, updatedAt: false, underscored: true })
export class EscalationRun extends Model<EscalationRun> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Index('escalation_run_incident')
  @Column({ type: DataType.UUID, allowNull: false })
  declare incidentId: string;

  @Column({ type: DataType.UUID, allowNull: false })
  declare policyId: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare levelIndex: number;

  @Column({ type: DataType.DATE, allowNull: false })
  declare scheduledFor: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  declare firedAt: Date | null;

  @Column({ type: DataType.STRING(32), allowNull: true })
  declare outcome: EscalationOutcome | null;

  @Column({ type: DataType.STRING(128), allowNull: true })
  declare jobId: string | null;

  @CreatedAt
  declare createdAt: Date;
}
