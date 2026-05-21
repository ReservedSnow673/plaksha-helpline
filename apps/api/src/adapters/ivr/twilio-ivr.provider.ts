import type { AppConfig } from '@plaksha/shared-config';
import type { Language } from '@plaksha/shared-types';
import twilio from 'twilio';

import type { IvrInstruction, IvrProvider, IvrWebhookEvent } from './ivr.provider';

const LANG_MAP: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  pa: 'pa-IN',
};

export class TwilioIvrProvider implements IvrProvider {
  readonly identifier = 'twilio' as const;
  private readonly client: twilio.Twilio;
  private readonly authToken: string;
  private readonly from: string;

  constructor(private readonly config: AppConfig) {
    if (
      !config.ivr.twilioAccountSid ||
      !config.ivr.twilioAuthToken ||
      !config.ivr.twilioPhoneNumber
    ) {
      throw new Error('Twilio IVR provider requires TWILIO_* env vars');
    }
    this.client = twilio(config.ivr.twilioAccountSid, config.ivr.twilioAuthToken);
    this.authToken = config.ivr.twilioAuthToken;
    this.from = config.ivr.twilioPhoneNumber;
  }

  parseWebhook(_headers: Record<string, string>, body: Record<string, unknown>): IvrWebhookEvent {
    const callSid = String(body.CallSid ?? '');
    const digits = body.Digits as string | undefined;
    const callStatus = body.CallStatus as string | undefined;
    let type: IvrWebhookEvent['type'] = 'call.started';
    if (callStatus === 'completed') type = 'call.completed';
    else if (digits !== undefined) type = 'call.gather';
    else if (body.RecordingUrl) type = 'call.recording';
    return {
      type,
      callSid,
      fromE164: String(body.From ?? ''),
      toE164: String(body.To ?? ''),
      digits,
      recordingUrl: body.RecordingUrl as string | undefined,
      recordingDurationSeconds: body.RecordingDuration ? Number(body.RecordingDuration) : undefined,
      callStatus,
      raw: body,
    };
  }

  verifySignature(
    url: string,
    headers: Record<string, string>,
    body: Record<string, unknown>,
  ): boolean {
    const signature = headers['x-twilio-signature'] ?? headers['X-Twilio-Signature'];
    if (!signature) return false;
    return twilio.validateRequest(
      this.authToken,
      String(signature),
      url,
      body as Record<string, string>,
    );
  }

  buildResponse(instructions: IvrInstruction[]): { contentType: string; body: string } {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();
    for (const step of instructions) {
      if (step.speak) {
        twiml.say({ language: LANG_MAP[step.speak.language] as never }, step.speak.text);
      }
      if (step.gatherDigits) {
        const gather = twiml.gather({
          numDigits: step.gatherDigits.numDigits,
          timeout: step.gatherDigits.timeoutSeconds,
          action: step.gatherDigits.nextPath,
          method: 'POST',
        });
        if (step.speak) gather.say(step.speak.text);
      }
      if (step.dial) {
        const dial = twiml.dial({ timeout: step.dial.timeoutSeconds });
        for (const n of step.dial.numbers) dial.number(n);
      }
      if (step.record) {
        twiml.record({
          maxLength: step.record.maxLengthSeconds,
          transcribe: step.record.transcribe,
          playBeep: true,
        });
      }
      if (step.hangup) twiml.hangup();
    }
    return { contentType: 'text/xml', body: twiml.toString() };
  }

  async startOutboundCall(opts: {
    to: string;
    instructions: IvrInstruction[];
  }): Promise<{ callSid: string }> {
    const { body: twiml } = this.buildResponse(opts.instructions);
    const call = await this.client.calls.create({ to: opts.to, from: this.from, twiml });
    return { callSid: call.sid };
  }
}
