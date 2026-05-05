import { test, expect } from '@playwright/test';

// Use a unique email if we were signing up, but since we are logging in, we assume a seed user exists
// If you don't have a seeder, these tests might fail on a fresh DB.
// For the sake of the test, we'll use standard credentials or test the UI interactions.

test.describe('Authentication & Dashboard Flow', () => {
  test('User can log in and is redirected to tasks dashboard', async ({ page }) => {
    // 1. Navigate to /login
    await page.goto('/login');

    // 2. Fill in credentials and submit
    // Note: Replace with actual seeded credentials if available in your environment
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // 3. Assert that the browser redirects to /tasks (the dashboard root)
    // Wait for URL to change to /tasks
    await page.waitForURL('**/tasks');

    // 4. Assert that the "Tasks" heading is visible
    const heading = page.getByRole('heading', { name: 'Tasks' });
    await expect(heading).toBeVisible();
  });

  test('User can update task status', async ({ page }) => {
    // To test task status update, we need to be logged in first.
    // For E2E tests, it's common to log in before each test or use browser context storage.
    // Here we perform a quick login.
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/tasks');

    // Wait for tasks to load (assuming task cards have a link to the detail page)
    // We'll click on the first task card to navigate to its detail page.
    // Since task data is dynamic, we wait for a generic link to a task.
    const firstTaskLink = page.locator('a[href^="/tasks/"]').first();
    await firstTaskLink.waitFor({ state: 'visible', timeout: 10000 });
    await firstTaskLink.click();

    // Now we are on the task detail page. Wait for URL.
    await page.waitForURL('**/tasks/*');

    // Find the status dropdown/button. We assume it's rendered.
    // The UI uses a select or a custom dropdown for status. 
    // We'll look for a button or select that shows the current status and allows changing.
    // Assuming there's a button with id "status-dropdown" or similar text.
    // Wait for the task details to load
    await expect(page.getByText('Status:')).toBeVisible();
    
    // We'll try to find a `<select>` or click the status badge to open a dropdown.
    // In our UI, status might be a select element inside TaskDetail, or an Edit modal.
    // Let's assume we click an "Edit" button to open the TaskModal.
    const editButton = page.getByRole('button', { name: 'Edit' }).first();
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Modal should be visible
      const statusSelect = page.locator('select[name="status"]');
      await statusSelect.selectOption('in_progress');
      
      const saveButton = page.getByRole('button', { name: 'Save Changes' });
      await saveButton.click();

      // Assert that a success toast appears
      // Sonner toasts usually have role="status" or exist in a list
      const toast = page.locator('li[data-sonner-toast]');
      await expect(toast).toBeVisible({ timeout: 5000 });
      await expect(toast).toContainText('updated successfully', { ignoreCase: true });
    } else {
      // If there's an inline select
      const inlineSelect = page.locator('select').first();
      await inlineSelect.selectOption({ index: 1 });
      
      // Assert toast
      const toast = page.locator('li[data-sonner-toast]');
      await expect(toast).toBeVisible({ timeout: 5000 });
    }
  });
});
