import { Controller, Get, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, type WhereOptions } from 'sequelize';

import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { AuditLog } from '../../db/models/audit-log.model';

@Controller('audit-logs')
export class AuditController {
  constructor(@InjectModel(AuditLog) private readonly model: typeof AuditLog) {}

  @RequirePermissions('audit.read')
  @Get()
  async list(
    @Query('resourceType') resourceType?: string,
    @Query('resourceId') resourceId?: string,
    @Query('actorUserId') actorUserId?: string,
    @Query('limit') limit = '50',
  ) {
    const where: WhereOptions<AuditLog> = {};
    if (resourceType) Object.assign(where, { resourceType });
    if (resourceId) Object.assign(where, { resourceId });
    if (actorUserId) Object.assign(where, { actorUserId });
    Object.assign(where, { occurredAt: { [Op.lte]: new Date() } });
    const rows = await this.model.findAll({
      where,
      order: [['occurredAt', 'DESC']],
      limit: Math.min(Number(limit) || 50, 500),
    });
    return { data: rows };
  }
}
