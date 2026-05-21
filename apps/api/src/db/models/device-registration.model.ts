import {
  Column,
  CreatedAt,
  DataType,
  Index,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'device_registrations', timestamps: true, underscored: true })
export class DeviceRegistration extends Model<DeviceRegistration> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Index('device_registrations_user_id')
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @Index({ name: 'device_registrations_token_unique', unique: true })
  @Column({ type: DataType.STRING(256), allowNull: false })
  declare expoPushToken: string;

  @Column({ type: DataType.STRING(128), allowNull: false })
  declare deviceId: string;

  @Column({ type: DataType.STRING(16), allowNull: false })
  declare platform: 'IOS' | 'ANDROID';

  @Column({ type: DataType.STRING(32), allowNull: false })
  declare appVersion: string;

  @Column({ type: DataType.STRING(16), allowNull: false, defaultValue: 'en' })
  declare locale: string;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare lastSeenAt: Date;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare pushEnabled: boolean;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
