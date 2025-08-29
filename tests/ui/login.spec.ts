import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import users from '../../fixtures/users.json';
import { stepWithScreenshot } from '../../utils/stepWithScreenshot';

test('Login succeeds with standard user', async ({ page }) => {
  const login = new LoginPage(page);

  await stepWithScreenshot(page, 'Go to login page', async () => {
    await login.goto();
  });

  await stepWithScreenshot(page, 'Fill in username and password', async () => {
    await login.loginAs(users.standard.username, users.standard.password);
  });

  await stepWithScreenshot(page, 'Verify successful login (navigated to inventory)', async () => {
    await expect(page).toHaveURL(/inventory/);
  });
});

test('Login shows error with locked out user', async ({ page }) => {
  const login = new LoginPage(page);

  await stepWithScreenshot(page, 'Go to login page', async () => {
    await login.goto();
  });

  await stepWithScreenshot(page, 'Fill in locked out user credentials and submit', async () => {
    await login.loginAs(users.locked.username, users.locked.password);
  });

  await stepWithScreenshot(page, 'Verify error message for locked out user', async () => {
    const errorMsg = await login.getErrorText();
    expect(errorMsg).toContain('locked out');
  });
});

test('Login fails with invalid credentials', async ({ page }) => {
  const login = new LoginPage(page);

  await stepWithScreenshot(page, 'Go to login page', async () => {
    await login.goto();
  });

  await stepWithScreenshot(page, 'Fill in invalid credentials and submit', async () => {
    await login.loginAs('not_a_user', 'bad_password');
  });

  await stepWithScreenshot(page, 'Verify error message for invalid credentials', async () => {
    const errorMsg = await login.getErrorText();
    expect(errorMsg).not.toBeNull();
  });
});
