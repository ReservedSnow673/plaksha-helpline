import { Logger } from '@nestjs/common';

import type { IvrInstruction, IvrProvider, IvrWebhookEvent } from './ivr.provider';

export class MockIvrProvider implements IvrProvider {
  readonly identifier = 'mock' as const;
  private readonly logger = new Logger('MockIvrProvider');

  parseWebhook(_headers: Record<string, string>, body: Record<string, unknown>): IvrWebhookEvent {
    return {
      type: (body.type as IvrWebhookEvent['type']) ?? 'call.started',
      callSid: String(body.callSid ?? `mock-${Date.now()}`),
      fromE164: String(body.from ?? '+919999999999'),
      toE164: String(body.to ?? '+919999999998'),
      digits: body.digits as string | undefined,
      raw: body,
    };
  }

  verifySignature(): boolean {
    return true;
  }

  buildResponse(instructions: IvrInstruction[]): { contentType: string; body: string } {
    return {
      contentType: 'application/json',
      body: JSON.stringify({ provider: 'mock', instructions }, null, 2),
    };
  }

  async startOutboundCall(opts: { to: string; instructions: IvrInstruction[] }): Promise<{ callSid: string }> {
    const sid = `mock-out-${Date.now()}`;
    this.logger.log(`MOCK OUTBOUND CALL to=${opts.to} sid=${sid} steps=${opts.instructions.length}`);
    return { callSid: sid };
  }
}
