// utils/findLocator.ts
import { Page, Locator } from '@playwright/test';

/**
 * Resolve the FIRST matching locator from a list of fallback selectors.
 * - Checks visibility (and optionally "interactable"/enabled) in the given scope.
 * - Returns the FIRST visible/enabled element as a Locator.
 * - Throws if none match (use findLocatorOrNull for optional elements).
 *
 * ⚠️ This is a probe/lookup, not an assertion. If you need to assert visibility,
 *    prefer: await expect(locator).toBeVisible() for auto-wait + better errors.
 */
export async function findLocator(
  pageOrScope: Page | Locator,
  selectors: string[],
  opts?: { onlyInteractive?: boolean } // when true, also require isEnabled()
): Promise<Locator> {
  for (const sel of selectors) {
    const loc = pageOrScope.locator(sel).first();

    // Visible?
    const visible = await loc.isVisible().catch(() => false);
    if (!visible) continue;

    // Interactable?
    if (opts?.onlyInteractive) {
      const enabled = await loc.isEnabled().catch(() => false);
      if (!enabled) continue;
    }

    return loc; // first visible(/enabled) match
  }
  throw new Error(`No matching locator found for: ${selectors.join(', ')}`);
}

/**
 * Resolve the FIRST matching locator from a list of fallback selectors OR return null.
 * - Useful for optional/conditional elements (e.g., empty cart badge).
 */
export async function findLocatorOrNull(
  pageOrScope: Page | Locator,
  selectors: string[]
): Promise<Locator | null> {
  for (const sel of selectors) {
    const loc = pageOrScope.locator(sel).first();
    if (await loc.isVisible().catch(() => false)) return loc;
  }
  return null;
}

/**
 * Build a CSS UNION from fallback selectors, e.g. ['a', '.b'] → 'a,.b'
 * - Filters falsy values, dedupes while preserving order.
 * - Used by listLocator/allTexts to query collections across fallbacks.
 */
export function unionSelector(selectors: string[]): string {
  return [...new Set(selectors.filter(Boolean))].join(',');
}

/**
 * Return a Locator for a COLLECTION that matches ANY of the fallback selectors.
 * - Use this for lists/rows/items (not single elements).
 */
export function listLocator(pageOrScope: Page | Locator, selectors: string[]): Locator {
  return pageOrScope.locator(unionSelector(selectors));
}

/**
 * Normalize a selector or selector[] to selector[].
 * - Handy when a value might be a single string (e.g., data from JSON).
 */
export function toSelectorArray(sel: string | string[]): string[] {
  return Array.isArray(sel) ? sel : [sel];
}

/**
 * Safely read text from the FIRST matching element.
 * - Tries fallbacks via findLocatorOrNull; returns null if not found.
 * - If the element detaches between lookup and read, re-resolves once and retries.
 * - Optionally trims the result (default: true).
 */
export async function firstText(
  pageOrScope: Page | Locator,
  selectors: string[],
  trim = true
): Promise<string | null> {
  let el = await findLocatorOrNull(pageOrScope, selectors);
  if (!el) return null;

  try {
    const t = await el.textContent();
    return trim ? t?.trim() ?? null : t;
  } catch {
    // Element likely detached — re-resolve once and try again.
    el = await findLocatorOrNull(pageOrScope, selectors);
    const t = el ? await el.textContent().catch(() => null) : null;
    return trim ? t?.trim() ?? null : t;
  }
}

/**
 * Batch-read text content from a COLLECTION using fallback selectors.
 * - Uses a union selector under the hood and Playwright's allTextContents().
 * - Returns an array of strings (Playwright guarantees string[], not null).
 * - Trims each entry by default.
 */
export async function allTexts(
  pageOrScope: Page | Locator,
  selectors: string[],
  trim = true
): Promise<string[]> {
  const texts = await listLocator(pageOrScope, selectors).allTextContents(); // string[]
  return trim ? texts.map(t => t.trim()) : texts;
}
