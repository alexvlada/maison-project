import { Page, Locator, expect } from '@playwright/test';
import { HomePage } from './HomePage';
import { LoginPage } from './LoginPage';
import { RegistrationRole } from '../types';

export interface RegistrationFormData {
  role: RegistrationRole;
  firstName: string;
  lastName: string;
  atelierName: string;
  email: string;
  gender: string;
  phone: string;
  dateOfBirth: string;
  password: string;
}

export class RegistrationPage {
    readonly roleBuyerButton: Locator;
    readonly roleSellerButton: Locator;
    readonly createAccountHeading: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly nameInput: Locator;
    readonly emailInput: Locator;
    readonly genderSelect: Locator;
    readonly phoneInput: Locator;

    readonly dobTrigger: Locator;  
    readonly dobPicker: Locator;
    readonly dobMonthSelect: Locator;
    readonly dobYearSelect: Locator;
    readonly dobDisplayText: Locator;

    readonly passwordInput: Locator;
    readonly confirmPasswordInput: Locator;

    readonly registerButton: Locator;

    constructor(private page: Page) {
       
        this.createAccountHeading = page.getByRole('heading', { name: 'Create Account' });
        this.roleBuyerButton = page.locator('[data-testid="role-buyer"]');
        this.roleSellerButton = page.locator('[data-testid="role-seller"]');
        this.firstNameInput = page.getByLabel('First Name');
        this.lastNameInput = page.getByLabel('Last Name');
        this.nameInput = page.locator('[data-testid="register-name"]');
        this.emailInput = page.locator('input[data-testid="register-email"]');
        this.genderSelect = page.locator('select[data-testid="register-gender"]');
        this.phoneInput = page.locator('#reg-phone');

        this.dobTrigger = page.locator('[data-testid="dob-display"]');
        this.dobPicker = page.locator('[data-testid="dob-picker"]');
        this.dobMonthSelect = page.locator('[data-testid="dob-month-select"]');
        this.dobYearSelect = page.locator('[data-testid="dob-year-select"]');
        this.dobDisplayText = page.locator('[data-dob-display-text]');

        this.passwordInput = page.locator('[data-testid="register-password"]');
        this.confirmPasswordInput = page.locator('[data-testid="register-confirm-password"]');

        this.registerButton = page.locator('[data-testid="register-submit"]'); 
    }
  
    async selectDateOfBirth(date: string): Promise<void> {
      
      const [year, month, day] = date.split('-').map(part => part.trim());
      
      if (!day || !month || !year) {
        throw new Error(`Wrong date format: "${date}". Expected format: "YYYY-MM-DD"`);
      }

      await this.dobTrigger.click();
      await this.dobPicker.waitFor({ state: 'visible' });

      await this.dobMonthSelect.selectOption(String(Number(month)));
      await this.dobYearSelect.selectOption(year);

      await this.page.locator(`[data-testid="dob-day-${Number(day)}"]`).click();

      expect(this.dobDisplayText).not.toHaveText('Select date of birth');

      const displayedDate = await this.dobDisplayText.innerText();
      const expectedDate = `${Number(day)} ${this.getMonthName(Number(month))} ${year}`;
      expect(displayedDate).toBe(expectedDate);
    }

    async getDisplayedDateOfBirth(): Promise<string> {
      return await this.dobDisplayText.innerText();
    }

    private getMonthName(month: number): string {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return months[month - 1];
    }

async fillRegistrationForm(data: RegistrationFormData): Promise<void> {
  await this.page.reload();
  await this.selectRole(data.role);

  if (data.role === 'buyer') {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.genderSelect.selectOption(data.gender);
    await this.phoneInput.fill(data.phone);
  } else {
    await this.nameInput.fill(data.atelierName);
  }

  await this.emailInput.fill(data.email);

  if (data.dateOfBirth !== '') {
    await this.selectDateOfBirth(data.dateOfBirth);
  }
  await this.passwordInput.fill(data.password);
  await this.confirmPasswordInput.fill(data.password);
  await this.registerButton.click();
}

async navigateToRegistration(): Promise<void> {
  
  const homePage = new HomePage(this.page);
  await homePage.signInLink.click(); 

  const loginPage = new LoginPage(this.page);
  await expect(loginPage.signInHeading).toBeVisible()
  await expect(loginPage.createAccountLink).toBeVisible();
  await loginPage.createAccountLink.click();
  await expect(this.createAccountHeading).toBeVisible();
}

// Selects the role (buyer or atelier) - clicks only if it's not already active
async selectRole(role: RegistrationRole): Promise<void> {
  const button = role === 'buyer' 
    ? this.roleBuyerButton 
    : this.roleSellerButton;

  // Check if the button is already active (aria-pressed="true")
  const isActive = await button.getAttribute('aria-pressed') === 'true';
  if (!isActive) {
    await button.click();
    // Wait for the state to change
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  }
}
}

