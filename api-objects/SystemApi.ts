import { request, APIRequestContext, expect } from '@playwright/test';

const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:4000/api/v1';
const seedInfo = 'seed-info'
const reset = '_reset';
const health = 'health';

export async function resetDatabase(apiContext: APIRequestContext): Promise<void> {
  const response = await apiContext.post(apiBaseUrl + reset, {
    timeout: 30_000,
  });

  const status = response.status();
  const expectedStatus = 200

  expect(status).toBe(expectedStatus)

  console.log('✅ Database reset');
}

export async function checkHealth(apiContext: APIRequestContext): Promise<any> {
  const response = await apiContext.get(apiBaseUrl + health, {
    timeout: 30_000,
  });

  const status = response.status();
  const expectedStatus = 200
  const body = await response.json();

  expect(status).toBe(expectedStatus)

  console.log('✅ Server is healthy');
  return body;
}

export async function getSeedInfo(apiContext: APIRequestContext): Promise<any> {
  const response = await apiContext.get(apiBaseUrl + seedInfo);
  const status = response.status();
  const expectedStatus = 200
  const body = await response.json();

  expect(status).toBe(expectedStatus)

  return body;
}