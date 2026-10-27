import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // ramp-up: 0 → 50 VU
    { duration: '1m',  target: 50 },   // steady: hold at 50 VUs
    { duration: '30s', target: 0 },    // ramp-down: 50 → 0 VU
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% < 500ms
    http_req_failed: ['rate<0.01'],    // < 1% errors
  },
};

export default function () {
  const res = http.get('http://localhost:4000/api/v1/products');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'count je 22': (r) => r.json('count') === 22,
  });

  sleep(1);
}