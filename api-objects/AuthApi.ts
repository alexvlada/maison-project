
import { request, APIRequestContext, expect } from '@playwright/test';
import { RegistrationScenario, RegistrationRole, LoginScenario } from '../types/index';
import { loadFixture } from '../utils/fixtureLoader';

const apiBaseUrl = process.env.API_BASE_URL!;

const register = 'auth/register';
const login = 'auth/login';
const me = 'auth/me';

export class UserData {
  
async newUserRegistration(scenario: RegistrationScenario,
                          fixure: string,
                          email: string, 
                          password: string,
                          role: RegistrationRole,
                          phone: string,
                          dateOfBirth: string) : Promise<void>
{
    // Load the registration fixture
    const userData = loadFixture<{
      email: string;
      password: string;
      role: string;
      phone: string;
      dateOfBirth: string;
    }>(fixure);

    const userDataParam = JSON.parse(
      JSON.stringify(userData)
        .replace('{{email}}', email)
        .replace('{{password}}', password)
        .replace('{{role}}', role)
        .replace('{{phone}}', phone)
        .replace('{{dateOfBirth}}', dateOfBirth)
    );

    const apiContext = await request.newContext();
    try {
      const response = await apiContext.post(apiBaseUrl + register, {
        data: userDataParam,
        timeout: 30_000,
      });

      const status = response.status();
      const body = await response.json();
      let expectedStatus: number;
      
      if (status !== 201)

        { 
          const code = body.error.code;       
          const message = body.error.message;

          if (scenario === 'alreadyExistingUser') 
            
            {
              expectedStatus = 409;
              expect(code).toBe('EMAIL_TAKEN');
              expect(message).toBe("An account with that email already exists."); 
            } 

          else if (scenario === 'badRequest1') 
            
            {
              expectedStatus = 400;  
              expect(code).toBe('INVALID_EMAIL');
              expect(message).toBe("Please provide a valid email address."); 
            } 
          
          else if (scenario === 'badRequest2') 
            
            {
              expectedStatus = 400; 
              expect(code).toBe('WEAK_PASSWORD');
              expect(message).toBe("Password must be at least 8 characters and include a letter and a number.");   
            } 
            
          else if (scenario === 'badRequest3') 
            
            {
              expectedStatus = 400;    
              expect(code).toBe('INVALID_ROLE');
              expect(message).toBe("Role must be either 'buyer' or 'seller'.");
            } 
            
          else if (scenario === 'badRequest4') 
            
            {
              expectedStatus = 400;  
              expect(code).toBe('MISSING_DOB');
              expect(message).toBe("Please provide your date of birth.");
            } 
          
          else 
              
            {
              expectedStatus = 0;
            }

        }

      else  

        {
           expectedStatus = 201;
          // console.log('✅ Response status:', status);
          // console.log('✅ Response body:', JSON.stringify(body, null, 2));
        }

        expect(response.status()).toBe(expectedStatus)

    } finally {
      await apiContext.dispose();
    }
}

async loginUser(scenario: LoginScenario,
                email: string,
                password: string) 
{

  const apiContext = await request.newContext();
  try {
  const response = await apiContext.post(apiBaseUrl + login, {
    data: { email, password },
    timeout: 30_000,
  });

  const status = response.status();
  const body = await response.json();
  let expectedStatus: number;

 //  console.log('✅ Response body:', JSON.stringify(body, null, 2));

  if (status !== 200)

        { 
          const code = body.error.code;       
          const message = body.error.message;

          if (scenario === 'missingCredentials') 
            
            {
              expectedStatus = 400;
              expect(code).toBe('MISSING_CREDENTIALS');
              expect(message).toBe("Email and password are required."); 
            }   

          else if (scenario === 'invalidCredentials') 
            
            {
              expectedStatus = 401;
              expect(code).toBe('INVALID_CREDENTIALS');
              expect(message).toBe("Email or password is incorrect."); 
            } 
  
          else 
              
            {
              expectedStatus = 0;
            }

        }

  else  

        {
           expectedStatus = 200;
           console.log('✅ User logged in:', email);
          // console.log('✅ Response status:', status);
          // console.log('✅ Response body:', JSON.stringify(body, null, 2));
        }
        
        expect(status).toBe(expectedStatus)
        return apiContext;
      
  } catch (error) {
    await apiContext.dispose();  // očisti samo ako padne
    throw error;
  }
  
} 

async getCurrentUser(
  apiContext: APIRequestContext
): Promise<any> {
  const response = await apiContext.get(apiBaseUrl + me, {
    timeout: 30_000,
  });

  const status = response.status();
  const expectedStatus = 200
  const body = await response.json();
  
  if (status !== expectedStatus) 
    {
      const code = body.error?.code || 'UNKNOWN';
      const message = body.error?.message || 'No message';
      console.log('❌ Status:', status);
      console.log('❌ Code:', code);
      console.log('❌ Message:', message);
      throw new Error(`Get Current User failed: [${status}] ${code}: ${message}`);
    } 
   
  return body.user || body;
    
}

}


