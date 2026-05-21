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

import { User } from './user.model';

@Table({ tableName: 'sessions', timestamps: true, underscored: true })
export class Session extends Model<Session> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => User)
  @Index('sessions_user_id')
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare refreshTokenHash: string;

  @Column({ type: DataType.STRING(128), allowNull: true })
  declare deviceId: string | null;

  @Column({ type: DataType.STRING(16), allowNull: false, defaultValue: 'UNKNOWN' })
  declare platform: 'IOS' | 'ANDROID' | 'WEB' | 'UNKNOWN';

  @Column({ type: DataType.STRING(32), allowNull: true })
  declare appVersion: string | null;

  @Column({ type: DataType.STRING(64), allowNull: true })
  declare ip: string | null;

  @Column({ type: DataType.STRING(512), allowNull: true })
  declare userAgent: string | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  declare expiresAt: Date;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare lastUsedAt: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  declare revokedAt: Date | null;

  @Column({ type: DataType.STRING(64), allowNull: true })
  declare revokedReason: string | null;

  @BelongsTo(() => User)
  declare user?: User;
}
