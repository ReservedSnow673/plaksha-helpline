import type { Language, Role, UserStatus } from '@plaksha/shared-types';
import {
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  HasMany,
  HasOne,
  Index,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { Incident } from './incident.model';
import { ResponderProfile } from './responder-profile.model';
import { Session } from './session.model';

@Table({ tableName: 'users', timestamps: true, paranoid: true, underscored: true })
export class User extends Model<User> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Index('users_email_unique')
  @Column({ type: DataType.CITEXT, allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.DATE, allowNull: true })
  declare emailVerifiedAt: Date | null;

  @Index('users_microsoft_oid_unique')
  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  declare microsoftOid: string | null;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare firstName: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare lastName: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare phoneEncrypted: string | null;

  @Index('users_phone_hash')
  @Column({ type: DataType.STRING(64), allowNull: true })
  declare phoneHash: string | null;

  @Column({ type: DataType.STRING(8), defaultValue: 'en' })
  declare preferredLanguage: Language;

  @Index('users_role')
  @Column({ type: DataType.STRING(32), allowNull: false, defaultValue: 'STUDENT' })
  declare role: Role;

  @Index('users_department_id')
  @Column({ type: DataType.UUID, allowNull: true })
  declare departmentId: string | null;

  @Column({ type: DataType.STRING(32), allowNull: false, defaultValue: 'ACTIVE' })
  declare status: UserStatus;

  @Column({ type: DataType.DATE, allowNull: true })
  declare lastActiveAt: Date | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date | null;

  @HasMany(() => Session)
  declare sessions?: Session[];

  @HasOne(() => ResponderProfile)
  declare responderProfile?: ResponderProfile;

  @HasMany(() => Incident, { foreignKey: 'reportedByUserId' })
  declare reportedIncidents?: Incident[];
}
