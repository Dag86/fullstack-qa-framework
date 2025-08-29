// utils/mockApi.ts
import { Page, Route, Request } from '@playwright/test';
import { users, products } from '../fixtures/mock-data';

const ORIGIN = process.env.MOCK_ORIGIN || 'http://mock.local';

function json(route: Route, status: number, body: unknown) {
  return route.fulfill({
    status,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
}

function html(route: Route, status: number, body: string) {
  return route.fulfill({
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
    body
  });
}

export async function enableMockApi(page: Page) {
  // Serve a tiny HTML shell so we can call fetch() from the page.
  await page.route(`${ORIGIN}/`, async (route) => {
    return html(route, 200, `<!doctype html><title>Mock</title><h1>Mock Origin</h1>`);
  });

  // POST /api/login
await page.route(`${ORIGIN}/api/login`, async (route, req) => {
  if (req.method().toUpperCase() !== 'POST') {
    return json(route, 405, { message: 'Method Not Allowed' });
  }

  let payload: any = {};
  try {
    payload = req.postDataJSON(); // <-- sync, can throw
  } catch {
    payload = {};
  }

  const { username, password } = payload as { username?: string; password?: string };

  const user = users.find(u => u.username === username);
  if (!user || user.password !== password) {
    return json(route, 401, { message: 'Invalid credentials' });
  }

  const body = {
    id: user.id,
    username: user.username,
    token: user.token,
    locked: user.username === 'locked_out_user'
  };
  return json(route, 200, body);
});

  // GET /api/products
  await page.route(`${ORIGIN}/api/products`, async (route, req) => {
    if (req.method().toUpperCase() !== 'GET') {
      return json(route, 405, { message: 'Method Not Allowed' });
    }
    return json(route, 200, { products, total: products.length });
  });

  // GET /api/products/:id
  await page.route(new RegExp(`^${escapeRegex(ORIGIN)}/api/products/(\\d+)$`), async (route, req) => {
    if (req.method().toUpperCase() !== 'GET') {
      return json(route, 405, { message: 'Method Not Allowed' });
    }
    const idStr = req.url().split('/').pop()!;
    const id = Number(idStr);
    const product = products.find(p => p.id === id);
    if (!product) return json(route, 404, { message: 'Not Found' });
    return json(route, 200, product);
  });
}

export async function disableMockApi(page: Page) {
  // Remove all routes that target our mock origin
  await page.unroute(`${ORIGIN}/`);
  await page.unroute(`${ORIGIN}/api/login`);
  await page.unroute(`${ORIGIN}/api/products`);
  await page.unroute(new RegExp(`^${escapeRegex(ORIGIN)}/api/products/(\\d+)$`));
}

export { ORIGIN };

// Small util to escape regex meta-characters in ORIGIN
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
