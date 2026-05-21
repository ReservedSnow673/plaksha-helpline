import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { FeatureFlag } from '../../db/models/feature-flag.model';

import { FeatureFlagsController } from './feature-flags.controller';
import { FeatureFlagsService } from './feature-flags.service';

@Module({
  imports: [SequelizeModule.forFeature([FeatureFlag])],
  controllers: [FeatureFlagsController],
  providers: [FeatureFlagsService],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
