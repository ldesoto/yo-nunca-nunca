import { test, expect } from '@playwright/test';
import { MainMenuPage } from '../pages/MainMenuPage';
import { MostLikelyPage } from '../pages/MostLikelyPage';

test.describe('Party Games Expansion Tests', () => {
  test('Debe navegar a la pantalla de ¿Quién es más probable?', async ({ page }) => {
    const mainMenu = new MainMenuPage(page);
    await mainMenu.goto();
    
    await mainMenu.navigateToMostLikely();
    
    await expect(page.locator('text="¿Quién es más probable que..."')).toBeVisible();
  });

  test('Debe cambiar el texto de la pregunta al hacer tap en la pantalla', async ({ page }) => {
    const mainMenu = new MainMenuPage(page);
    const mostLikelyPage = new MostLikelyPage(page);

    await mainMenu.goto();
    await mainMenu.navigateToMostLikely();

    const initialQuestion = await mostLikelyPage.getCurrentQuestionText();
    expect(initialQuestion).toBeTruthy();

    await mostLikelyPage.tapScreen();
    await page.waitForTimeout(100);

    const nextQuestion = await mostLikelyPage.getCurrentQuestionText();
    expect(nextQuestion).not.toEqual(initialQuestion);
  });
});
