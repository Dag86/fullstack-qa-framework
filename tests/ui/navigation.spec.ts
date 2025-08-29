import { test, expect } from '@playwright/test';
import usersRaw from '../../fixtures/users.json';
import productsRaw from '../../fixtures/test-products.json';
import { productSelectors, selectors } from '../../pages/selectors'; // for ProductKey typing + nav selectors
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { NavigationPage } from '../../pages/NavigationPage';

/**
 * Types for fixtures (lightweight and local to this spec).
 * - TestUser: shape of entries in users.json
 * - ProductMeta: shape of entries in test-products.json
 * - ProductKey: keys must match productSelectors (backpack, bike, ...)
 */
type TestUser = { username: string; password: string; shouldSucceed: boolean; expectedError?: string };
type ProductMeta = { name: string; dataTestName: string };
type ProductKey = keyof typeof productSelectors;

// Materialize/annotate fixtures so TS can help us everywhere below.
const users = usersRaw as Record<string, TestUser>;
const products = productsRaw as Record<ProductKey, ProductMeta>;

// Choose which user logs in for these nav tests (standard user succeeds).
const { username, password } = users.standard;

/**
 * Test setup:
 * - Navigate to login (resolved against baseURL from playwright.config.ts)
 * - Sign in using fixture credentials (no hardcoded creds)
 */
test.beforeEach(async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.loginAs(username, password);
});

test('Should open and close sidebar menu', async ({ page }) => {
  const inventory = new InventoryPage(page);
  const nav = new NavigationPage(page);

  await inventory.expectLoaded();

  // Open sidebar and verify a known link becomes visible
  await nav.openSidebar();
  const allItems = page.locator(selectors.navigation.allItems.join(',')).first(); // union of fallbacks
  await expect(allItems).toBeVisible();

  // Close sidebar and verify the link hides
  await nav.closeSidebar();
  await expect(allItems).toBeHidden();
});

test('Should return to inventory when clicking All Items from Cart', async ({ page }) => {
  const inventory = new InventoryPage(page);
  const cart = new CartPage(page);
  const nav = new NavigationPage(page);

  // Pick a product from fixtures (keys aligned with productSelectors)
  const KEY: ProductKey = 'backpack';
  const { name } = products[KEY];

  await inventory.expectLoaded();

  // Add product, navigate to cart, and ensure cart page is loaded
  await inventory.addToCart(KEY);
  await inventory.goToCart();
  await cart.expectLoaded();

  // From cart, use the sidebar "All Items" to return to inventory
  await nav.openSidebar();
  await nav.goToAllItems();       // waits for /inventory.html internally (race-free)
  await inventory.expectLoaded();

  // Sanity: product list contains our product name (fixture-driven)
  const names = await inventory.getProductNames();
  expect(names).toContain(name);
});

test('Should navigate off‐site when clicking About link', async ({ page }) => {
  const nav = new NavigationPage(page);

  await nav.openSidebar();
  await nav.goToAbout();          // navigates to Sauce Labs marketing site
  await expect(page).toHaveURL(/saucelabs\.com/);
});

test('Should clear cart when Reset App State clicked', async ({ page }) => {
  const inventory = new InventoryPage(page);
  const cart = new CartPage(page);
  const nav = new NavigationPage(page);

  // Use a product key from fixtures (we don't need the display name here)
  const KEY: ProductKey = 'bike';

  await inventory.expectLoaded();
  await inventory.addToCart(KEY);
  await inventory.goToCart();
  expect(await cart.getItemCount()).toBeGreaterThan(0); // precondition: cart not empty

  // Reset app state (no toast—assert via cart effects)
  await nav.openSidebar();
  await nav.resetAppState();
  await nav.closeSidebar();

  // Re-open cart and assert it is empty
  await inventory.goToCart();
  await cart.expectLoaded();
  expect(await cart.getItemCount()).toBe(0);
});

test('Should sign out and protect inventory on Logout', async ({ page }) => {
  const nav = new NavigationPage(page);

  // Logout should return to login/root and show the username field (checked inside logout())
  await nav.openSidebar();
  await nav.logout();
  await expect(page).toHaveURL(/\/$/); // path-only match to stay env-portable

  // Direct nav to inventory should be blocked/redirected when logged out
  await page.goto('/inventory.html');
  await expect(page).toHaveURL(/\/$/);
});

test('Should open Twitter link in a new tab', async ({ page, context }) => {
  const nav = new NavigationPage(page);

  await nav.openSidebar();

  // Social links open a new tab/window; capture it via context.waitForEvent('page')
  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    nav.goToTwitter(),
  ]);

  await popup.waitForLoadState('domcontentloaded');
  await expect(popup).toHaveURL(/x\.com/); // Twitter redirects to x.com
});

test('Should open Facebook link in a new tab', async ({ page, context }) => {
  const nav = new NavigationPage(page);

  await nav.openSidebar();

  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    nav.goToFacebook(),
  ]);

  await popup.waitForLoadState('domcontentloaded');
  await expect(popup).toHaveURL(/facebook\.com/);
});

test('Should open LinkedIn link in a new tab', async ({ page, context }) => {
  const nav = new NavigationPage(page);

  await nav.openSidebar();

  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    nav.goToLinkedIn(),
  ]);

  await popup.waitForLoadState('domcontentloaded');
  await expect(popup).toHaveURL(/linkedin\.com/);
});

test('Should display correct footer copyright text', async ({ page }) => {
  // Footer lives in the main layout; read text via selectors registry
  const text = await page.locator(selectors.navigation.footer.join(',')).textContent();
  expect(text).toMatch(/© 202\d Sauce Labs\. All Rights Reserved\./);
});
