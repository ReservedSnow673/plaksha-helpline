import type {
  DepartmentCode,
  IncidentChannel,
  IncidentStatus,
  Language,
  Priority,
} from '@plaksha/shared-types';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  HasMany,
  HasOne,
  Index,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { ChatThread } from './chat-thread.model';
import { Department } from './department.model';
import { IncidentAssignment } from './incident-assignment.model';
import { IncidentEvent } from './incident-event.model';
import { User } from './user.model';

@Table({ tableName: 'incidents', timestamps: true, paranoid: true, underscored: true })
export class Incident extends Model<Incident> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Index({ name: 'incidents_public_code_unique', unique: true })
  @Column({ type: DataType.STRING(16), allowNull: false, unique: true })
  declare publicCode: string;

  @Column({ type: DataType.STRING(32), allowNull: false })
  declare category: DepartmentCode;

  @Column({ type: DataType.STRING(4), allowNull: false, defaultValue: 'P2' })
  declare priority: Priority;

  @Index('incidents_status')
  @Column({ type: DataType.STRING(32), allowNull: false, defaultValue: 'CREATED' })
  declare status: IncidentStatus;

  @ForeignKey(() => User)
  @Index('incidents_reported_by')
  @Column({ type: DataType.UUID, allowNull: true })
  declare reportedByUserId: string | null;

  @ForeignKey(() => Department)
  @Index('incidents_department_id')
  @Column({ type: DataType.UUID, allowNull: true })
  declare departmentId: string | null;

  @Column({ type: DataType.STRING(8), allowNull: false, defaultValue: 'en' })
  declare language: Language;

  @Column({ type: DataType.STRING(32), allowNull: false })
  declare channel: IncidentChannel;

  @Column({ type: DataType.DOUBLE, allowNull: true })
  declare lat: number | null;

  @Column({ type: DataType.DOUBLE, allowNull: true })
  declare lng: number | null;

  @Column({ type: DataType.STRING(200), allowNull: true })
  declare locationLabel: string | null;

  @Column({ type: DataType.DOUBLE, allowNull: true })
  declare locationAccuracyM: number | null;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare addressText: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare anonymous: boolean;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: {} })
  declare metadata: Record<string, unknown>;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare acknowledgedAt: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare firstResponderAssignedAt: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare enRouteAt: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare arrivedAt: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare resolvedAt: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare closedAt: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare archivedAt: Date | null;

  @BelongsTo(() => User, { foreignKey: 'reportedByUserId' })
  declare reporter?: User;

  @BelongsTo(() => Department)
  declare department?: Department;

  @HasMany(() => IncidentEvent)
  declare events?: IncidentEvent[];

  @HasMany(() => IncidentAssignment)
  declare assignments?: IncidentAssignment[];

  @HasOne(() => ChatThread)
  declare chatThread?: ChatThread;
}
