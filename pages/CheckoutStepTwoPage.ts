import { Page, expect } from '@playwright/test';
import { selectors } from './selectors';
import { findLocator, listLocator, allTexts, firstText } from '../utils/findLocator';

type OverviewItem = { name: string; price: string };

/**
 * Checkout Step Two: "Overview"
 * - Reads summary values and finishes the order.
 */
export class CheckoutStepTwoPage {
  constructor(private page: Page) { }

  /** Direct navigation (optional) */
  async goto(): Promise<void> {
    await this.page.goto('/checkout-step-two.html');
  }

  /** Stable readiness check */
  async expectLoaded(): Promise<void> {
    const title = await findLocator(this.page, selectors.navigation.title);
    await expect(title).toHaveText('Checkout: Overview');
  }

  /** Line items shown in overview (name/price pairs) */
  async getOverviewItems(): Promise<OverviewItem[]> {
    const rows = listLocator(this.page, selectors.cart.cartItem);
    if ((await rows.count()) === 0) return [];

    const [names, prices] = await Promise.all([
      allTexts(rows, selectors.products.itemName),
      allTexts(rows, selectors.products.itemPrice),
    ]);

    const len = Math.min(names.length, prices.length);
    const items: OverviewItem[] = [];
    for (let i = 0; i < len; i++) items.push({ name: names[i], price: prices[i] });
    return items;
  }

  /** Summary fields */
  async getPaymentInfo(): Promise<string | null> {
    return firstText(this.page, selectors.checkout2.paymentInfoValue);
  }

  async getShippingInfo(): Promise<string | null> {
    return firstText(this.page, selectors.checkout2.shippingInfoValue);
  }

  async getItemSubtotal(): Promise<string | null> {
    return firstText(this.page, selectors.checkout2.itemSubtotal);
  }

  async getTax(): Promise<string | null> {
    return firstText(this.page, selectors.checkout2.itemTax);
  }

  async getTotal(): Promise<string | null> {
    return firstText(this.page, selectors.checkout2.itemTotal);
  }

  /** Finish (place order) */
  async finish(): Promise<void> {
    const btn = await findLocator(this.page, selectors.checkout2.finishCheckoutBtn, { onlyInteractive: true });
    await btn.click();
  }

  /** Cancel back to inventory or previous step */
  async cancel(): Promise<void> {
    const btn = await findLocator(this.page, selectors.checkout1.cancelCheckoutBtn, { onlyInteractive: true });
    await btn.click();
  }
}
