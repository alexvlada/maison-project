import { Page, Locator } from '@playwright/test';
import { HomePage } from './HomePage';

export class LoginPage {
    readonly signInHeading: Locator;
    readonly createAccountLink: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly signInButton: Locator;

    constructor(private page: Page) {
        this.signInHeading = page.getByRole('heading', { name: 'Sign In' });
        this.createAccountLink = this.page.locator('a[data-testid="goto-register"]');
        this.emailInput = this.page.locator('#login-email');
        this.passwordInput = this.page.locator('#login-password');
        this.signInButton = this.page.getByTestId('login-submit');
    }

    async navigateToLogin(): Promise<void> {
       
        const homePage = new HomePage(this.page);
        await homePage.signInLink.click();

    }

   async userLogin(email: string, password: string): Promise<void> {

        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.signInButton.click();

   }
}


