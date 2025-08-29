import { Page } from '@playwright/test';
import { selectors } from './selectors';
import { findLocator, findLocatorOrNull, firstText } from '../utils/findLocator';

/**
 * POM for the SauceDemo Login page.
 * - Uses relative navigation so Playwright's baseURL resolves the full URL.
 * - Single elements resolved via findLocator/findLocatorOrNull for fallback robustness.
 * - No assertions here; tests assert outcomes.
 */
export class LoginPage {
  constructor(private page: Page) { }

  /**
   * Navigate to the login page.
   * Note: '/' is resolved against use.baseURL from playwright.config.ts.
   */
  async goto(): Promise<void> {
    await this.page.goto('/'); // resolved against baseURL
  }

  /**
   * Fill username + password and submit.
   * - findLocator tries selector fallbacks and ensures visibility.
   * - { onlyInteractive: true } avoids clicking hidden/disabled variants.
   */
  async loginAs(username: string, password: string): Promise<void> {
    // Username
    const usernameField = await findLocator(this.page, selectors.login.username);
    await usernameField.fill(username);

    // Password
    const passwordField = await findLocator(this.page, selectors.login.password);
    await passwordField.fill(password);

    // Submit
    const loginButton = await findLocator(this.page, selectors.login.loginBtn, { onlyInteractive: true });
    await loginButton.click();
  }

  /**
   * Return the trimmed error message text or null if absent.
   * - Uses firstText() which re-resolves once if the element detaches mid-read (flake guard).
   */
  async getErrorText(): Promise<string | null> {
    return firstText(this.page, selectors.login.error);
  }

  /**
   * Lightweight readiness probe (no assertions).
   * - Returns true if the username field is currently visible.
   * - Useful for conditional navigation (e.g., ensureOnLoginPage()).
   */
  async isLoaded(): Promise<boolean> {
    return !!(await findLocatorOrNull(this.page, selectors.login.username));
  }
}
