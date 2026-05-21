import type { CallDirection, CallProvider, CallStatus, Language } from '@plaksha/shared-types';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { CallRecord } from '../../db/models/call-record.model';

@Injectable()
export class CallsService {
  constructor(@InjectModel(CallRecord) private readonly model: typeof CallRecord) {}

  upsert(opts: {
    provider: CallProvider;
    providerCallSid: string;
    direction: CallDirection;
    fromE164: string;
    toE164: string;
    incidentId?: string | null;
    language?: Language | null;
  }): Promise<CallRecord> {
    return this.model
      .upsert({
        provider: opts.provider,
        providerCallSid: opts.providerCallSid,
        direction: opts.direction,
        fromE164: opts.fromE164,
        toE164: opts.toE164,
        incidentId: opts.incidentId ?? null,
        language: opts.language ?? null,
        ivrPath: [],
        startedAt: new Date(),
        status: 'RINGING',
        recordingConsent: false,
      } as never)
      .then(([row]) => row);
  }

  async appendIvrStep(sid: string, step: string): Promise<void> {
    const call = await this.model.findOne({ where: { providerCallSid: sid } });
    if (!call) return;
    await call.update({ ivrPath: [...call.ivrPath, step] });
  }

  async updateStatus(sid: string, status: CallStatus, patch: Partial<CallRecord> = {}): Promise<void> {
    await this.model.update({ status, ...patch }, { where: { providerCallSid: sid } });
  }

  list(opts: { from?: Date; to?: Date; limit?: number }): Promise<CallRecord[]> {
    return this.model.findAll({
      where: opts.from && opts.to ? { startedAt: { $between: [opts.from, opts.to] } as never } : undefined,
      order: [['startedAt', 'DESC']],
      limit: opts.limit ?? 50,
    });
  }
}
