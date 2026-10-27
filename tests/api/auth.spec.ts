import { test, expect } from '@playwright/test';
import { UserData } from '../../api-objects/AuthApi';
import { TestData } from '../../utils/TestData';

const userData = new UserData();
test.describe.configure({ mode: 'serial' });

test.describe('User auth API test suite', () => {

  let email: string;
  let emailAddressAtelier: string;
  let password: string;
  let phone: string;
  let dateOfBirth: string;

  test.beforeAll(() => {
   email = TestData.randomEmail()
   emailAddressAtelier = TestData.randomAtelierEmail()
   password = process.env.NEW_USER_PASSWORD!
   phone = TestData.randomSerbianPhone()
   dateOfBirth = TestData.randomDateOfBirth()
  });

  test('New user registration - buyer - Happy flow', async ({}) => {
    
    //console.log(email) 
    await userData.newUserRegistration('happyFlow', //scenario
                                       'registerBuyer', //fixure name
                                        email,
                                        password,
                                        'buyer',
                                        phone,
                                        dateOfBirth) 
    
  });

  test('User login - buyer - happy flow', async ({}) => {
    
    //console.log(email) 
    
    await userData.loginUser('happyFlow',
                             email,
                             password) 
    
  });

  test('User - buyer - data validation', async ({}) => {

    const apiContext = await userData.loginUser(
      'happyFlow',
      email,
      password
    );

    try {
      // 2. Data verification
      const currentUser = await userData.getCurrentUser(apiContext);  // ← drugo ime

      // 3. Validation
      expect(currentUser.email).toBe(email);
      expect(currentUser.name).toBe('Demo User');
      expect(currentUser.role).toBe('buyer');
      expect(currentUser.firstName).toBe('Demo');
      expect(currentUser.lastName).toBe('User');
      expect(currentUser.gender).toBe('male');
      expect(currentUser.phone).toBe(phone);
      expect(currentUser.dateOfBirth).toBe(dateOfBirth);
    } finally {
      await apiContext.dispose();
    }
      
  });

  test('User login - buyer - missing credentials', async ({}) => {
    
    //console.log(email) 
    
    await userData.loginUser('missingCredentials',
                             '',
                             '') 
    
  });

  test('User login - buyer - invalid credentials', async ({}) => {
    
    //console.log(email) 
    
    await userData.loginUser('invalidCredentials',
                             'fdfdsf',
                             'sfdsfd') 
    
  });

  test('New user registration - atelier - Happy flow', async ({}) => {
    
    //console.log(emailAddressAtelier) 
    await userData.newUserRegistration('happyFlow', //scenario
                                       'registerAtelier', //fixure name
                                        emailAddressAtelier,
                                        password,
                                        'seller',
                                        phone,
                                        dateOfBirth) 
    
  });

  test('New user registration - Already existing user', async ({}) => {
     
    await userData.newUserRegistration('alreadyExistingUser', //scenario
                                       'registerBuyer', //fixure name
                                        email,
                                        password,
                                        'buyer',
                                        phone,
                                        dateOfBirth)                                     
    
  });

  test('New user registration - Invalid email', async ({}) => {
     
    await userData.newUserRegistration('badRequest1', //scenario
                                       'registerBuyer', //fixure name
                                        '', //email,
                                        password,
                                        'buyer',
                                        phone,
                                        dateOfBirth
                                      )                                     
    
  });

  test('New user registration - Weak password', async ({}) => {
     
    await userData.newUserRegistration('badRequest2', //scenario
                                       'registerBuyer', //fixure name
                                        email,
                                        '', //password,
                                        'buyer',
                                        phone,
                                        dateOfBirth
                                      )                                     
    
  });

  test('New user registration - Invalid role', async ({}) => {
     
    await userData.newUserRegistration('badRequest3', //scenario
                                       'registerBuyer', //fixure name
                                        email,
                                        password,
                                        '', //role,
                                        phone,
                                        dateOfBirth
                                      )                                     
    
  });

  test('New user registration - Missing DOB', async ({}) => {
     
    await userData.newUserRegistration('badRequest4', //scenario
                                       'registerBuyer', //fixure name
                                        email,
                                        password,
                                        'buyer',
                                        phone,
                                        '' //dateOfBirth
                                      )                                     
    
  });
  
});