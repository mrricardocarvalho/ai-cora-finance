import { test, expect } from '@playwright/test'

// Render the planning page, fill Add Goal target, and check format preview updates

test('format preview updates when typing localized numbers', async ({ page }) => {
  await page.goto('/planning')
  // Ensure the goal target input exists
  const input = page.locator('#goal-target')
  await expect(input).toBeVisible()
  // Clear then type localized number (1.234,56)
  await input.fill('')
  await input.type('1.234,56')
  // Wait for the preview to show formatted currency
  const preview = page.locator('text=1.234,56')
  await expect(preview).toBeVisible()
})
