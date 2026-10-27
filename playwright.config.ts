import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',

  use: {
    baseURL: process.env.BASE_URL,
    headless: false,
  },

  projects: [
    // ============================================
    // UI TESTS - all three browsers
    // ============================================
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      use: { ...devices['Desktop Safari'] },
    },

    // ============================================
    // API TESTS - only once, without a browser
    // ============================================
    {
      name: 'api',
      testDir: './tests/api',
      fullyParallel: false,   // ← dodaj ovo
      workers: 1,             // ← dodaj ovo
      use: {
        baseURL: process.env.API_BASE_URL,
      },
    },

    // ============================================
    // E2E TESTS
    // ============================================
    {
      name: 'e2e',
      testDir: './tests/e2e',
      fullyParallel: false,
      workers: 1,
      use: {
        baseURL: process.env.API_BASE_URL,
      },
    },

  ],
});