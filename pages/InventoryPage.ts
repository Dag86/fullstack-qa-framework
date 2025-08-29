import { Page } from '@playwright/test';
import { selectors, productSelectors } from './selectors';
import { findLocator, listLocator, toSelectorArray, allTexts } from '../utils/findLocator';

/**
 * POM for the SauceDemo Inventory (/inventory.html).
 * - Uses relative paths (resolved via Playwright baseURL).
 * - Single elements: findLocator() with selector fallbacks.
 * - Collections: listLocator() + allTexts() for fast, robust reads.
 */
export class InventoryPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate directly to the inventory page (prefer UI flow in end-to-end tests). */
  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  /** Wait until the product list container is visible (page readiness gate). */
  async expectLoaded(): Promise<void> {
    const list = await findLocator(this.page, selectors.products.list);
    await list.waitFor({ state: 'visible' });
  }

  /**
   * Retrieve all product names currently displayed.
   * Uses collection helpers (union selector under the hood) and batch text read.
   */
  async getProductNames(): Promise<string[]> {
    return allTexts(this.page, selectors.products.itemName); // already trimmed
  }

  /**
   * Open details for a specific product by its key (e.g., 'backpack').
   * Uses text filter with escaping handled by Playwright.
   */
  async viewProductDetails(productKey: keyof typeof productSelectors): Promise<void> {
    const { displayName } = productSelectors[productKey];
    await listLocator(this.page, selectors.products.itemName) // union of name selectors
      .filter({ hasText: displayName })                      // safe text match
      .first()
      .click();
  }

  /**
   * Add a specified product to the cart by product key.
   * Normalizes selectors to an array and requires an interactable button.
   */
  async addToCart(productKey: keyof typeof productSelectors): Promise<void> {
    const addSelectors = toSelectorArray(productSelectors[productKey].addToCart);
    const btn = await findLocator(this.page, addSelectors, { onlyInteractive: true });
    await btn.click();
  }

  /**
   * Remove a specified product from the inventory grid (not the cart page).
   * NOTE: This uses the product's *remove* selectors (fixes earlier copy-paste to addToCart).
   */
  async removeFromInventory(productKey: keyof typeof productSelectors): Promise<void> {
    const removeSelectors = toSelectorArray(productSelectors[productKey].removeFromCart);
    const btn = await findLocator(this.page, removeSelectors, { onlyInteractive: true });
    await btn.click();
  }

  /** Open the sidebar (burger) menu. */
  async openMenu(): Promise<void> {
    const btn = await findLocator(this.page, selectors.navigation.burgerMenuBtn);
    await btn.click();
  }

  /** Close the sidebar (burger) menu. */
  async closeMenu(): Promise<void> {
    const btn = await findLocator(this.page, selectors.navigation.closeMenu);
    await btn.click();
  }

  /** Navigate to the cart page via the cart icon in the header. */
  async goToCart(): Promise<void> {
    const cartLink = await findLocator(this.page, selectors.cart.cartLink);
    await cartLink.click();
  }
}
