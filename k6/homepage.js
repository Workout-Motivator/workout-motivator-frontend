import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

const errorRate = new Rate('errors');
const successfulRequests = new Counter('successful_requests');

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Ramp up to 100 users
    { duration: '1m', target: 100 },   // Stay at 100 users
    { duration: '30s', target: 500 },  // Ramp up to 500 users
    { duration: '1m', target: 500 },   // Stay at 500 users
    { duration: '30s', target: 1000 }, // Ramp up to 1000 users
    { duration: '1m', target: 1000 },  // Stay at 1000 users
    { duration: '30s', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should complete within 2s
    http_req_failed: ['rate<0.01'],    // Less than 1% of requests should fail
    errors: ['rate<0.1'],              // Less than 10% error rate
    successful_requests: ['count>100'], // At least 100 successful requests
  },
};

const BASE_URL = 'http://20.31.46.9';

export default function () {
  const responses = http.batch([
    ['GET', BASE_URL, null, { tags: { name: 'Homepage' } }],
    ['GET', `${BASE_URL}/static/js/main.js`, null, { tags: { name: 'MainJS' } }],
    ['GET', `${BASE_URL}/static/css/main.css`, null, { tags: { name: 'MainCSS' } }],
  ]);

  // Check homepage load
  const homeSuccess = check(responses[0], {
    'homepage status is 200': (r) => r.status === 200,
    'homepage has correct content': (r) => r.body.includes('workout'),
  });

  if (homeSuccess) {
    successfulRequests.add(1);
  } else {
    errorRate.add(1);
  }

  // Check static assets
  check(responses[1], {
    'main.js loaded': (r) => r.status === 200,
  }) || errorRate.add(1);

  check(responses[2], {
    'main.css loaded': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(Math.random() * 3 + 2); // Random sleep between 2-5 seconds
}
