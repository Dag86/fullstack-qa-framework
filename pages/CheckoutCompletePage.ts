import { Page, expect } from '@playwright/test';
import { selectors } from './selectors';
import { findLocator, firstText } from '../utils/findLocator';

/**
 * Checkout Complete: "Thank you" screen
 * - Validates completion and returns home.
 */
export class CheckoutCompletePage {
  constructor(private page: Page) { }

  /** Direct navigation (rare) */
  async goto(): Promise<void> {
    await this.page.goto('/checkout-complete.html');
  }

  /** Stable readiness check */
  async expectLoaded(): Promise<void> {
    const header = await findLocator(this.page, selectors.checkout2.completeHeader);
    await expect(header).toBeVisible();
  }

  async getHeaderText(): Promise<string | null> {
    return firstText(this.page, selectors.checkout2.completeHeader);
  }

  async getBodyText(): Promise<string | null> {
    return firstText(this.page, selectors.checkout2.completeText);
  }

  /** Back to products (inventory) */
  async backHome(): Promise<void> {
    const btn = await findLocator(this.page, selectors.checkout2.backHomeBtn, { onlyInteractive: true });
    await btn.click();
  }
}
