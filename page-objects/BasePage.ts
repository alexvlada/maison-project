import { Page, Locator, expect } from '@playwright/test';
import { RegistrationRole } from '../types';

export class BasePage {
  readonly page: Page;

  // Flash messages (appear after actions - registration, login, etc.)
  readonly flashSuccess: Locator;
  readonly flashError: Locator;
  readonly flashInfo: Locator;
  readonly flashWarning: Locator;
  readonly flashRegisterError: Locator;
  readonly flashLoginError: Locator;

  // Header elements
  readonly header: Locator;
  readonly logo: Locator;
  readonly navMenu: Locator;

  // Footer elements
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;

    // Flash messages
    this.flashSuccess = page.locator('[data-testid="flash-success"]');
    this.flashError = page.locator('[data-testid="flash-error"]');
    this.flashInfo = page.locator('[data-testid="flash-info"]');
    this.flashWarning = page.locator('[data-testid="flash-warning"]');
    this.flashRegisterError = page.locator('[data-testid="register-error"]');
    this.flashLoginError = page.locator('[data-testid="login-error"]');

    // Header
    this.header = page.locator('header');
    this.logo = page.locator('[data-testid="logo"]');
    this.navMenu = page.locator('nav');

    // Footer
    this.footer = page.locator('footer');
  }

  // ============================================
  // FLASH MESSAGE METHODS
  // ============================================

  // Waits for the success message to appear and checks that it contains the given text
  async expectFlashSuccess(text: string): Promise<void> {
    await expect(this.flashSuccess).toContainText(text);
  }

  // Waits for the error message to appear and checks that it contains the given text
  async expectFlashError(text: string): Promise<void> {
    await expect(this.flashError).toContainText(text);
  }

  // Waits for the info message to appear and checks that it contains the given text
  async expectFlashInfo(text: string): Promise<void> {
    await expect(this.flashInfo).toContainText(text);
  }

  // Waits for the warning message to appear and checks that it contains the given text
  async expectFlashWarning(text: string): Promise<void> {
    await expect(this.flashWarning).toContainText(text);
  }

  // Returns the success message text (catches it before it disappears)
  async getFlashSuccessText(): Promise<string> {
    await this.flashSuccess.waitFor({ state: 'visible' });
    return await this.flashSuccess.innerText();
  }

  // Returns the error message text (catches it before it disappears)
  async getFlashErrorText(): Promise<string> {
    await this.flashError.waitFor({ state: 'visible' });
    return await this.flashError.innerText();
  }

  async waitForFlashSuccessToDisappear(): Promise<void> {
    await this.flashSuccess.waitFor({ state: 'hidden' });
  }

  async expectRegisterError(text: string): Promise<void> {
    await expect(this.flashRegisterError).toContainText(text);
  }

  async expectLoginError(text: string): Promise<void> {
    await expect(this.flashLoginError).toContainText(text);
  }

  async verifySuccessLoginMessage(
    role: RegistrationRole,
    firstName?: string,
    lastName?: string
  ): Promise<void> {
    if (role === 'buyer' && firstName && lastName) {
      await expect(this.flashSuccess).toContainText(`Welcome, ${firstName} ${lastName}`);
    } else if (role === 'atelier' && firstName) {
      await expect(this.flashSuccess).toContainText(`Welcome, ${firstName}`);
    } else {
      await expect(this.flashSuccess).toContainText('Welcome');
    }
  }

  // ============================================
  // NAVIGATION METHODS
  // ============================================

  async clickLogo(): Promise<void> {
    await this.logo.click();
  }

  async expectHeaderVisible(): Promise<void> {
    await expect(this.header).toBeVisible();
  }

  async expectFooterVisible(): Promise<void> {
    await expect(this.footer).toBeVisible();
  }
}