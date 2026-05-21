import { Rooms } from '@plaksha/shared-events';
import type { ResponderStatus } from '@plaksha/shared-types';
import { geohash, isWithinCampus } from '@plaksha/shared-utils';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { ResponderProfile } from '../../db/models/responder-profile.model';
import { OutboxService } from '../outbox/outbox.service';

@Injectable()
export class RespondersService {
  constructor(
    @InjectModel(ResponderProfile) private readonly profiles: typeof ResponderProfile,
    private readonly outbox: OutboxService,
  ) {}

  async updateStatus(userId: string, status: ResponderStatus, isOnDuty: boolean) {
    const profile = await this.profiles.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Responder profile not found');
    const transitioningToOnDuty = isOnDuty && !profile.isOnDuty;
    await profile.update({
      status,
      isOnDuty,
      shiftStartedAt: transitioningToOnDuty ? new Date() : profile.shiftStartedAt,
    });
    await this.outbox.enqueue({
      aggregateType: 'responder',
      aggregateId: profile.userId,
      eventType: 'responder.status_changed',
      payload: { userId: profile.userId, status, isOnDuty },
      rooms: [Rooms.adminOverview(), Rooms.deptOnDuty(profile.departmentId)],
    });
    return profile;
  }

  async updateLocation(userId: string, lat: number, lng: number, accuracyM: number | null) {
    const profile = await this.profiles.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Responder profile not found');
    if (!isWithinCampus(lat, lng)) {
      // Allow but log; off-campus responders may be on escort detail.
    }
    const hash = geohash(lat, lng, 9);
    const updatedAt = new Date();
    await profile.update({
      currentLat: lat,
      currentLng: lng,
      currentGeohash: hash,
      locationUpdatedAt: updatedAt,
    });
    await this.outbox.enqueue({
      aggregateType: 'responder',
      aggregateId: profile.userId,
      eventType: 'responder.location_updated',
      payload: {
        userId: profile.userId,
        lat,
        lng,
        accuracyM,
        updatedAt: updatedAt.toISOString(),
        geohash: hash,
      },
      rooms: [Rooms.adminOverview(), Rooms.deptOnDuty(profile.departmentId)],
    });
    return profile;
  }

  listOnDuty(departmentId?: string) {
    return this.profiles.findAll({
      where: { isOnDuty: true, ...(departmentId ? { departmentId } : {}) },
      order: [['locationUpdatedAt', 'DESC']],
    });
  }
}
