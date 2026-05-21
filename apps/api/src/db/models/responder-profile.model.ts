import type { ResponderStatus } from '@plaksha/shared-types';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Index,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { Department } from './department.model';
import { User } from './user.model';

@Table({ tableName: 'responder_profiles', timestamps: true, underscored: true })
export class ResponderProfile extends Model<ResponderProfile> {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  declare userId: string;

  @ForeignKey(() => Department)
  @Index('responder_department_id')
  @Column({ type: DataType.UUID, allowNull: false })
  declare departmentId: string;

  @Index('responder_on_duty')
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare isOnDuty: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  declare shiftStartedAt: Date | null;

  @Column({ type: DataType.DOUBLE, allowNull: true })
  declare currentLat: number | null;

  @Column({ type: DataType.DOUBLE, allowNull: true })
  declare currentLng: number | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare locationUpdatedAt: Date | null;

  @Index('responder_geohash')
  @Column({ type: DataType.STRING(12), allowNull: true })
  declare currentGeohash: string | null;

  @Index('responder_status')
  @Column({ type: DataType.STRING(16), allowNull: false, defaultValue: 'OFFLINE' })
  declare status: ResponderStatus;

  @Column({ type: DataType.UUID, allowNull: true })
  declare currentAssignmentId: string | null;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare vehicleInfo: Record<string, unknown> | null;

  @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: false, defaultValue: [] })
  declare skills: string[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @BelongsTo(() => User)
  declare user?: User;

  @BelongsTo(() => Department)
  declare department?: Department;
}
