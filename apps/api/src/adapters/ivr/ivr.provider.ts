import type { Language } from '@plaksha/shared-types';

export const IVR_PROVIDER = Symbol('IVR_PROVIDER');

export interface IvrCallContext {
  callSid: string;
  fromE164: string;
  toE164: string;
  digits?: string;
  language?: Language;
  ivrPath: string[];
}

export interface IvrInstruction {
  speak?: { text: string; language: Language };
  gatherDigits?: { numDigits: number; timeoutSeconds: number; nextPath: string };
  dial?: { numbers: string[]; timeoutSeconds: number };
  bridge?: { number: string };
  record?: { maxLengthSeconds: number; transcribe: boolean };
  hangup?: boolean;
}

export interface IvrWebhookEvent {
  type: 'call.started' | 'call.gather' | 'call.completed' | 'call.recording' | 'call.status';
  callSid: string;
  fromE164: string;
  toE164: string;
  digits?: string;
  recordingUrl?: string;
  recordingDurationSeconds?: number;
  callStatus?: string;
  raw: Record<string, unknown>;
}

export interface IvrProvider {
  /** Provider identifier. */
  readonly identifier: 'mock' | 'twilio' | 'exotel';

  /** Parse an inbound webhook into a normalized event. */
  parseWebhook(headers: Record<string, string>, body: Record<string, unknown>): IvrWebhookEvent;

  /** Verify webhook signature; returns true if authentic. */
  verifySignature(
    url: string,
    headers: Record<string, string>,
    body: Record<string, unknown>,
  ): boolean;

  /** Convert a list of instructions into the provider's response (TwiML / ExoML / JSON). */
  buildResponse(instructions: IvrInstruction[]): { contentType: string; body: string };

  /** Initiate an outbound call (best effort; some providers require pre-uploaded flow). */
  startOutboundCall(opts: { to: string; instructions: IvrInstruction[] }): Promise<{ callSid: string }>;
}
