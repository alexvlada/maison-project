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
    headless: true,   // ← default: headless for all
  },

  projects: [
    // ============================================
    // UI TESTS - headed locally, headless at CI
    // ============================================
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: process.env.CI ? true : false,   // ← headed locally
      },
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Firefox'],
        headless: process.env.CI ? true : false,
      },
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Safari'],
        headless: process.env.CI ? true : false,
      },
    },

    // ============================================
    // API TESTS - uvek headless (schema koristi page)
    // ============================================
    {
      name: 'api',
      testDir: './tests/api',
      fullyParallel: false,
      workers: 1,
      use: {
        baseURL: process.env.API_BASE_URL,
        headless: true,   // ← uvek headless
      },
    },

    // ============================================
    // E2E TESTS - always headless
    // ============================================
    {
      name: 'e2e',
      testDir: './tests/e2e',
      fullyParallel: false,
      workers: 1,
      use: {
        baseURL: process.env.API_BASE_URL,
        headless: true,   // ← always headless
      },
    },
  ],
});