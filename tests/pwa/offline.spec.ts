import { test, expect } from '@playwright/test'

// These E2E tests assume the dev server is running on http://localhost:3000

test.describe('PWA offline & install behaviors', () => {
  test('offline banner displayed and upload disabled', async ({ page }) => {
    await page.goto('/')
    // Ensure we are online initially
    await expect(page.locator('text=You are offline. Viewing cached data.')).toHaveCount(0)
    // Go offline and refresh
    await page.setOffline(true)
    await page.reload()
    // The offline banner should be visible
    await expect(page.locator('text=You are offline. Viewing cached data.')).toBeVisible()
    // The upload button should be disabled
    const uploadButton = page.getByRole('button', { name: /choose file/i })
    await expect(uploadButton).toBeDisabled()
  })

  test('install prompt reacts to beforeinstallprompt', async ({ page }) => {
    await page.goto('/')
    // Simulate beforeinstallprompt: the app listens for this and shows an Install button
    await page.evaluate(() => {
      // Create a fake event with prompt + userChoice properties
      const ev = new Event('beforeinstallprompt') as any
      ev.prompt = () => Promise.resolve()
      ev.userChoice = Promise.resolve({ outcome: 'accepted' })
      window.dispatchEvent(ev)
    })
    // Expect the Install button to appear
    const btn = page.getByRole('button', { name: /install cora/i })
    await expect(btn).toBeVisible()
  })
})
