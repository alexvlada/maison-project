import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },   // 0 → 100 VU
    { duration: '1m', target: 200 },   // 100 → 200 VU
    { duration: '1m', target: 300 },   // 200 → 300 VU
    { duration: '1m', target: 500 },   // 300 → 500 VU
    { duration: '1m', target: 0 },     // 500 → 0 VU
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% < 1s (more relaxed threshold)
    http_req_failed: ['rate<0.05'],    // < 5% errors
  },
};

export default function () {
  const res = http.get('http://localhost:4000/api/v1/products');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}