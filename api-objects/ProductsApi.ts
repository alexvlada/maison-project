import { APIRequestContext, expect } from '@playwright/test';

const apiBaseUrl = process.env.API_BASE_URL!;
const products = 'products';

export interface ProductList {
  id: number;
  name: string;
  category: string;
}

export interface SellerProductsList {
  sellerId: number;
  sellerName: string;
  expectedCount: number;
  products: Array<{
    id: number;
    name: string;
    category: string;
  }>;
}

export interface ProductPriceList {
  id: number;
  name: string;
  price: number;
}

/**
 * Returns a list of all products
 * Supports optional parameters for search, category, sorting, and price
 */
export async function getProducts(
  apiContext: APIRequestContext,
  params?: {
    q?: string;
    category?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  }
): Promise<any> {
  // Build a query string from the parameters
  const query = params
    ? '?' + new URLSearchParams(
        Object.entries(params)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : '';

  console.log(apiBaseUrl + products + query)  
  const response = await apiContext.get(apiBaseUrl + products + query, {
    timeout: 30_000,
  });

  const status = response.status();
  const body = await response.json();

  if (status !== 200) {
    const code = body.error?.code || 'UNKNOWN';
    const message = body.error?.message || 'No message';
    console.log('❌ getProducts status:', status);
    console.log('❌ getProducts code:', code);
    console.log('❌ getProducts message:', message);
    throw new Error(`Get products failed [${status}] ${code}: ${message}`);
  }

  console.log('✅ Products fetched:', body.products?.length || 0);
  return body;
}

// Returns the details of a single product by ID
export async function getProductById(
  apiContext: APIRequestContext,
  productId: number
): Promise<any> {
  const response = await apiContext.get(
    apiBaseUrl + products + '/' + productId,
    { timeout: 30_000 }
  );

  const status = response.status();
  const body = await response.json();

  if (status !== 200) {
    const code = body.error?.code || 'UNKNOWN';
    const message = body.error?.message || 'No message';
    console.log('❌ getProductById status:', status);
    console.log('❌ getProductById code:', code);
    console.log('❌ getProductById message:', message);
    throw new Error(`Get product failed [${status}] ${code}: ${message}`);
  }

  console.log('✅ Product fetched:', body.product?.name || body.name);
  return body;
}

// Returns a list of all product categories
export async function getProductCategories(
  apiContext: APIRequestContext
): Promise<any> {
  const response = await apiContext.get(
    apiBaseUrl + products + '/categories',
    { timeout: 30_000 }
  );

  const status = response.status();
  const body = await response.json();

  if (status !== 200) {
    const code = body.error?.code || 'UNKNOWN';
    const message = body.error?.message || 'No message';
    console.log('❌ getProductCategories status:', status);
    console.log('❌ getProductCategories code:', code);
    console.log('❌ getProductCategories message:', message);
    throw new Error(`Get categories failed [${status}] ${code}: ${message}`);
  }

  console.log('✅ Categories fetched:', body.categories?.length || 0);
  return body;
}

/**
 * Returns the list of products for the currently logged-in seller
 * Requires a seller session
 */

export type SellerProductsScenario = 'happyFlow' | 'forbiddenRole';

export async function getSellerProducts(
  scenario: SellerProductsScenario,
  apiContext: APIRequestContext
): Promise<any> {
  const response = await apiContext.get(
    apiBaseUrl + products + '/seller/mine',
    { timeout: 30_000 }
  );

  const status = response.status();
  const body = await response.json();
  let expectedStatus: number;

  if (status !== 200) 

    {

      const code = body.error?.code || 'UNKNOWN';
      const message = body.error?.message || 'No message';
      
      if (scenario === 'forbiddenRole') 

          {
            expectedStatus = 403;
            expect(code).toBe('FORBIDDEN_ROLE');
            expect(message).toBe("This action requires the seller role."); 
          } 
      
      else   

          {
            expectedStatus = 0;
            console.log('❌ getSellerProducts status:', status);
            console.log('❌ getSellerProducts code:', code);
            console.log('❌ getSellerProducts message:', message);
            throw new Error(`Get seller products failed [${status}] ${code}: ${message}`);
          }
    }

  else  

    {
        expectedStatus = 200;
      // console.log('✅ Response status:', status);
      // console.log('✅ Response body:', JSON.stringify(body, null, 2));
    }

  expect(response.status()).toBe(expectedStatus)  

  console.log('✅ Seller products fetched:', body.products?.length || 0);
  return body;

}

export type SortDirection = 'asc' | 'desc';

export interface SimplifiedProduct {
  id: number;
  name: string;
  price: number;
}

// Returns a list of products sorted by price
export async function getProductsSortedByPrice(
  apiContext: APIRequestContext,
  direction: SortDirection,
  limit?: number
): Promise<SimplifiedProduct[]> {
  const sort = direction === 'asc' ? 'price_asc' : 'price_desc';

  const response = await apiContext.get(
    apiBaseUrl + products + '?sort=' + sort,
    { timeout: 30_000 }
  );

  const status = response.status();
  const body = await response.json();

  if (status !== 200) {
    const code = body.error?.code || 'UNKNOWN';
    const message = body.error?.message || 'No message';
    console.log('❌ getProductsSortedByPrice status:', status);
    console.log('❌ getProductsSortedByPrice code:', code);
    console.log('❌ getProductsSortedByPrice message:', message);
    throw new Error(`Get sorted products failed [${status}] ${code}: ${message}`);
  }

  // Map to { id, name, price }
  let result: SimplifiedProduct[] = body.products.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.effectiveCents,
  }));

  // If a limit is provided, truncate the array
  if (limit !== undefined) {
    result = result.slice(0, limit);
  }

  console.log(`✅ Products sorted by price ${direction}:`, result.length);
  return result;
}