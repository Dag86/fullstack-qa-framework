/**
 * Converts product/item names to kebab-case used in SauceDemo's data-test attributes.
 * Example: "Sauce Labs Backpack" → "sauce-labs-backpack"
 * "Test.allTheThings() T-Shirt (Red)" → "test-allthethings-t-shirt-red"
 */
export function slugifyItemName(itemName: string): string {
  return itemName
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')      // remove anything that's not word, space, or dash
    .replace(/\s+/g, '-')          // replace spaces with dash
    .replace(/-+/g, '-');          // collapse multiple dashes if any
}
