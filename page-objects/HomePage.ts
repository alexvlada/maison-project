import { Page, Locator, expect } from '@playwright/test';
import { RegistrationRole } from '../types';

export class HomePage {
    readonly brand: Locator;
    readonly signInLink: Locator;
    readonly currentUser: Locator

    constructor(private page: Page) {
        this.brand = this.page.getByTestId('brand');
        this.signInLink = this.page.getByTestId('nav-login');
        this.currentUser = this.page.getByTestId('current-user');
    }

async navigateToHome(): Promise<void> {
  await this.page.goto('/');
}

async expectBrandVisible(): Promise<void> {
  await expect(this.brand).toBeVisible();
  await expect(this.brand).toContainText('MAISON');
}    

async verifyLoggedInUser(role: RegistrationRole,
                         firstName: string, 
                         lastName?: string): Promise<void> {  
  
    let expectedUser = '';  

    if (role === 'buyer')      
           
        {
            expectedUser = `${firstName} ${lastName}`; 
            await expect(this.currentUser).toBeVisible(); 
            await expect(this.currentUser).toHaveText(expectedUser); 
            await expect(this.currentUser).toHaveAttribute( 'data-role', 'buyer' ); 
        }
    else 
         {  
            expectedUser = `${firstName}`; //atelierName
            await expect(this.currentUser).toBeVisible(); 
            await expect(this.currentUser).toHaveText(expectedUser); 
            await expect(this.currentUser).toHaveAttribute( 'data-role', 'seller' ); 
        }  
    }        

}



