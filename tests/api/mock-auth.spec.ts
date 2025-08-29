import { test, expect } from '@playwright/test';
import { enableMockApi, disableMockApi, ORIGIN } from '../../utils/mockApi';

test.describe('Mocked Auth API', () => {
  test.beforeEach(async ({ page }) => {
    await enableMockApi(page);
    await page.goto(ORIGIN); // simple HTML shell
  });

  test.afterEach(async ({ page }) => {
    await disableMockApi(page);
  });

  test('valid login returns token', async ({ page }) => {
    const res = await page.evaluate(async (origin) => {
      const r = await fetch(`${origin}/api/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: 'standard_user', password: 'secret_sauce' })
      });
      return { status: r.status, body: await r.json() };
    }, ORIGIN);

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.username).toBe('standard_user');
  });

  test('invalid password returns 401 + message', async ({ page }) => {
    const res = await page.evaluate(async (origin) => {
      const r = await fetch(`${origin}/api/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: 'standard_user', password: 'nope' })
      });
      return { status: r.status, body: await r.json() };
    }, ORIGIN);

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Invalid');
  });

  test('locked user flagged but still 200', async ({ page }) => {
    const res = await page.evaluate(async (origin) => {
      const r = await fetch(`${origin}/api/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: 'locked_out_user', password: 'secret_sauce' })
      });
      return { status: r.status, body: await r.json() };
    }, ORIGIN);

    expect(res.status).toBe(200);
    expect(res.body.locked).toBe(true);
  });
});
