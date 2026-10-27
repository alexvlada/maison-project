import { test, expect, APIRequestContext } from '@playwright/test';
import { validateSchema } from 'playwright-schema-validator';
import { UserData } from '../../api-objects/AuthApi';
import { getProductById, getProducts } from '../../api-objects/ProductsApi';
import { getOrders, getOrderByReference, placeOrderWithSetup } from '../../api-objects/OrdersApi';
import { resetDatabase } from '../../api-objects/SystemApi';

import productDetailSchema from '../../schemas/product-detail.schema.json';
import productListSchema from '../../schemas/product-list.schema.json';
import orderSchema from '../../schemas/order.schema.json';
import { clearCart, getCart } from '../../api-objects/CartApi';
import userMeSchema from '../../schemas/user-me.schema.json';
import cartSchema from '../../schemas/cart.schema.json';
import errorSchema from '../../schemas/error.schema.json';
import ordersListSchema from '../../schemas/orders-list.schema.json';

const userData = new UserData();

test.describe('Schema validation', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ request }) => {
    // 1. FIRST reset the database
    await resetDatabase(request);

    // 2. THEN log in
    apiContext = await userData.loginUser(
      'happyFlow',
      'buyer@maison.test',
      'Password123!'
    );
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('GET /products/:id - ProductDetail schema', async ({ page }) => {
    const result = await getProductById(apiContext, 1);
    const product = result.product || result;

    await validateSchema({ page }, product, productDetailSchema);

    expect(product.id).toBe(1);
    expect(product.name).toBe('Noir Saffiano Tote');
  });

  test('GET /products - ProductList schema', async ({ page }) => {
    const result = await getProducts(apiContext);

    await validateSchema({ page }, result, productListSchema);

    expect(result.products.length).toBeGreaterThan(0);
  });

  test('GET /orders/:reference - Order schema', async ({ page }) => {
    // Create an order (setup within the test)
    const order = await placeOrderWithSetup(
      'happyFlow',
      apiContext,
      [{ productId: 1, quantity: 1 }],
      'shipping'
    );

    const result = await getOrderByReference(apiContext, order.reference);
    const fetchedOrder = result.order || result;

    await validateSchema({ page }, fetchedOrder, orderSchema);

    expect(fetchedOrder.reference).toBe(order.reference);
  });

  
  test('GET /auth/me - UserMe schema', async ({ page }) => {
    const result = await userData.getCurrentUser(apiContext);
    const user = result.user || result;

    await validateSchema({ page }, user, userMeSchema);

    expect(user.email).toBe('buyer@maison.test');
  });

  test('GET /cart - Cart schema', async ({ page }) => {
    const result = await getCart(apiContext);

    await validateSchema({ page }, result, cartSchema);

    expect(result.cart).toBeDefined();
  });

  test('GET /orders - OrdersList schema', async ({ page }) => {
    const result = await getOrders(apiContext);

    await validateSchema({ page }, result, ordersListSchema);

    expect(result.orders.length).toBeGreaterThanOrEqual(0);
  });

  test('POST /orders - Empty cart error schema', async ({ page }) => {
    // 1. Clear the cart
    await clearCart(apiContext);

    // 2. Attempt checkout with an empty cart
    const response = await apiContext.post('http://localhost:4000/api/v1/orders', {
      data: {
        payment: { method: 'mock-card', token: 'demo' },
        shipping: {
          name: 'Test',
          address: 'Test',
          city: 'Test',
          postalCode: '11000'
        }
      },
      timeout: 30_000,
    });

    const body = await response.json();

    // 3. Error schema validation
    await validateSchema({ page }, body, errorSchema);

    expect(body.error.code).toBe('EMPTY_CART');
  });

});