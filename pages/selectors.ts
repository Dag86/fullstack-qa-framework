/**
 * Central selector registry.
 *
 * Conventions:
 * - Prefer [data-test="..."] first when available (most stable), then legacy classes/ids as fallbacks.
 * - Order matters: earlier selectors are tried first by findLocator()/listLocator().
 * - Keep selectors narrowly scoped to reduce false positives.
 */
export const selectors = {
  /** Login page controls and error banner */
  login: {
    // Username input (data-test preferred, id fallback)
    username: ['[data-test="username"]', '#user-name'],
    // Password input (data-test preferred, id fallback)
    password: ['[data-test="password"]', '#password'],
    // Login submit (data-test preferred; generic [type="submit"] as last resort)
    loginBtn: ['[data-test="login-button"]', '#login-button', '[type="submit"]'],
    // Inline login error container
    error: ['[data-test="error"]'], 
  },

  /** Inventory (product grid) */
  products: {
    // Container for the list of product cards
    list: ['[data-test="inventory-list"]', '.inventory_list'],
    // Single product card root
    item: ['[data-test="inventory-item"]', '.inventory_item'],
    // Product name within a card
    itemName: ['[data-test="inventory-item-name"]','.inventory_item_name'],
    // Product description within a card
    itemDescription: ['[data-test="inventory-item-desc"]', '.inventory_item_desc',],
    // Product price within a card
    itemPrice: ['[data-test="inventory-item-price"]', '.inventory_item_price'],
    // Sort drop-down (data-test preferred)
    sortDropdown: ['select[data-test="product-sort-container"]', '.product_sort_container'],
    // Currently active sort label (appears after selection)
    activeSortLabel: ['[data-test="active-option"]'],
  },

  /** Cart page + cart affordances in the header */
  cart: {
    // A single cart line item (used to iterate rows)
    cartItem: ['.cart_item', '[data-test="inventory-item"]'],
    // Header cart link/icon
    cartLink: ['.shopping_cart_link', '[data-test="shopping-cart-link"]'],
    // Cart item count badge (absent when cart is empty)
    cartBadge: ['.shopping_cart_badge'],
    // Quantity cell inside a cart row
    cartQuantity: ['.cart_quantity'],
    // Button to return to inventory from cart
    continueShoppingButton: ['[data-test="continue-shopping"]'],
    // Proceed to checkout button
    checkoutBtn: ['[data-test="checkout"]'],
  },

  /** Checkout step 1 (Your Information) */
  checkout1: {
    firstName: ['[data-test="firstName"]'],
    lastName: ['[data-test="lastName"]'],
    postalCode: ['[data-test="postalCode"]'],
    continueCheckoutBtn: ['[data-test="continue"]'],
    cancelCheckoutBtn: ['[data-test="cancel"]'],
    checkoutError: ['[data-test="error"]'],
    checkoutErrorXbtn: ['[data-test="error-button"]','.error-button'],
  },

  /** Checkout step 2 (Overview) + completion */
  checkout2: {
    // Summary labels/values
    paymentInfoLabel: ['[data-test="payment-info-label"]'],
    paymentInfoValue: ['[data-test="payment-info-value"]'],
    shippingInfoLabel: ['[data-test="shipping-info-label"]'],
    shippingInfoValue: ['[data-test="shipping-info-value"]'],
    totalInfoLabel: ['[data-test="total-info-label"]'],
    // Line items
    itemSubtotal: ['[data-test="subtotal-label"]'],
    itemTax: ['[data-test="tax-label"]'],
    itemTotal: ['[data-test="total-label"]'],
    // Finish, complete screen, and back-home
    finishCheckoutBtn: ['[data-test="finish"]'],
    completeHeader: ['[data-test="complete-header"]'],
    completeText: ['[data-test="complete-text"]'],
    backHomeBtn: ['[data-test="back-to-products"]'],
  },

  /** Top bar title + burger menu + footer links */
  navigation: {
    // Page title span (e.g., "Products", "Your Cart")
    title: ['.title', '[data-test="title"]'],
    // Burger open/close controls
    burgerMenuBtn: ['#react-burger-menu-btn', 'button[data-test="open-menu"]'],
    closeMenu: ['#react-burger-cross-btn', '[data-test="close-menu"]'],
    // Sidebar links
    allItems: ['[data-test="inventory-sidebar-link"]'],
    about: ['[data-test="about-sidebar-link"]'],
    logout: ['[data-test="logout-sidebar-link"]'],
    resetAppState: ['[data-test="reset-sidebar-link"]'],
    // Footer & social links
    footer: ['[data-test="footer"]'],
    twitterLink: ['[data-test="social-twitter"]'],
    facebookLink: ['[data-test="social-facebook"]'],
    linkedinLink: ['[data-test="social-linkedin"]'],
    footerCopyright: ['[data-test="footer-copy"]'],
  },
};

/**
 * Per-product metadata used to derive stable, product-specific selectors.
 * - slug maps to data-test attributes used by SauceDemo (e.g., add/remove button targets).
 * - displayName is used for human-readable assertions and text filters when needed.
 */
const productMeta = {
  backpack: {
    slug: 'sauce-labs-backpack',
    displayName: 'Sauce Labs Backpack',
    price: '$29.99',
    description:
      "carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.",
  },
  bike: {
    slug: 'sauce-labs-bike-light',
    displayName: 'Sauce Labs Bike Light',
    price: '$9.99',
    description:
      "A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.",
  },
  bolt: {
    slug: 'sauce-labs-bolt-t-shirt',
    displayName: 'Sauce Labs Bolt T-Shirt',
    price: '$15.99',
    description:
      'Get your testing superhero on with the Sauce Labs bolt T-shirt. From American Apparel, 100% ringspun combed cotton, heather gray with red bolt.',
  },
  jacket: {
    slug: 'sauce-labs-fleece-jacket',
    displayName: 'Sauce Labs Fleece Jacket',
    price: '$49.99',
    description:
      "It's not every day that you come across a midweight quarter-zip fleece jacket capable of handling everything from a relaxing day outdoors to a busy day at the office.",
  },
  onesie: {
    slug: 'sauce-labs-onesie',
    displayName: 'Sauce Labs Onesie',
    price: '$7.99',
    description:
      "Rib snap infant onesie for the junior automation engineer in development. Reinforced 3-snap bottom closure, two-needle hemmed sleeved and bottom won't unravel.",
  },
  tshirt: {
    slug: 'test.allthethings()-t-shirt-(red)',
    displayName: 'Test.allTheThings() T-Shirt (Red)',
    price: '$15.99',
    description:
      'This classic Sauce Labs t-shirt is perfect to wear when cozying up to your keyboard to automate a few tests. Super-soft and comfy, made from 100% ringspun combed cotton.',
  },
} as const;

/**
 * productSelectors:
 * - Builds concrete, per-product selector arrays for add/remove buttons and product image.
 * - Keeps the human-facing metadata (displayName/price/description) alongside selectors for tests.
 *
 * Note:
 * - Generic fallbacks (e.g., '.btn.btn_primary.btn_small.btn_inventory') are included as a last resort.
 * - Update slugs/display names here if SauceDemo changes data-test values.
 */
export const productSelectors = Object.fromEntries(
  Object.entries(productMeta).map(([id, meta]) => [
    id,
    {
      // Add-to-cart button: specific data-test first, generic button classes as fallback
      addToCart: [
        `button[data-test="add-to-cart-${meta.slug}"]`,
        '.btn.btn_primary.btn_small.btn_inventory',
      ],
      // Remove-from-cart button: specific data-test first, generic button classes as fallback
      removeFromCart: [
        `button[data-test="remove-${meta.slug}"]`,
        '.btn.btn_secondary.btn_small.btn_inventory',
      ],
      // Product image: specific data-test first, generic container as fallback
      image: [
        `img[data-test="inventory-item-${meta.slug}-img"]`,
        '.inventory_item_img',
      ],
      // Human-readable fields for assertions and text-based filters
      displayName: meta.displayName,
      price: meta.price,
      description: meta.description,
    },
  ])
) as Record<
  keyof typeof productMeta,
  {
    addToCart: string[];
    removeFromCart: string[];
    image: string[];
    displayName: string;
    price: string;
    description: string;
  }
>;
