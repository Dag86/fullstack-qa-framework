// tests/ui/checkout.spec.ts
import { test, expect } from '@playwright/test';
import usersRaw from '../../fixtures/users.json';
import productsRaw from '../../fixtures/test-products.json';
import { productSelectors } from '../../pages/selectors';

import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutStepOnePage } from '../../pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from '../../pages/CheckoutStepTwoPage';
import { CheckoutCompletePage } from '../../pages/CheckoutCompletePage';

// --- Fixture typing ---
type TestUser = { username: string; password: string; shouldSucceed: boolean; expectedError?: string };
type ProductMeta = { name: string; dataTestName: string };
type ProductKey = keyof typeof productSelectors;

const users    = usersRaw as Record<string, TestUser>;
const products = productsRaw as Record<ProductKey, ProductMeta>;
const { username, password } = users.standard;

test.beforeEach(async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.loginAs(username, password);
});

// Happy path end-to-end checkout
test('Should complete checkout with one item', async ({ page }) => {
  const inventory = new InventoryPage(page);
  const cart      = new CartPage(page);
  const step1     = new CheckoutStepOnePage(page);
  const step2     = new CheckoutStepTwoPage(page);
  const done      = new CheckoutCompletePage(page);

  // Arrange: add one product from fixtures
  const KEY: ProductKey = 'backpack';
  const { name } = products[KEY];

  await inventory.expectLoaded();
  await inventory.addToCart(KEY);
  await inventory.goToCart();
  await cart.expectLoaded();

  // Act: checkout flow
  await cart.checkout();

  await step1.expectLoaded();
  await step1.fillCustomerInfo('Jane', 'Doe', '12345');
  await step1.continue();

  await step2.expectLoaded();
  const items = await step2.getOverviewItems();
  expect(items.map(i => i.name)).toContain(name);
  await step2.finish();

  // Assert: complete page then back home
  await done.expectLoaded();
  expect(await done.getHeaderText()).toMatch(/thank you for your order/i);
  await done.backHome();

  await inventory.expectLoaded();
});

// Validation: inline error on Step One (uses checkout1.checkoutError / checkoutErrorXbtn)
test('Should show inline error when postal code is missing', async ({ page }) => {
  const inventory = new InventoryPage(page);
  const cart      = new CartPage(page);
  const step1     = new CheckoutStepOnePage(page);

  await inventory.expectLoaded();
  await inventory.addToCart('bike');      // any product will do
  await inventory.goToCart();
  await cart.expectLoaded();
  await cart.checkout();

  await step1.expectLoaded();
  await step1.fillCustomerInfo('Jane', 'Doe', ''); // missing postal code
  await step1.continue();

  // Expect the checkout-specific inline error
  await step1.expectInlineErrorContains(/postal code is required/i);

  // Optional: dismiss the error, then verify it’s gone
  await step1.dismissInlineError();
  expect(await step1.getInlineError()).toBeNull();
});
