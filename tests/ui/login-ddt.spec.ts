import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import users from '../../fixtures/users.json';
import { stepWithScreenshot } from '../../utils/stepWithScreenshot';

const userCases = Object.entries(users); // e.g., [['standard', {...}], ['locked', {...}]]

for (const [key, user] of userCases) {
  test(`Login ${user.shouldSucceed ? 'succeeds' : 'shows error'} with ${key} user`, async ({ page }) => {
    const login = new LoginPage(page);

    await stepWithScreenshot(page, `Go to login page (${key} user)`, async () => {
      await login.goto();
    });

    await stepWithScreenshot(page, `Fill credentials and submit (${key} user)`, async () => {
      await login.loginAs(user.username, user.password);
    });

    if (user.shouldSucceed) {
      await stepWithScreenshot(page, `Verify success for ${key} user`, async () => {
        await expect(page).toHaveURL(/inventory/);
      });
    } else {
      await stepWithScreenshot(page, `Verify error for ${key} user`, async () => {
        const errorMsg = await login.getErrorText();
        expect(errorMsg).not.toBeNull();
      });
    }
  });
}
