import { Page, Locator } from '@playwright/test';

export class CharadesPage {
  readonly page: Page;
  readonly startButton: Locator;
  readonly timerText: Locator;
  readonly wordText: Locator;
  readonly scoreText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startButton = page.locator('text="¡EMPEZAR (60s)!"');
    this.timerText = page.locator('text=/\\d+s/');
    this.wordText = page.locator('text="Puntos: 0"'); // Identificador aproximado, en un entorno real usaríamos testIDs
    this.scoreText = page.locator('text=/Puntuación:/');
  }

  async startGame() {
    await this.startButton.click();
  }

  async getTimerValue() {
    return await this.timerText.textContent();
  }
}
