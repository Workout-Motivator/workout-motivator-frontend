import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

const errorRate = new Rate('errors');
const successfulRequests = new Counter('successful_requests');

export const options = {
  stages: [
    { duration: '10s', target: 50 },   // Ramp up to 50 users
    { duration: '20s', target: 100 },  // Ramp up to 100 users
    { duration: '30s', target: 100 },  // Stay at 100 users
    { duration: '10s', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should complete within 2s
    http_req_failed: ['rate<0.01'],    // Less than 1% of requests should fail
    errors: ['rate<0.1'],              // Less than 10% error rate
    successful_requests: ['count>50'],  // At least 50 successful requests
  },
  // Add setup and teardown options
  setupTimeout: '30s',
  teardownTimeout: '30s',
};

const BASE_URL = 'http://20.31.46.9';

export function setup() {
  // Initial check to ensure the service is responding
  const response = http.get(BASE_URL);
  check(response, {
    'setup check - status is 200': (r) => r.status === 200,
  });
  sleep(2);
}

export default function () {
  const responses = http.batch([
    ['GET', BASE_URL, null, { tags: { name: 'Homepage' } }],
    ['GET', `${BASE_URL}/static/js/main.js`, null, { tags: { name: 'MainJS' } }],
    ['GET', `${BASE_URL}/static/css/main.css`, null, { tags: { name: 'MainCSS' } }],
  ]);

  // Check homepage load with more resilient checks
  const homeSuccess = check(responses[0], {
    'homepage status is 200': (r) => r.status === 200,
    'homepage has correct content': (r) => {
      try {
        return r.body && r.body.includes('workout');
      } catch (e) {
        console.error('Error checking homepage content:', e);
        return false;
      }
    },
  });

  if (homeSuccess) {
    successfulRequests.add(1);
  } else {
    errorRate.add(1);
  }

  // Check static assets with more resilient checks
  check(responses[1], {
    'main.js loaded': (r) => r.status === 200,
  }) || errorRate.add(1);

  check(responses[2], {
    'main.css loaded': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);
}
