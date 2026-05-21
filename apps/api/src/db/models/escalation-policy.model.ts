import {
  Column,
  CreatedAt,
  DataType,
  HasMany,
  Index,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { EscalationLevel } from './escalation-level.model';

@Table({ tableName: 'escalation_policies', timestamps: true, underscored: true })
export class EscalationPolicy extends Model<EscalationPolicy> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Index('escalation_policy_department')
  @Column({ type: DataType.UUID, allowNull: true })
  declare departmentId: string | null;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: boolean;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @HasMany(() => EscalationLevel)
  declare levels?: EscalationLevel[];
}
