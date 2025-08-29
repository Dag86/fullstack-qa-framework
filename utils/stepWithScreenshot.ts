import { Page, test } from '@playwright/test';

/**
 * Wraps a step with a description, runs the step, and attaches a screenshot to the report.
 * @param page - The Playwright page object
 * @param description - Step description for the report
 * @param stepFn - The function to execute for this step
 */
export async function stepWithScreenshot(
  page: Page,
  description: string,
  stepFn: () => Promise<void>
) {
  await test.step(description, async () => {
    await stepFn();
    const screenshot = await page.screenshot();
    await test.info().attach(description, {
      body: screenshot,
      contentType: 'image/png'
    });
  });
}
