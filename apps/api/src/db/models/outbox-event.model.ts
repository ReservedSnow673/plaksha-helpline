import {
  Column,
  CreatedAt,
  DataType,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({ tableName: 'outbox_events', timestamps: true, updatedAt: false, underscored: true })
export class OutboxEvent extends Model<OutboxEvent> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Column({ type: DataType.STRING(64), allowNull: false })
  declare aggregateType: string;

  @Column({ type: DataType.STRING(128), allowNull: false })
  declare aggregateId: string;

  @Column({ type: DataType.STRING(64), allowNull: false })
  declare eventType: string;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare payload: Record<string, unknown>;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: [] })
  declare rooms: string[];

  @CreatedAt
  declare createdAt: Date;

  @Index('outbox_published_at')
  @Column({ type: DataType.DATE, allowNull: true })
  declare publishedAt: Date | null;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare retries: number;
}
