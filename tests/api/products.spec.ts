import { test, expect, APIRequestContext } from '@playwright/test';
import { UserData } from '../../api-objects/AuthApi';
import { getProducts, getProductById, getProductCategories, getProductsSortedByPrice, getSellerProducts, ProductList, SellerProductsList, ProductPriceList } from '../../api-objects/ProductsApi';
import { resetDatabase } from '../../api-objects/SystemApi';
import { loadFixture, loadArrayFixture } from '../../utils/fixtureLoader';

const userData = new UserData();

test.describe('Products API', () => {
  
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


  test('Verify all products', async () => {

    const fixture = loadArrayFixture<ProductList>('products');
    const result = await getProducts(apiContext);

    fixture.forEach((expectedProduct: { id: number; name: string; category: string }) => {
      const actual = result.products.find((p: any) => p.id === expectedProduct.id);

      expect(actual, `Product with id ${expectedProduct.id} not found`).toBeDefined();
      expect(actual.name).toBe(expectedProduct.name);
      expect(actual.category).toBe(expectedProduct.category);
    });

    expect(result.products.length).toBe(fixture.length);
   
  });

  test('Verify all product categories', async () => {

    const fixture = loadArrayFixture<string>('categories');
    const result = await getProductCategories(apiContext);

    fixture.forEach((category: string) => {
      expect(result.categories).toContain(category);
    });

    expect(result.categories.length).toBe(fixture.length);

  });

  test('Verify product by ID - first', async () => {

    const productId = 1
    const result = await getProductById(apiContext, productId);
    const product = result.product || result;

    expect(product.id).toBe(1);
    expect(product.name).toBe('Noir Saffiano Tote');
    expect(product.category).toBe('Bags');
    expect(product.priceCents).toBe(285000);
    expect(product.inStock).toBe(true);
    expect(product.onSale).toBe(true);
    expect(product.stock).toBe(8);

  });

  test('Search products by name', async () => {

    const searchCriteria = 'Tote'
    const result = await getProducts(apiContext, { q: searchCriteria });

    // console.log('Search results:', JSON.stringify(result, null, 2));
    
    expect(result.products[0].name).toContain(searchCriteria);
    expect(result.count).toBe(1);

    result.products.forEach((product: any) => {
      expect(product.id).toBe(1);
      expect(product.name).toBe('Noir Saffiano Tote');
      expect(product.category).toBe('Bags');
      expect(product.priceCents).toBe(285000);
      expect(product.inStock).toBe(true);      
      expect(product.onSale).toBe(true);       
      expect(product.stock).toBe(8);           
    });
      
  });

  test('Search products by category', async () => {

    const searchCriteria = 'Accessories'
    const result = await getProducts(apiContext, { category: searchCriteria });

  //  console.log('Search results:', JSON.stringify(result, null, 2));
    
    expect(result.products[0].category).toContain(searchCriteria);
    expect(result.count).toBe(4);

    result.products.forEach((product: any) => {
      expect(product.category).toBe(searchCriteria);
      expect(product.id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.priceCents).toBeGreaterThan(0);
      expect(product.inStock).toBeDefined();
    });
      
  });

  test('Verify products sorted by price ASC - first 5', async () => {
  
    const expectedSort = loadArrayFixture<ProductPriceList>('sortPriceAscFirst5');
    const actual = await getProductsSortedByPrice(apiContext, 'asc', 5);

    expect(actual.length, 'Count mismatch').toBe(expectedSort.length);

    expectedSort.forEach((expectedProduct, i) => {
      const actualProduct = actual[i];

      expect(actualProduct.id, `Product[${i}] id`).toBe(expectedProduct.id);
      expect(actualProduct.name, `Product[${i}] name`).toBe(expectedProduct.name);
      expect(actualProduct.price, `Product[${i}] price`).toBe(expectedProduct.price);
    });

  });

  test('Verify products sorted by price DESC - first 5', async () => {

    const expectedSort = loadArrayFixture<ProductPriceList>('sortPriceDescFirst5');
    const actual = await getProductsSortedByPrice(apiContext, 'desc', 5);

    expect(actual.length, 'Count mismatch').toBe(expectedSort.length);

    expectedSort.forEach((expectedProduct, i) => {
      const actualProduct = actual[i];

      expect(actualProduct.id, `Product[${i}] id`).toBe(expectedProduct.id);
      expect(actualProduct.name, `Product[${i}] name`).toBe(expectedProduct.name);
      expect(actualProduct.price, `Product[${i}] price`).toBe(expectedProduct.price);
    });

  });

  test('Verify seller products - Noir Saffiano Tote', async () => {
    
    const apiContext = await userData.loginUser( // login as a seller
      'happyFlow',
      'seller@maison.test',
      'Password123!'
    );
    
    try {
   
      const fixture = loadFixture<SellerProductsList>('sellerProducts');
      const result = await getSellerProducts('happyFlow', apiContext);

      // console.log('Seller products:', JSON.stringify(result, null, 2));

      expect(result.products.length).toBe(fixture.expectedCount)

      fixture.products.forEach((expectedProduct: { id: number; name: string; category: string }) => {
        const actual = result.products.find((p: any) => p.id === expectedProduct.id);

        expect(actual, `Product with id ${expectedProduct.id} not found`).toBeDefined();
        expect(actual.name).toBe(expectedProduct.name);
        expect(actual.category).toBe(expectedProduct.category);
      });

      result.products.forEach((product: any) => {
        expect(product.sellerId).toBe(fixture.sellerId);
        expect(product.sellerName).toBe(fixture.sellerName);
      });
      
    } finally {
      await apiContext.dispose();
    }
    
  });

  test('Verify seller products - Forbidden role', async () => {

    const result = await getSellerProducts('forbiddenRole', apiContext);
    
  });

});
