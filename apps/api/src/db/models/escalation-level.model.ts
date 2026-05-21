import type { EscalationAction, Role } from '@plaksha/shared-types';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { EscalationPolicy } from './escalation-policy.model';

@Table({ tableName: 'escalation_levels', timestamps: false, underscored: true })
export class EscalationLevel extends Model<EscalationLevel> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => EscalationPolicy)
  @Index('escalation_level_policy_id')
  @Column({ type: DataType.UUID, allowNull: false })
  declare policyId: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare levelIndex: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare triggerAfterSeconds: number;

  @Column({ type: DataType.STRING(32), allowNull: false })
  declare action: EscalationAction;

  @Column({ type: DataType.STRING(32), allowNull: true })
  declare targetRole: Role | null;

  @Column({ type: DataType.UUID, allowNull: true })
  declare targetUserId: string | null;

  @Column({ type: DataType.UUID, allowNull: true })
  declare targetDepartmentId: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare requiresAck: boolean;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare ackDeadlineSeconds: number | null;

  @BelongsTo(() => EscalationPolicy)
  declare policy?: EscalationPolicy;
}
