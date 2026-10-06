import { Page, Locator } from '@playwright/test';

export class MostLikelyPage {
  readonly page: Page;
  readonly screenArea: Locator;
  readonly questionText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.screenArea = page.locator('[data-testid="most-likely-screen"]');
    this.questionText = page.locator('[data-testid="question-text"]');
  }

  async tapScreen() {
    await this.screenArea.click();
  }

  async getCurrentQuestionText() {
    return await this.questionText.textContent();
  }
}
