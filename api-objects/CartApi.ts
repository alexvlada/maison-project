import { APIRequestContext, expect } from '@playwright/test';
import { AddItemScenario } from '../types';

const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:4000/api/v1';
const items = '/cart/items';
const cart = '/cart'; 
const remove = 'cart/items/'

export async function addItemToCart(
  scenario: AddItemScenario,
  apiContext: APIRequestContext,
  productId: number,
  quantity: number
): Promise<void> {
  const response = await apiContext.post(apiBaseUrl + items, {
    data: { productId, quantity },
    timeout: 30_000,
  });

  const status = response.status();
  let expectedStatus = 201
  const body = await response.json();
  
  if (status !== expectedStatus) 
    
    {
      const code = body.error?.code || 'UNKNOWN';
      const message = body.error?.message || 'No message';

      if (scenario === 'outOfStock')
        { 
          expectedStatus = 409;  
          expect(status).toBe(expectedStatus);
          expect(code).toBe('OUT_OF_STOCK');
          expect(message).toBe("This item is currently out of stock.");
        }
      else if (scenario === 'insufficientStock')
        { 
          expectedStatus = 409;
          expect(status).toBe(expectedStatus);  
          expect(code).toBe('INSUFFICIENT_STOCK');
          expect(message).toBe("Only 8 in stock.");
        }  
      else if (scenario === 'productNotFound')
        { 
          expectedStatus = 404;  
          expect(status).toBe(expectedStatus);
          expect(code).toBe('PRODUCT_NOT_FOUND');
          expect(message).toBe("That product does not exist.");
        }    
      else if (scenario === 'invalidQuantity')
        { 
          expectedStatus = 400;  
          expect(status).toBe(expectedStatus);
          expect(code).toBe('INVALID_QUANTITY');
          expect(message).toBe("Quantity must be a positive integer.");
        }     
      else
        {
          console.log('❌ Status:', status);
          console.log('❌ Code:', code);
          console.log('❌ Message:', message);
          throw new Error(`Add Item To Cart failed: [${status}] ${code}: ${message}`);
        }  
    }  
}

export async function getCart(apiContext: APIRequestContext): Promise<any> {
  const response = await apiContext.get(apiBaseUrl + cart, {
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
      throw new Error(`Get Cart failed: [${status}] ${code}: ${message}`);
    }   
  
  return body
}

export async function addMultipleItems(
  apiContext: APIRequestContext,
  products: Array<{ productId: number; quantity: number }>
): Promise<void> {
  for (const p of products) {
    await addItemToCart('happyFlow', apiContext, p.productId, p.quantity);
  }
}

export async function removeItemFromCart(
  apiContext: APIRequestContext,
  itemId: number
): Promise<void> {

  const response = await apiContext.delete(
    apiBaseUrl + remove + itemId,
    { timeout: 30_000 }
  );

  const status = response.status();
  const expectedStatus = 200
  const body = await response.json().catch(() => null);

  if (status !== expectedStatus) {
    const code = body?.error?.code || 'UNKNOWN';
    const message = body?.error?.message || 'No message';
    console.log('❌ removeItemFromCart status:', status);
    console.log('❌ removeItemFromCart code:', code);
    console.log('❌ removeItemFromCart message:', message);
    throw new Error(`Remove item failed [${status}] ${code}: ${message}`);
  }

  console.log('✅ Item removed from cart:', itemId);
}

export async function clearCart(apiContext: APIRequestContext): Promise<void> {
  const response = await apiContext.delete(apiBaseUrl + cart, {
    timeout: 30_000,
  });

  const status = response.status();
  const body = await response.json().catch(() => null);
  const expectedStatus = 200

  if (status !== expectedStatus) {
    const code = body?.error?.code || 'UNKNOWN';
    const message = body?.error?.message || 'No message';
    console.log('❌ clearCart status:', status);
    console.log('❌ clearCart code:', code);
    console.log('❌ clearCart message:', message);
    throw new Error(`Clear cart failed [${status}] ${code}: ${message}`);
  }

  console.log('✅ Cart cleared');
}
