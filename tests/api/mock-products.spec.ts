import { test, expect } from '@playwright/test';
import { enableMockApi, disableMockApi, ORIGIN } from '../../utils/mockApi';

test.describe('Mocked Products API', () => {
  test.beforeEach(async ({ page }) => {
    await enableMockApi(page);
    await page.goto(ORIGIN);
  });

  test.afterEach(async ({ page }) => {
    await disableMockApi(page);
  });

  test('GET /api/products returns list + total', async ({ page }) => {
    const res = await page.evaluate(async (origin) => {
      const r = await fetch(`${origin}/api/products`);
      return { status: r.status, body: await r.json() };
    }, ORIGIN);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
  });

  test('GET /api/products/1 returns a product', async ({ page }) => {
    const res = await page.evaluate(async (origin) => {
      const r = await fetch(`${origin}/api/products/1`);
      return { status: r.status, body: await r.json() };
    }, ORIGIN);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, title: expect.any(String), price: expect.any(Number) });
  });

  test('GET /api/products/999 returns 404', async ({ page }) => {
    const res = await page.evaluate(async (origin) => {
      const r = await fetch(`${origin}/api/products/999`);
      return { status: r.status, body: await r.json() };
    }, ORIGIN);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Not Found');
  });
});
