import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.API_BASE_URL || 'http://localhost:4000';
const authToken = __ENV.AUTH_TOKEN || '';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500'],
  },
};

export default function () {
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  const live = http.get(`${baseUrl}/v1/health/live`);
  check(live, { 'live 200': (r) => r.status === 200 });

  const ready = http.get(`${baseUrl}/v1/health/ready`);
  check(ready, { 'ready 200': (r) => r.status === 200 });

  if (authToken) {
    const incident = http.post(
      `${baseUrl}/v1/incidents`,
      JSON.stringify({
        category: 'SECURITY',
        channel: 'MANUAL_DISPATCH',
        language: 'en',
        note: 'k6 load test',
        anonymous: true,
      }),
      { headers: { ...headers, 'Content-Type': 'application/json' } },
    );
    check(incident, { 'incident created': (r) => r.status === 201 || r.status === 200 });
  }

  sleep(1);
}
