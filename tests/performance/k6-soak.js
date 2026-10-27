import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m',  target: 100 },   // ramp-up
    { duration: '10m', target: 100 },   // soak: 10 minutes at 100 VUs
    { duration: '1m',  target: 0 },     // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // 95% < 1s
    http_req_failed: ['rate<0.01'],     // < 1% errors
  },
};

export default function () {
  const res = http.get('http://localhost:4000/api/v1/products');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}