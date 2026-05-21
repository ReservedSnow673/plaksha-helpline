import type { AppConfig } from '@plaksha/shared-config';
import { Logger } from '@nestjs/common';
import { Expo, type ExpoPushMessage } from 'expo-server-sdk';

import type { PushMessage, PushProvider, PushTicket } from './push.provider';

export class ExpoPushProvider implements PushProvider {
  private readonly logger = new Logger('ExpoPushProvider');
  private readonly expo: Expo;

  constructor(config: AppConfig) {
    this.expo = new Expo({ accessToken: config.push.expoAccessToken });
  }

  async send(message: PushMessage): Promise<PushTicket[]> {
    const valid = message.to.filter((t) => Expo.isExpoPushToken(t));
    const invalid = message.to.filter((t) => !Expo.isExpoPushToken(t));
    for (const bad of invalid) this.logger.warn(`Skipping invalid Expo push token: ${bad}`);

    const messages: ExpoPushMessage[] = valid.map((to) => ({
      to,
      title: message.title,
      body: message.body,
      data: message.data,
      priority: message.priority === 'high' ? 'high' : 'default',
      ttl: message.ttl,
      channelId: message.channelId,
      sound: message.sound === null ? null : 'default',
    }));

    const chunks = this.expo.chunkPushNotifications(messages);
    const results: PushTicket[] = [];
    for (const chunk of chunks) {
      const tickets = await this.expo.sendPushNotificationsAsync(chunk);
      for (let i = 0; i < tickets.length; i++) {
        const t = tickets[i]!;
        const target = chunk[i]!;
        if (t.status === 'ok') {
          results.push({ to: target.to as string, status: 'ok', ticketId: t.id });
        } else {
          results.push({
            to: target.to as string,
            status: 'error',
            error: t.message,
          });
        }
      }
    }
    return results;
  }
}
