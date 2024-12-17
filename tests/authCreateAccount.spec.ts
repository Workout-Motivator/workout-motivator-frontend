/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  const page1 = await page1Promise;
  
  await page1.getByRole('button', { name: 'Add new account' }).click();
  await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
  await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();
  
  // Wait for navigation and full page load after login
  await page.waitForURL('http://localhost:3000/workouts');
  await page.waitForLoadState('networkidle');
  
  // Wait for the tab to be visible and clickable
  const exercisesTab = page.getByRole('tab', { name: 'Exercises' });
  await exercisesTab.waitFor({ state: 'visible', timeout: 10000 });
  await expect(exercisesTab).toBeEnabled();
  await exercisesTab.click();

  // Wait for the workout tracker tab and click
  const workoutTrackerTab = page.getByRole('tab', { name: 'Workout Tracker' });
  await workoutTrackerTab.waitFor({ state: 'visible', timeout: 10000 });
  await expect(workoutTrackerTab).toBeEnabled();
  await workoutTrackerTab.click();

  // Wait for partners tab and click
  const partnersTab = page.getByRole('tab', { name: 'Partners' });
  await partnersTab.waitFor({ state: 'visible', timeout: 10000 });
  await expect(partnersTab).toBeEnabled();
  await partnersTab.click();

  // Wait for chat tab and click
  const chatTab = page.getByRole('tab', { name: 'Chat' });
  await chatTab.waitFor({ state: 'visible', timeout: 10000 });
  await expect(chatTab).toBeEnabled();
  await chatTab.click();

  // Wait for logout button and click
  const logoutButton = page.getByRole('button', { name: 'Logout' });
  await logoutButton.waitFor({ state: 'visible', timeout: 10000 });
  await expect(logoutButton).toBeEnabled();
  await logoutButton.click();
});