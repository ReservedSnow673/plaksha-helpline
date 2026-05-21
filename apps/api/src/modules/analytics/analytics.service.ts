import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { QueryTypes } from 'sequelize';
import type { Sequelize } from 'sequelize-typescript';

@Injectable()
export class AnalyticsService {
  constructor(@InjectConnection() private readonly sequelize: Sequelize) {}

  async responseTimesByDepartment(): Promise<unknown[]> {
    return this.sequelize.query(
      `SELECT d.code,
              percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (i.acknowledged_at - i.created_at))) AS p50_ack_seconds,
              percentile_cont(0.9) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (i.acknowledged_at - i.created_at))) AS p90_ack_seconds,
              count(*) AS total
       FROM incidents i
       LEFT JOIN departments d ON d.id = i.department_id
       WHERE i.acknowledged_at IS NOT NULL
         AND i.created_at >= NOW() - INTERVAL '30 days'
       GROUP BY d.code
       ORDER BY total DESC`,
      { type: QueryTypes.SELECT },
    );
  }

  async peakHours(): Promise<unknown[]> {
    return this.sequelize.query(
      `SELECT EXTRACT(HOUR FROM created_at)::int AS hour, count(*) AS incidents
       FROM incidents
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY hour
       ORDER BY hour`,
      { type: QueryTypes.SELECT },
    );
  }

  async incidentHeatmap(): Promise<unknown[]> {
    return this.sequelize.query(
      `SELECT round(lat::numeric, 4) AS lat, round(lng::numeric, 4) AS lng, count(*) AS n
       FROM incidents
       WHERE lat IS NOT NULL AND lng IS NOT NULL
         AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY lat, lng
       HAVING count(*) >= 1
       ORDER BY n DESC
       LIMIT 1000`,
      { type: QueryTypes.SELECT },
    );
  }

  async escalationFrequency(): Promise<unknown[]> {
    return this.sequelize.query(
      `SELECT date_trunc('day', created_at) AS day,
              count(*) FILTER (WHERE fired_at IS NOT NULL) AS fired,
              count(*) AS scheduled
       FROM escalation_runs
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY day
       ORDER BY day`,
      { type: QueryTypes.SELECT },
    );
  }

  async responderPerformance(): Promise<unknown[]> {
    return this.sequelize.query(
      `SELECT responder_user_id,
              count(*) FILTER (WHERE status = 'ACCEPTED') AS accepted,
              count(*) FILTER (WHERE status = 'REJECTED') AS rejected,
              count(*) FILTER (WHERE status = 'TIMED_OUT') AS timed_out,
              percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (accepted_at - offered_at))) AS p50_ack
       FROM incident_assignments
       WHERE offered_at >= NOW() - INTERVAL '30 days'
       GROUP BY responder_user_id`,
      { type: QueryTypes.SELECT },
    );
  }
}
