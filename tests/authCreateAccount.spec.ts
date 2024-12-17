/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('http://localhost:3000/');
  
  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for the login container to be visible
  await page.waitForSelector('[data-testid="login-container"]', { timeout: 60000 });
  
  // Set up popup listener before clicking
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('button', { name: 'Continue with Google' }).click()
  ]);

  // Handle popup interactions
  await popup.waitForLoadState();
  await popup.getByRole('button', { name: 'Add new account' }).click();
  await popup.getByRole('button', { name: 'Auto-generate user information' }).click();
  await popup.getByRole('button', { name: 'Sign in with Google.com' }).click();
  
  // Wait for navigation after login
  await page.waitForURL('http://localhost:3000/workouts', { timeout: 60000 });
  await page.waitForLoadState('networkidle');
  
  // Wait for and verify navigation tabs
  const exercisesTab = page.getByRole('tab', { name: 'Exercises' });
  await expect(exercisesTab).toBeVisible({ timeout: 60000 });
  await exercisesTab.click();
  
  const workoutTrackerTab = page.getByRole('tab', { name: 'Workout Tracker' });
  await expect(workoutTrackerTab).toBeVisible({ timeout: 60000 });
  await workoutTrackerTab.click();
  
  const partnersTab = page.getByRole('tab', { name: 'Partners' });
  await expect(partnersTab).toBeVisible({ timeout: 60000 });
  await partnersTab.click();
  
  const chatTab = page.getByRole('tab', { name: 'Chat' });
  await expect(chatTab).toBeVisible({ timeout: 60000 });
  await chatTab.click();
  
  const logoutButton = page.getByRole('button', { name: 'Logout' });
  await expect(logoutButton).toBeVisible({ timeout: 60000 });
  await logoutButton.click();
});