import { Column, DataType, Index, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ tableName: 'consent_records', timestamps: false, underscored: true })
export class ConsentRecord extends Model<ConsentRecord> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Index('consent_records_user_id')
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @Column({ type: DataType.STRING(32), allowNull: false })
  declare consentType: 'RECORDING' | 'LOCATION_TRACKING' | 'DATA_PROCESSING';

  @Column({ type: DataType.DATE, allowNull: true })
  declare grantedAt: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare revokedAt: Date | null;

  @Column({ type: DataType.STRING(64), allowNull: true })
  declare ip: string | null;

  @Column({ type: DataType.STRING(32), allowNull: false, defaultValue: 'v1' })
  declare policyVersion: string;
}
