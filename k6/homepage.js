import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 7500 },
    { duration: '1m', target: 7500 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://20.31.46.9';

export default function () {
  const responses = http.batch([
    ['GET', BASE_URL, null, { tags: { name: 'Homepage' } }],
    ['GET', `${BASE_URL}/static/js/main.js`, null, { tags: { name: 'MainJS' } }],
    ['GET', `${BASE_URL}/static/css/main.css`, null, { tags: { name: 'MainCSS' } }],
  ]);

  // Check homepage load
  check(responses[0], {
    'homepage status is 200': (r) => r.status === 200,
    'homepage has correct content': (r) => r.body.includes('workout'),
  }) || errorRate.add(1);

  // Check static assets
  check(responses[1], {
    'main.js loaded': (r) => r.status === 200,
  }) || errorRate.add(1);

  check(responses[2], {
    'main.css loaded': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(Math.random() * 3 + 2); // Random sleep between 2-5 seconds
}
