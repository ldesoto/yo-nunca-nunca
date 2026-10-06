import { Page, Locator } from '@playwright/test';

export class MainMenuPage {
  readonly page: Page;
  readonly mostLikelyBtn: Locator;
  readonly twoTruthsBtn: Locator;
  readonly truthOrDrinkBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mostLikelyBtn = page.locator('[data-testid="menu-item-MostLikely"]');
    this.twoTruthsBtn = page.locator('[data-testid="menu-item-TwoTruths"]');
    this.truthOrDrinkBtn = page.locator('[data-testid="menu-item-TruthOrDrink"]');
  }

  async goto() {
    await this.page.goto('http://localhost:8081');
  }

  async navigateToMostLikely() {
    await this.mostLikelyBtn.click();
  }
}
