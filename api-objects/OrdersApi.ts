import { APIRequestContext, expect } from '@playwright/test';
import { addItemToCart, clearCart, getCart } from './CartApi';
import { loadFixture } from '../utils/fixtureLoader';
import { PlaceOrderScenario  } from '../types';

const apiBaseUrl = 'http://localhost:4000/api/v1';
const orders = '/orders';

export interface OrderItem {
  name: string;
  quantity: number;
  unitCents: number;
}

export interface OrderShipping {
  name: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface Order {
  reference: string;
  status: string;
  totalCents: number;
  items: OrderItem[];
  shipping: OrderShipping;
}

export interface ShippingDetails {
  name: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface PaymentDetails {
  method: string;  // npr. 'mock-card'
  token: string;   // npr. 'demo'
}

export async function placeOrder(
  scenario: PlaceOrderScenario,
  apiContext: APIRequestContext,
  shipping: ShippingDetails,
  payment: PaymentDetails = { method: 'mock-card', token: 'demo' }
): Promise<any> {
  const response = await apiContext.post(apiBaseUrl + orders, {
    data: {
      payment,
      shipping,
    },
    timeout: 30_000,
  });

  const status = response.status();
  const body = await response.json();
  let expectedStatus: number;

  if (status !== 200 && status !== 201) 

    { 
       const code = body.error?.code || 'UNKNOWN';
       const message = body.error?.message || 'No message';

       if (scenario === 'emptyCart') 
         {
            expectedStatus = 400;
            expect(code).toBe('EMPTY_CART');
            expect(message).toBe("Your cart is empty."); 
         }
      else  
         {
           expectedStatus = 0;
           console.log('❌ placeOrder status:', status);
           console.log('❌ placeOrder code:', code);
           console.log('❌ placeOrder message:', message);
           throw new Error(`Place order failed [${status}] ${code}: ${message}`);
         }
    }    
  
  else  

    {
        expectedStatus = 201;
      // console.log('✅ Response status:', status);
      // console.log('✅ Response body:', JSON.stringify(body, null, 2));
    }

    expect(response.status()).toBe(expectedStatus)
    
    console.log('✅ Order placed:', body.order?.reference || body.reference);
    return body;
}

export async function placeOrderWithSetup(
  scenario: PlaceOrderScenario,
  apiContext: APIRequestContext,
  items: Array<{ productId: number; quantity: number }>,
  fixtureName: string = 'shipping'
): Promise<Order> {
  // 1. Load the shipping fixture
  const fixure = loadFixture<ShippingDetails>(fixtureName);

  // 2. Clear the cart
  await clearCart(apiContext);

  // 3. Add all productsOrder
  for (const item of items) {
    await addItemToCart('happyFlow', apiContext, item.productId, item.quantity);
  }

  // 4. Verify the cart
  const cart = await getCart(apiContext);
  const expectedCount = items.reduce((sum, item) => sum + item.quantity, 0);
  expect(cart.cart.count, 'Cart count before checkout').toBe(expectedCount);

  // 5. Checkout
  const result = await placeOrder(scenario, apiContext, fixure);
  const order = result.order || result;
  
  if (scenario === 'happyFlow')
    // 6. Basic validation
    {
      expect(order.reference, 'Order reference').toBeDefined();
    }

  return order;
 
}

export function validateOrderDetails(
  order: Order,
  expected?: {
    status?: string;
    totalCents?: number;
    items?: OrderItem[];
    shipping?: ShippingDetails;
  }
): void {
  console.log('🔍 Validating order:', order.reference);

  // 1. Reference - always check the format
  expect(order.reference, 'Order reference should be defined').toBeDefined();
  expect(order.reference, 'Order reference format').toMatch(/^ORD-[A-Z0-9]+-\d+$/);

  // 2. Status
  if (expected?.status !== undefined) {
    expect(order.status, 'Order status').toBe(expected.status);
  }

  // 3. Total
  if (expected?.totalCents !== undefined) {
    expect(order.totalCents, 'Order total').toBe(expected.totalCents);
  }

  // 4. Items
  if (expected?.items !== undefined) {
    expect(order.items.length, 'Items count').toBe(expected.items.length);

    expected.items.forEach((expectedItem, i) => {
      expect(order.items[i].name, `Item[${i}] name`).toBe(expectedItem.name);
      expect(order.items[i].quantity, `Item[${i}] quantity`).toBe(expectedItem.quantity);
      expect(order.items[i].unitCents, `Item[${i}] unitCents`).toBe(expectedItem.unitCents);
    });

    // Math check: quantity × unitCents = totalCents
    const calculatedTotal = order.items.reduce(
      (sum, item) => sum + item.quantity * item.unitCents,
      0
    );
    expect(calculatedTotal, 'Calculated total matches order total').toBe(order.totalCents);
  }

  // 5. Shipping
  if (expected?.shipping !== undefined) {
    expect(order.shipping.name, 'Shipping name').toBe(expected.shipping.name);
    expect(order.shipping.address, 'Shipping address').toBe(expected.shipping.address);
    expect(order.shipping.city, 'Shipping city').toBe(expected.shipping.city);
    expect(order.shipping.postalCode, 'Shipping postalCode').toBe(expected.shipping.postalCode);
  }

  console.log('✅ Order validated successfully');
}

// Returns the order history of the currently logged-in user
export async function getOrders(
  apiContext: APIRequestContext
): Promise<any> {
  const response = await apiContext.get(apiBaseUrl + orders, {
    timeout: 30_000,
  });

  const status = response.status();
  const body = await response.json();

  if (status !== 200) {
    const code = body.error?.code || 'UNKNOWN';
    const message = body.error?.message || 'No message';
    console.log('❌ getOrders status:', status);
    console.log('❌ getOrders code:', code);
    console.log('❌ getOrders message:', message);
    throw new Error(`Get orders failed [${status}] ${code}: ${message}`);
  }

  console.log('✅ Orders fetched:', body.orders?.length || 0);
  return body;
}

// Returns a single order by reference
export async function getOrderByReference(
  apiContext: APIRequestContext,
  reference: string
): Promise<any> {
  const response = await apiContext.get(
    apiBaseUrl + orders + '/' + reference,
    { timeout: 30_000 }
  );

  const status = response.status();
  const body = await response.json();

  if (status !== 200) {
    const code = body.error?.code || 'UNKNOWN';
    const message = body.error?.message || 'No message';
    console.log('❌ getOrderByReference status:', status);
    console.log('❌ getOrderByReference code:', code);
    console.log('❌ getOrderByReference message:', message);
    throw new Error(`Get order failed [${status}] ${code}: ${message}`);
  }

  console.log('✅ Order fetched:', body.order?.reference || reference);
  return body;
}