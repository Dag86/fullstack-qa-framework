import { Page, expect } from '@playwright/test';
import { selectors, productSelectors } from './selectors';
import {
  findLocator,
  findLocatorOrNull,
  listLocator,
  allTexts, // helpers for collections (union selector + batch read)
  toSelectorArray
} from '../utils/findLocator';

/** Shape returned by getCartItems() */
type CartItem = { name: string; price: string };

/**
 * POM for the SauceDemo Cart (/cart.html)
 * - Uses relative paths so Playwright's baseURL resolves the full URL
 * - Single-element interactions go through findLocator / findLocatorOrNull
 * - Collections use listLocator + allTexts for performance and resilience
 */
export class CartPage {
  constructor(private page: Page) { }

  /**
   * Navigate to the cart page.
   * Prefer UI navigation in flow tests; this exists for direct jumps when needed.
   */
  async goto(): Promise<void> {
    await this.page.goto('/cart.html'); // resolved against use.baseURL
  }

  /**
   * Assert the cart page is loaded using a stable element (title), not the badge.
   * This avoids failures when the cart is empty and the badge is absent.
   */
  async expectLoaded(): Promise<void> {
    const header = await findLocator(this.page, selectors.navigation.title);
    await expect(header).toHaveText('Your Cart');
  }

  /**
   * Return the number in the cart badge.
   * If the badge doesn't exist (empty cart), return 0 instead of throwing.
   */
  async getItemCount(): Promise<number> {
    const badge = await findLocatorOrNull(this.page, selectors.cart.cartBadge);
    if (!badge) return 0;
    const text = await badge.textContent();
    const n = text ? parseInt(text, 10) : 0;
    return Number.isNaN(n) ? 0 : n; // defensive parsing
  }

  /**
   * Retrieve all cart items (name/price) efficiently.
   * - Uses listLocator to match ANY fallback selector for rows
   * - Uses allTexts() to batch-read names/prices (fewer protocol round-trips)
   * - If counts mismatch, warn (or throw when strict=true) and zip to the shorter length
   * @param strict when true, throw on name/price count mismatch instead of warning
   */
  async getCartItems(strict = false): Promise<CartItem[]> {
    // Row collection using all fallbacks (e.g., '.cart_item,[data-test="inventory-item"]')
    const rows = listLocator(this.page, selectors.cart.cartItem);
    if ((await rows.count()) === 0) return [];

    // Batch-read text from within the row scope; results are already trimmed
    const [names, prices] = await Promise.all([
      allTexts(rows, selectors.products.itemName),
      allTexts(rows, selectors.products.itemPrice),
    ]);

    // Validate we got a 1:1 mapping between names and prices
    if (names.length !== prices.length) {
      const msg = `CartPage.getCartItems: mismatched counts: names(${names.length}) vs prices(${prices.length})`;
      if (strict) throw new Error(msg);
      // eslint-disable-next-line no-console
      console.warn(msg);
    }

    // Zip pairs up to the shorter list to avoid creating phantom items
    const len = Math.min(names.length, prices.length);
    const items: CartItem[] = [];
    for (let i = 0; i < len; i++) {
      items.push({ name: names[i], price: prices[i] });
    }
    return items;
  }

  /**
   * Click the "Checkout" button to proceed to checkout step one.
   * Uses findLocator to resolve fallbacks and ensure the element is interactable.
   */
  async checkout(): Promise<void> {
    const btn = await findLocator(this.page, selectors.cart.checkoutBtn);
    await btn.click();
  }

  /**
   * Click the "Continue Shopping" button to return to inventory.
   */
  async continueShopping(): Promise<void> {
    const btn = await findLocator(this.page, selectors.cart.continueShoppingButton);
    await btn.click();
  }

  /**
   * Remove a specific product from the cart by product key.
   * - Validates the product key and presence of remove selectors for clearer errors
   * - Passes { onlyInteractive: true } so we don't click a hidden/disabled button
   */
  async removeFromCart(productKey: keyof typeof productSelectors): Promise<void> {
    const product = productSelectors[productKey];
    const removeSelectors = product?.removeFromCart;

    if (!Array.isArray(removeSelectors) || removeSelectors.length === 0) {
      throw new Error(
        `No 'removeFromCart' selector found for productKey: ${String(productKey)}`
      );
    }

    const btn = await findLocator(this.page, toSelectorArray(productSelectors[productKey].addToCart), { onlyInteractive: true });
    await btn.click();
  }
}
