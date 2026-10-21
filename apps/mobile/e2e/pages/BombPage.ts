import { Page, Locator } from '@playwright/test';

export class BombPage {
  readonly page: Page;
  readonly startButton: Locator;
  readonly passButton: Locator;
  readonly bombEmoji: Locator;
  readonly explosionText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startButton = page.locator('text="¡INICIAR BOMBA!"');
    this.passButton = page.locator('text="¡PÁSALA!"');
    this.bombEmoji = page.locator('text="💣"');
    this.explosionText = page.locator('text="¡BOOM!"');
  }

  async startRound() {
    await this.startButton.click();
  }

  async passTurn() {
    await this.passButton.click();
  }

  async waitForExplosion(timeout = 40000) {
    await this.explosionText.waitFor({ state: 'visible', timeout });
  }
}
