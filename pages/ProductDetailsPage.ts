// pages/ProductDetailsPage.ts
import { Page, expect } from '@playwright/test';
import { selectors, productSelectors } from './selectors';
import { findLocator, findLocatorOrNull, firstText, toSelectorArray, listLocator } from '../utils/findLocator';

export class ProductDetailsPage {
  constructor(private page: Page) {}

  /** Optional direct nav if you know the id query, e.g. 'id=4' */
  async gotoById(query: string): Promise<void> {
    await this.page.goto(`/inventory-item.html?${query}`);
  }

  /** Readiness: ensure the specific product’s image (or name) is visible */
  async expectLoaded(productKey: keyof typeof productSelectors): Promise<void> {
    const img = await findLocator(this.page, productSelectors[productKey].image);
    await expect(img).toBeVisible();

    // Optional extra: check the “Back to products” button exists
    const back = await findLocatorOrNull(this.page, selectors.checkout2.backHomeBtn);
    expect(!!back).toBeTruthy();
  }

  /** Back to inventory grid */
  async backToProducts(): Promise<void> {
    const btn = await findLocator(this.page, selectors.checkout2.backHomeBtn, { onlyInteractive: true });
    await btn.click();
  }

  /** Header cart icon → cart page */
  async goToCart(): Promise<void> {
    const cartLink = await findLocator(this.page, selectors.cart.cartLink);
    await cartLink.click();
  }

  /** Add/remove on details page (same per-product buttons) */
  async addToCart(key: keyof typeof productSelectors): Promise<void> {
    const add = toSelectorArray(productSelectors[key].addToCart);
    const btn = await findLocator(this.page, add, { onlyInteractive: true });
    await btn.click();
  }
  async removeFromCart(key: keyof typeof productSelectors): Promise<void> {
    const rem = toSelectorArray(productSelectors[key].removeFromCart);
    const btn = await findLocator(this.page, rem, { onlyInteractive: true });
    await btn.click();
  }

  /** Text getters — use unified product selectors (work on grid *and* details) */
  async getName(): Promise<string | null> {
    return firstText(this.page, selectors.products.itemName);
  }
  async getPrice(): Promise<string | null> {
    return firstText(this.page, selectors.products.itemPrice);
  }
  async getDescription(): Promise<string | null> {
    return firstText(this.page, selectors.products.itemDescription);
  }

  /** Verify details page shows the expected product name */
  async expectNameMatches(key: keyof typeof productSelectors): Promise<void> {
    const { displayName } = productSelectors[key];
    await listLocator(this.page, selectors.products.itemName)
      .filter({ hasText: displayName })
      .first()
      .waitFor({ state: 'visible' });
  }
}
