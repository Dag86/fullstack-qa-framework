import { Page, expect } from '@playwright/test';
import { selectors } from './selectors';
import { findLocator } from '../utils/findLocator';

/**
 * Page Object Model for the burger-menu (sidebar) navigation.
 * - Uses fallback-aware selectors via findLocator for robustness.
 * - Methods here *navigate* between app sections or external links.
 * - Assertions belong in tests; small post-conditions are used only to prove navigation.
 */
export class NavigationPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Open the sidebar (burger) menu.
   * Pass { onlyInteractive: true } so we don’t click a hidden/disabled button.
   */
  async openSidebar(): Promise<void> {
    const btn = await findLocator(this.page, selectors.navigation.burgerMenuBtn, { onlyInteractive: true });
    await btn.click();
  }

  /**
   * Close the sidebar.
   */
  async closeSidebar(): Promise<void> {
    const btn = await findLocator(this.page, selectors.navigation.closeMenu);
    await btn.click();
  }

  /**
   * Click the “All Items” link.
   * When clicked from Cart/Checkout, it returns to /inventory.html.
   * We attach the URL wait *before* the click inside Promise.all to avoid race conditions.
   */
  async goToAllItems(): Promise<void> {
    const link = await findLocator(this.page, selectors.navigation.allItems);
    await Promise.all([
      this.page.waitForURL(/.*inventory\.html/), // attach waiter first
      link.click(),                               // then trigger navigation
    ]);
  }

  /**
   * Click the “About” link.
   * This will navigate off-site (new URL in the same tab). Tests may prefer to assert with toHaveURL(/saucelabs\.com/).
   */
  async goToAbout(): Promise<void> {
    const link = await findLocator(this.page, selectors.navigation.about);
    await link.click();
  }

  /**
   * Click the “Logout” link and verify the login page is shown again.
   * We both wait for the root URL and verify the username field (element-based check is more robust).
   */
  async logout(): Promise<void> {
    const link = await findLocator(this.page, selectors.navigation.logout);

    // Attach the URL wait before issuing the click to avoid missing the navigation event.
    await Promise.all([
      this.page.waitForURL(/\/(?:index\.html)?(?:\?.*)?$/), // "/" or "/index.html", optional query string
      link.click(),
    ]);

    // Post-condition: the login form should be present again.
    const username = await findLocator(this.page, selectors.login.username);
    await expect(username).toBeVisible();
  }

  /**
   * Click the “Reset App State” link.
   * There is no visible toast; tests should verify via effects (e.g., cart badge disappears, cart items become 0).
   */
  async resetAppState(): Promise<void> {
    const link = await findLocator(this.page, selectors.navigation.resetAppState);
    await link.click();
  }

  /**
   * Footer social links. These typically open in a new tab/window.
   * In tests, use `const [popup] = await Promise.all([ context.waitForEvent('page'), nav.goToTwitter() ])`.
   */
  async goToTwitter(): Promise<void> {
    const link = await findLocator(this.page, selectors.navigation.twitterLink);
    await link.click();
  }

  async goToFacebook(): Promise<void> {
    const link = await findLocator(this.page, selectors.navigation.facebookLink);
    await link.click();
  }

  async goToLinkedIn(): Promise<void> {
    const link = await findLocator(this.page, selectors.navigation.linkedinLink);
    await link.click();
  }

  /**
   * Read the footer text. Returns null if the element is missing.
   * (Tests can assert on specific text or just presence.)
   */
  async getFooterText(): Promise<string | null> {
    const footer = await findLocator(this.page, selectors.navigation.footer);
    return footer.textContent();
  }
}
