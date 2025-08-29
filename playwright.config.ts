import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.(spec|test)\.(ts|js)/,
  workers: 2, // Use a single worker for simplicity
  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/ui', open: 'never' }],['allure-playwright', { resultsDir: 'reports/allure' }],]
});
