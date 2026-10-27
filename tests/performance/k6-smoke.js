import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,           // 5 virtual users
  duration: '10s',  // 10 seconds
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],   // less than 1% errors
  },
};

export default function () {
  const res = http.get('http://localhost:4000/api/v1/products');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'ima proizvode': (r) => r.json('products') !== undefined,
    'count je 22': (r) => r.json('count') === 22,
  });

  sleep(1);
}