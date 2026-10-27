import { test, expect } from '@playwright/test';
import { UserData } from '../../api-objects/AuthApi';
import { placeOrderWithSetup, getOrderByReference } from '../../api-objects/OrdersApi';
import { getProducts } from '../../api-objects/ProductsApi';
import { TestData } from '../../utils/TestData';
import { resetDatabase } from '../../api-objects/SystemApi';

const userData = new UserData();
test.describe.configure({ mode: 'serial' });
test.describe('E2E - New user journey', () => {

  test.beforeAll(async ({ request }) => {
    await resetDatabase(request);
  });

  test('Complete journey: register → login → search → cart → order → verify', async () => {
    // ============================================
    // 1. REGISTRATION - New user
    // ============================================
    const email = TestData.randomEmail();
    const password = process.env.NEW_USER_PASSWORD!
    const firstName = TestData.randomFirstName();
    const lastName = TestData.randomLastName();
    const phone = TestData.randomSerbianPhone()
    const dateOfBirth = TestData.randomDateOfBirth();

    console.log('📧 New user:', email);

    await userData.newUserRegistration('happyFlow', //scenario
                                       'registerBuyer', //fixure name
                                        email,
                                        password,
                                        'buyer',
                                        phone,
                                        dateOfBirth);

    console.log('✅ Step 1: User registered');

    // ============================================
    // 2. LOGIN - As new user
    // ============================================
    const apiContext = await userData.loginUser('happyFlow', 
                                                 email, 
                                                 password);
                                                 
    console.log('✅ Step 2: User logged in');
    
    try {
  
      // ============================================
      // 3. SEARCH - Find a product
      // ============================================
      const products = await getProducts(apiContext, { q: 'Tote' });
      expect(products.count, 'Product search count').toBeGreaterThan(0);

      const product = products.products[0];
      console.log('✅ Step 3: Found product:', product.name, '| ID:', product.id);

      // ================================================
      // 4. CHECKOUT - Add to cart and create order
      // ================================================
      const order = await placeOrderWithSetup('happyFlow',
                                              apiContext,
                                              [{ productId: 1, quantity: 2 }],
                                              'shipping') // shipping adress fixure name
                                                   

      expect(order.reference, 'Order reference').toBeDefined();
      expect(order.status, 'Order status').toBe('confirmed');
      console.log('✅ Step 4: Order placed:', order.reference);

      // ============================================
      // 5. VERIFICATION - Verify the order
      // ============================================
      const fetched = await getOrderByReference(apiContext, order.reference);
      const fetchedOrder = fetched.order || fetched;

      expect(fetchedOrder.reference, 'Fetched reference').toBe(order.reference);
      expect(fetchedOrder.status, 'Fetched status').toBe('confirmed');
      expect(fetchedOrder.items.length, 'Order items count').toBe(1);
      expect(fetchedOrder.items[0].quantity, 'Order item quantity').toBe(2);
      expect(fetchedOrder.totalCents, 'Order total').toBeGreaterThan(0);
      console.log('✅ Step 5: Order verified');

      console.log('🎉 E2E journey completed successfully!');
    
    } finally {
      await apiContext.dispose();
    }
  });

});  