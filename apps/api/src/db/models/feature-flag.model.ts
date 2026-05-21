import { Column, DataType, Model, PrimaryKey, Table, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: 'feature_flags', timestamps: true, createdAt: false, underscored: true })
export class FeatureFlag extends Model<FeatureFlag> {
  @PrimaryKey
  @Column({ type: DataType.STRING(128), allowNull: false })
  declare key: string;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare value: unknown;

  @Column({ type: DataType.STRING(32), allowNull: false, defaultValue: 'GLOBAL' })
  declare scope: 'GLOBAL' | 'DEPT' | 'USER';

  @Column({ type: DataType.UUID, allowNull: true })
  declare updatedBy: string | null;

  @UpdatedAt
  declare updatedAt: Date;
}
