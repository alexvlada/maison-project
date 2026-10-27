import { test, expect, APIRequestContext  } from '@playwright/test';
import { UserData } from '../../api-objects/AuthApi';
import { placeOrderWithSetup, getOrders, validateOrderDetails } from '../../api-objects/OrdersApi';
import { resetDatabase } from '../../api-objects/SystemApi';

const userData = new UserData();

test.describe.serial('Orders API', () => {

  let apiContext: APIRequestContext;

  test.beforeAll(async ({ request }) => {
    
    apiContext = await userData.loginUser(
      'happyFlow',
      'buyer@maison.test',
      'Password123!'
    );

    await resetDatabase(request);

  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('Place order - single item', async () => {

      const order = await placeOrderWithSetup(
                                              'happyFlow',
                                              apiContext,
                                              [{ productId: 1, quantity: 2 }],
                                              'shipping' // shipping adress fixure name
                                              )

      await validateOrderDetails(order, {
                                         status: 'confirmed',
                                         totalCents: 484500,
                                         items: [
                                                   { name: 'Noir Saffiano Tote', 
                                                     quantity: 2, 
                                                     unitCents: 242250 
                                                   },
                                                 ],
                                         shipping: {
                                                     name: 'Aurelie Dupont',
                                                     address: 'Knez Mihailova 10',
                                                     city: 'Belgrade',
                                                     postalCode: '11000',
                                                   },
    });

  });

  test('Place order - more items', async () => {

      const order = await placeOrderWithSetup(
                                              'happyFlow',
                                              apiContext,
                                              [{ productId: 1, quantity: 2 },
                                               { productId: 2, quantity: 2 },
                                               { productId: 3, quantity: 2 },
                                               { productId: 4, quantity: 2 },
                                               { productId: 5, quantity: 2 }
                                              ],
                                              'shipping' // shipping adress fixure name
                                              )


    await validateOrderDetails(order, {
                                        status: 'confirmed',
                                        totalCents: 3756500,
                                        items: [
                                                  { name: 'Noir Saffiano Tote', 
                                                    quantity: 2, 
                                                    unitCents: 242250 
                                                  },
                                                  { name: 'Aurum Chronograph Watch', 
                                                    quantity: 2, 
                                                    unitCents: 1240000 
                                                  },
                                                  { name: 'Cashmere Opera Scarf', 
                                                    quantity: 2, 
                                                    unitCents: 96000 
                                                  },
                                                  { name: 'Veluto Silk Eau de Parfum', 
                                                    quantity: 2, 
                                                    unitCents: 178000 
                                                  },
                                                  { name: 'Onyx Leather Derby', 
                                                    quantity: 2, 
                                                    unitCents: 122000 
                                                  },
                                                ],
                                        shipping: {
                                                    name: 'Aurelie Dupont',
                                                    address: 'Knez Mihailova 10',
                                                    city: 'Belgrade',
                                                    postalCode: '11000',
                                                  },
    });
      

  });

  test('Place order - empty cart should fail', async () => {

      const order = await placeOrderWithSetup(
                                              'emptyCart',  
                                              apiContext,
                                              [],
                                              'shipping'
                                              )

  });

  test('Validate orders - order history', async () => {
  
      const result = await getOrders(apiContext);

      // console.log('Orders:', JSON.stringify(result, null, 2));

      expect(result.orders.length).toBe(2);

  });

});