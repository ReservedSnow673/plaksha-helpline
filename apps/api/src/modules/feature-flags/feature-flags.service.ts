import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { FeatureFlag } from '../../db/models/feature-flag.model';

@Injectable()
export class FeatureFlagsService {
  constructor(@InjectModel(FeatureFlag) private readonly model: typeof FeatureFlag) {}

  async get<T = unknown>(key: string, fallback: T): Promise<T> {
    const row = await this.model.findByPk(key);
    return (row?.value as T) ?? fallback;
  }

  list(): Promise<FeatureFlag[]> {
    return this.model.findAll({ order: [['key', 'ASC']] });
  }

  async set(key: string, value: unknown, updatedBy: string): Promise<FeatureFlag> {
    const [row] = await this.model.upsert({
      key,
      value,
      scope: 'GLOBAL',
      updatedBy,
    } as FeatureFlag);
    return row;
  }
}
