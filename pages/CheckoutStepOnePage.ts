import { Page, expect } from '@playwright/test';
import { selectors } from './selectors';
import { findLocator, findLocatorOrNull, firstText } from '../utils/findLocator';

/**
 * Checkout Step One: "Your Information"
 * - Fills customer info and continues to the Overview step.
 */
export class CheckoutStepOnePage {
  constructor(private page: Page) {}

  /** Direct navigation (optional – usually reached via CartPage.checkout()) */
  async goto(): Promise<void> {
    await this.page.goto('/checkout-step-one.html');
  }

  /** Stable readiness check */
  async expectLoaded(): Promise<void> {
    const title = await findLocator(this.page, selectors.navigation.title);
    await expect(title).toHaveText('Checkout: Your Information');
  }

  /** Fill customer form */
  async fillCustomerInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await (await findLocator(this.page, selectors.checkout1.firstName)).fill(firstName);
    await (await findLocator(this.page, selectors.checkout1.lastName)).fill(lastName);
    await (await findLocator(this.page, selectors.checkout1.postalCode)).fill(postalCode);
  }

  /** Continue to Step Two (Overview) */
  async continue(): Promise<void> {
    const btn = await findLocator(this.page, selectors.checkout1.continueCheckoutBtn, { onlyInteractive: true });
    await btn.click();
  }

  /** Cancel back to Cart */
  async cancel(): Promise<void> {
    const btn = await findLocator(this.page, selectors.checkout1.cancelCheckoutBtn, { onlyInteractive: true });
    await btn.click();
  }

  /**
   * Return the trimmed inline error text shown above the form, or null if absent.
   * Uses the new checkout-specific selector instead of login.error.
   */
  async getInlineError(): Promise<string | null> {
    return firstText(this.page, selectors.checkout1.checkoutError);
  }

  /**
   * Click the small “X” button on the inline error (if present).
   * Safe no-op when the error is not shown.
   */
  async dismissInlineError(): Promise<void> {
    const btn = await findLocatorOrNull(this.page, selectors.checkout1.checkoutErrorXbtn);
    if (!btn) return;
    await btn.click();
  }

  /**
   * Convenience: assert an inline error appears and (optionally) contains text.
   */
  async expectInlineErrorContains(text?: RegExp | string): Promise<void> {
    const err = await findLocator(this.page, selectors.checkout1.checkoutError);
    await expect(err).toBeVisible();
    if (text) await expect(err).toContainText(text);
  }
}
