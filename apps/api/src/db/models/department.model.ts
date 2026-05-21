import type { DepartmentCode, Priority } from '@plaksha/shared-types';
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

@Table({ tableName: 'departments', timestamps: true, underscored: true })
export class Department extends Model<Department> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Index({ name: 'departments_code_unique', unique: true })
  @Column({ type: DataType.STRING(32), allowNull: false, unique: true })
  declare code: DepartmentCode;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare nameEn: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare nameHi: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare namePa: string;

  @Column({ type: DataType.STRING(7), allowNull: false, defaultValue: '#dc2626' })
  declare colorHex: string;

  @Column({ type: DataType.STRING(4), allowNull: false, defaultValue: 'P2' })
  declare defaultPriority: Priority;

  @Column({ type: DataType.UUID, allowNull: true })
  declare escalationPolicyId: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: boolean;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
