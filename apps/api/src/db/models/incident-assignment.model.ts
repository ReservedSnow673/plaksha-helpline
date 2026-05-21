import type { AssignmentStatus } from '@plaksha/shared-types';
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

import { Incident } from './incident.model';
import { User } from './user.model';

@Table({ tableName: 'incident_assignments', timestamps: true, underscored: true })
export class IncidentAssignment extends Model<IncidentAssignment> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => Incident)
  @Index('assignments_incident_id')
  @Column({ type: DataType.UUID, allowNull: false })
  declare incidentId: string;

  @ForeignKey(() => User)
  @Index('assignments_responder_id')
  @Column({ type: DataType.UUID, allowNull: false })
  declare responderUserId: string;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare offeredAt: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  declare acceptedAt: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare rejectedAt: Date | null;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare rejectionReason: string | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare enRouteAt: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare arrivedAt: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare completedAt: Date | null;

  @Index('assignments_status')
  @Column({ type: DataType.STRING(16), allowNull: false, defaultValue: 'OFFERED' })
  declare status: AssignmentStatus;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare etaSeconds: number | null;

  @Column({ type: DataType.DOUBLE, allowNull: true })
  declare distanceM: number | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @BelongsTo(() => Incident)
  declare incident?: Incident;

  @BelongsTo(() => User, { foreignKey: 'responderUserId' })
  declare responder?: User;
}
