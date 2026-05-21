import {
  Column,
  CreatedAt,
  DataType,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({ tableName: 'magic_link_tokens', timestamps: true, updatedAt: false, underscored: true })
export class MagicLinkToken extends Model<MagicLinkToken> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Index('magic_link_email')
  @Column({ type: DataType.CITEXT, allowNull: false })
  declare email: string;

  @Index({ name: 'magic_link_token_hash', unique: true })
  @Column({ type: DataType.STRING(128), allowNull: false })
  declare tokenHash: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare expiresAt: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  declare consumedAt: Date | null;

  @Column({ type: DataType.STRING(64), allowNull: true })
  declare ip: string | null;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare attempts: number;

  @CreatedAt
  declare createdAt: Date;
}
