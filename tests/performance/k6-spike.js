import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },    // normal load
    { duration: '10s', target: 500 },   // SUDDEN SPIKE to 500
    { duration: '30s', target: 500 },   // hold at 500
    { duration: '10s', target: 10 },    // SUDDEN DROP to 10
    { duration: '30s', target: 10 },    // hold at 10
    { duration: '10s', target: 0 },     // end
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% < 2s (relaxed)
    http_req_failed: ['rate<0.10'],    // < 10% errors
  },
};

export default function () {
  const res = http.get('http://localhost:4000/api/v1/products');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}