import { createHmac, timingSafeEqual } from 'node:crypto';

import type { AppConfig } from '@plaksha/shared-config';
import { Logger } from '@nestjs/common';

import type { IvrInstruction, IvrProvider, IvrWebhookEvent } from './ivr.provider';

/**
 * Exotel adapter (Indian-native IVR provider).
 * Phase 6 wiring; outbound calls require a pre-configured Exotel App ID
 * referenced by env once provisioned.
 */
export class ExotelIvrProvider implements IvrProvider {
  readonly identifier = 'exotel' as const;
  private readonly logger = new Logger('ExotelIvrProvider');

  constructor(private readonly config: AppConfig) {
    if (!config.ivr.exotelSid || !config.ivr.exotelApiKey || !config.ivr.exotelApiToken) {
      throw new Error('Exotel IVR provider requires EXOTEL_* env vars');
    }
  }

  parseWebhook(_headers: Record<string, string>, body: Record<string, unknown>): IvrWebhookEvent {
    const callSid = String(body.CallSid ?? body.CallId ?? '');
    const digits = body.digits as string | undefined;
    const callStatus = body.Status as string | undefined;
    let type: IvrWebhookEvent['type'] = 'call.started';
    if (callStatus === 'completed') type = 'call.completed';
    else if (digits !== undefined) type = 'call.gather';
    else if (body.RecordingUrl) type = 'call.recording';
    return {
      type,
      callSid,
      fromE164: String(body.From ?? body.CallFrom ?? ''),
      toE164: String(body.To ?? body.CallTo ?? ''),
      digits,
      recordingUrl: body.RecordingUrl as string | undefined,
      callStatus,
      raw: body,
    };
  }

  verifySignature(
    _url: string,
    headers: Record<string, string>,
    body: Record<string, unknown>,
  ): boolean {
    const sig = headers['x-exotel-signature'] ?? headers['X-Exotel-Signature'];
    if (!sig) return false;
    const payload = JSON.stringify(body);
    const expected = createHmac('sha256', this.config.ivr.exotelApiToken!).update(payload).digest('hex');
    const a = Buffer.from(String(sig));
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  buildResponse(instructions: IvrInstruction[]): { contentType: string; body: string } {
    // Exotel uses an app-flow XML format on their dashboard; webhook responses are JSON.
    return { contentType: 'application/json', body: JSON.stringify({ instructions }) };
  }

  async startOutboundCall(opts: {
    to: string;
    instructions: IvrInstruction[];
  }): Promise<{ callSid: string }> {
    this.logger.warn(`Exotel outbound call simulated; configure App ID on Exotel dashboard. to=${opts.to}`);
    return { callSid: `exotel-stub-${Date.now()}` };
  }
}
