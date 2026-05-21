import type { IncidentEventType } from '@plaksha/shared-types';
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

import { Incident } from './incident.model';
import { User } from './user.model';

@Table({ tableName: 'incident_events', timestamps: false, underscored: true })
export class IncidentEvent extends Model<IncidentEvent> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => Incident)
  @Index('incident_events_incident_id')
  @Column({ type: DataType.UUID, allowNull: false })
  declare incidentId: string;

  @Column({ type: DataType.STRING(64), allowNull: false })
  declare eventType: IncidentEventType;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  declare actorUserId: string | null;

  @Column({ type: DataType.STRING(16), allowNull: false, defaultValue: 'SYSTEM' })
  declare actorKind: 'USER' | 'SYSTEM' | 'PROVIDER';

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: {} })
  declare payload: Record<string, unknown>;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare occurredAt: Date;

  @Index('incident_events_sequence')
  @Column({ type: DataType.BIGINT, allowNull: false, autoIncrement: true })
  declare sequence: number;

  @BelongsTo(() => Incident)
  declare incident?: Incident;
}
