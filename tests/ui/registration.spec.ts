

import { test, expect } from '@playwright/test';
import { HomePage } from '../../page-objects/HomePage';
import { LoginPage } from '../../page-objects/LoginPage';
import { RegistrationPage } from '../../page-objects/RegistrationPage';
import { BasePage } from '../../page-objects/BasePage';
import { TestData } from '../../utils/TestData';
import { RegistrationFormData } from '../../page-objects/RegistrationPage';
import * as dotenv from 'dotenv';
dotenv.config();

test.describe.serial('Maison test suite', () => {

    let basePage: BasePage
    let homePage: HomePage;
    let registrationPage: RegistrationPage;
    let loginPage: LoginPage; 

    test.beforeEach(async ({ page }) => {
        
        basePage = new BasePage(page);
        homePage = new HomePage(page);
        registrationPage = new RegistrationPage(page);
        loginPage = new LoginPage(page);
        
        await homePage.navigateToHome();
        await homePage.expectBrandVisible();
    });

    // ====================================================
    // Test data - generated once for the whole suite
    // Since tests are serial and share state, this is safe
    // ====================================================
    const gender = TestData.randomGender(); 
    const firstName = TestData.randomFirstName(gender);
    const lastName = TestData.randomLastName();
    const atelierName = TestData.randomAtelierName();
    const emailAddress = TestData.randomEmail()
    const emailAddressAtelier = TestData.randomAtelierEmail()
    const phone = TestData.randomSerbianPhone()
    const dateOfBirth = TestData.randomDateOfBirth()
    const password = process.env.NEW_USER_PASSWORD!

    test('User registration - Buyer - happy flow', async ({ page }) => {

        await registrationPage.navigateToRegistration()  
        await registrationPage.fillRegistrationForm({role: 'buyer',
                                                    firstName, 
                                                    lastName, 
                                                    atelierName,
                                                    email: emailAddress, 
                                                    gender, 
                                                    phone, 
                                                    dateOfBirth, 
                                                    password})
        
        await basePage.expectFlashSuccess('Welcome to Maison');                                      
        console.log(emailAddress) 

    });

    test('User registration - Atelier - happy flow', async ({ page }) => {

        await registrationPage.navigateToRegistration()  
        await registrationPage.fillRegistrationForm({role: 'atelier',
                                                    firstName, 
                                                    lastName, 
                                                    atelierName,
                                                    email: emailAddressAtelier, 
                                                    gender, 
                                                    phone, 
                                                    dateOfBirth, 
                                                    password})

        await basePage.expectFlashSuccess('Welcome to Maison');                                      
        console.log(emailAddressAtelier) 

    });

    test('Buyer user login', async ({ page }) => {

        await loginPage.navigateToLogin()
        await loginPage.userLogin(emailAddress,
                                  password);

        await basePage.verifySuccessLoginMessage('buyer',
                                                 firstName,
                                                 lastName)     
                                                        
        await homePage.verifyLoggedInUser('buyer',
                                          firstName, 
                                          lastName);                                                

    });

    test('Atelier user login', async ({ page }) => {

        await loginPage.navigateToLogin()
        await loginPage.userLogin(emailAddressAtelier,
                                  password);
        
        await basePage.verifySuccessLoginMessage('atelier',
                                                 atelierName)                           

        await homePage.verifyLoggedInUser('atelier',
                                          atelierName);

    });

    test('User registration - mandatory data check', async ({ page }) => {
        await registrationPage.navigateToRegistration();

        const baseForm: RegistrationFormData = {
            role: 'buyer',
            firstName,
            lastName,
            atelierName,
            email: emailAddress,
            gender,
            phone,
            dateOfBirth,
            password
        };

        // 1. Without firstName
        await registrationPage.fillRegistrationForm({ ...baseForm, firstName: '' });
        await basePage.expectRegisterError('Please provide your first name.');

        // 2. Without lastName
        await registrationPage.fillRegistrationForm({ ...baseForm, lastName: '' });
        await basePage.expectRegisterError('Please provide your last name.');

        // 3. Without email
        await registrationPage.fillRegistrationForm({ ...baseForm, email: '' });
        await basePage.expectRegisterError('Please provide a valid email address.');

        // 4. Without dateOfBirth
        await registrationPage.fillRegistrationForm({ ...baseForm, dateOfBirth: '' });
        await basePage.expectRegisterError('Please provide your date of birth.');

        // 5. Without password
        await registrationPage.fillRegistrationForm({ ...baseForm, password: '' });
        await basePage.expectRegisterError('Password must be at least 8 characters and include a letter and a number.');
    
    });

    test('User login - wrong or missing credentials', async ({ page }) => {

        await loginPage.navigateToLogin()
        await loginPage.userLogin('',
                                    '');
        await basePage.expectLoginError('Email and password are required.');     

        await loginPage.userLogin('xyz',
                                  'xyz');
        await basePage.expectLoginError('Email or password is incorrect.');                          

    });

    test('User registration - already existing user', async ({ page }) => {

       await registrationPage.navigateToRegistration()  
       await registrationPage.fillRegistrationForm({role: 'buyer',
                                                   firstName, 
                                                   lastName,
                                                   atelierName, 
                                                   email: emailAddress, 
                                                   gender, 
                                                   phone, 
                                                   dateOfBirth, 
                                                   password})

       await basePage.expectRegisterError('An account with that email already exists.');                                    

    });

});
