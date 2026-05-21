import type { NotificationChannel, Priority } from '@plaksha/shared-types';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { EMAIL_PROVIDER, type EmailProvider } from '../../adapters/email/email.provider';
import { PUSH_PROVIDER, type PushProvider } from '../../adapters/push/push.provider';
import { SMS_PROVIDER, type SmsProvider } from '../../adapters/sms/sms.provider';
import { createRecord } from '../../common/types/sequelize-create';
import { DeviceRegistration } from '../../db/models/device-registration.model';
import { Notification } from '../../db/models/notification.model';
import { User } from '../../db/models/user.model';

interface DispatchInput {
  userId: string;
  channels: NotificationChannel[];
  priority: Priority;
  payload: { title: string; body: string; data?: Record<string, unknown> };
  incidentId?: string | null;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification) private readonly notifications: typeof Notification,
    @InjectModel(DeviceRegistration) private readonly devices: typeof DeviceRegistration,
    @InjectModel(User) private readonly users: typeof User,
    @Inject(PUSH_PROVIDER) private readonly push: PushProvider,
    @Inject(SMS_PROVIDER) private readonly sms: SmsProvider,
    @Inject(EMAIL_PROVIDER) private readonly email: EmailProvider,
  ) {}

  async dispatch(input: DispatchInput): Promise<Notification[]> {
    const records: Notification[] = [];
    for (const channel of input.channels) {
      const record = await createRecord<Notification>(
        this.notifications,
        {
        userId: input.userId,
        channel,
        incidentId: input.incidentId ?? null,
        payload: input.payload,
        priority: input.priority,
        status: 'QUEUED',
        },
      );
      records.push(record);
      try {
        await this.send(record);
      } catch (err) {
        this.logger.error(`notification send failed: ${(err as Error).message}`);
      }
    }
    return records;
  }

  private async send(record: Notification): Promise<void> {
    switch (record.channel) {
      case 'PUSH':
        await this.sendPush(record);
        break;
      case 'SMS':
        await this.sendSms(record);
        break;
      case 'EMAIL':
        await this.sendEmail(record);
        break;
      case 'WS':
        // WS notifications are handled by the outbox poller — mark immediately delivered.
        await record.update({ status: 'DELIVERED', deliveredAt: new Date() });
        break;
      case 'WHATSAPP':
      case 'VOICE':
        this.logger.warn(`Channel ${record.channel} not implemented in Phase 1`);
        await record.update({ status: 'SUPPRESSED' });
        break;
    }
  }

  private async sendPush(record: Notification): Promise<void> {
    const tokens = await this.devices.findAll({ where: { userId: record.userId, pushEnabled: true } });
    if (tokens.length === 0) {
      await record.update({ status: 'SUPPRESSED', error: 'no_device_tokens' });
      return;
    }
    const payload = record.payload as { title: string; body: string; data?: Record<string, unknown> };
    const tickets = await this.push.send({
      to: tokens.map((t) => t.expoPushToken),
      title: payload.title,
      body: payload.body,
      data: { ...(payload.data ?? {}), notificationId: record.id, incidentId: record.incidentId },
      priority: record.priority === 'P1' || record.priority === 'P2' ? 'high' : 'default',
    });
    const okCount = tickets.filter((t) => t.status === 'ok').length;
    await record.update({
      attemptCount: record.attemptCount + 1,
      lastAttemptAt: new Date(),
      status: okCount > 0 ? 'SENT' : 'FAILED',
      deliveredAt: okCount > 0 ? new Date() : null,
      providerMessageId: tickets.find((t) => t.status === 'ok')?.ticketId ?? null,
      error: tickets.find((t) => t.status === 'error')?.error ?? null,
    });
  }

  private async sendSms(record: Notification): Promise<void> {
    const user = await this.users.findByPk(record.userId);
    if (!user?.phoneEncrypted) {
      await record.update({ status: 'SUPPRESSED', error: 'no_phone' });
      return;
    }
    // Phase 1: phoneEncrypted is actually the raw phone since pgcrypto wiring is Phase 7.
    const payload = record.payload as { title: string; body: string };
    const result = await this.sms.send({ to: user.phoneEncrypted, body: `${payload.title}\n${payload.body}` });
    await record.update({
      status: 'SENT',
      providerMessageId: result.providerMessageId,
      attemptCount: record.attemptCount + 1,
      lastAttemptAt: new Date(),
    });
  }

  private async sendEmail(record: Notification): Promise<void> {
    const user = await this.users.findByPk(record.userId);
    if (!user) {
      await record.update({ status: 'FAILED', error: 'user_not_found' });
      return;
    }
    const payload = record.payload as { title: string; body: string };
    const result = await this.email.send({
      to: user.email,
      subject: payload.title,
      text: payload.body,
      html: `<p>${escapeHtml(payload.body)}</p>`,
    });
    await record.update({
      status: 'SENT',
      providerMessageId: result.providerMessageId,
      attemptCount: record.attemptCount + 1,
      lastAttemptAt: new Date(),
    });
  }

  async registerDevice(opts: {
    userId: string;
    expoPushToken: string;
    deviceId: string;
    platform: 'IOS' | 'ANDROID';
    appVersion: string;
    locale: string;
  }) {
    const [device] = await this.devices.upsert({
      userId: opts.userId,
      expoPushToken: opts.expoPushToken,
      deviceId: opts.deviceId,
      platform: opts.platform,
      appVersion: opts.appVersion,
      locale: opts.locale,
      lastSeenAt: new Date(),
      pushEnabled: true,
    } as DeviceRegistration);
    return device;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
