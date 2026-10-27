import { test, expect, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { UserData } from '../../api-objects/AuthApi';
import { addItemToCart, addMultipleItems, removeItemFromCart, clearCart, getCart } from '../../api-objects/CartApi';
import { resetDatabase, checkHealth } from '../../api-objects/SystemApi';

let userData: UserData;
userData = new UserData();

test.describe.configure({ mode: 'serial' });


test.beforeAll(async () => {
  const apiContext = await request.newContext();
  try {
    await checkHealth(apiContext);
  } finally {
    await apiContext.dispose();
  }
});

test.beforeEach(async () => {
  const apiContext = await request.newContext();
  try {
    await resetDatabase(apiContext);
  } finally {
    await apiContext.dispose();
  }
});

test.describe('Cart API test suite', () => {

  const fixurePath = process.env.FIXURE_PATH!;

  test('Add single item to cart', async () => {
    // 1. Log in as buyer
    const apiContext = await userData.loginUser('happyFlow', 'buyer@maison.test', 'Password123!');

    try {

      await addItemToCart('happyFlow', apiContext, 1, 1);
    
      const cart = await getCart(apiContext);
      
     //  console.log('Cart:', JSON.stringify(cart, null, 1));

      console.log('Length: '+cart.cart.items.length)
      console.log('Count: '+cart.cart.count)

      expect(cart.cart.items.length).toEqual(1);
      expect(cart.cart.items[0].productId).toBe(1);
      expect(cart.cart.count).toBe(1)

    } finally {
      await apiContext.dispose();
    }
  });

  test('Add multiple items to cart', async () => {

    const apiContext = await userData.loginUser('happyFlow', 'buyer@maison.test', 'Password123!');

    try {
      const fixtureName = 'items';
      const filePath = path.join(fixurePath, fixtureName + '.json');
      const raw = fs.readFileSync(filePath, 'utf-8');
      const products = JSON.parse(raw);

      await addMultipleItems(apiContext, products);

      const cart = await getCart(apiContext);

      expect(cart.cart.items.length).toBe(products.length);
      expect(cart.cart.count).toBe(6);

      products.forEach((expected: { productId: number; quantity: number }, i: number) => {
        // console.log(i)
        expect(cart.cart.items[i].productId).toBe(expected.productId);
        expect(cart.cart.items[i].quantity).toBe(expected.quantity);
      });
    } finally {
      await apiContext.dispose();
    }
  });

  test('Remove item from cart', async () => {

  const apiContext = await userData.loginUser(
    'happyFlow',
    'buyer@maison.test',
    'Password123!'
  );

  try {
    // 1. Add two products
    await addItemToCart('happyFlow', apiContext, 1, 2);
    await addItemToCart('happyFlow', apiContext, 2, 3);

    // 2. Verify the cart has 2 items
    let cart = await getCart(apiContext);
    expect(cart.cart.items.length).toBe(2);
    expect(cart.cart.count).toBe(5);

    // 3. Get the itemId of the first item
    const itemIdToRemove = cart.cart.items[0].itemId;
    console.log('itemId to remove:', itemIdToRemove)

    // 4. Remove the item
    await removeItemFromCart(apiContext, itemIdToRemove);

    // 5. Verify the cart is now empty (or contains only the second item)
    cart = await getCart(apiContext);
    expect(cart.cart.items.length).toBe(1);
    expect(cart.cart.items[0].productId).toBe(2);
    expect(cart.cart.count).toBe(3);

  } finally {
    await apiContext.dispose();
  }
});

test('Clear cart', async () => {

  const apiContext = await userData.loginUser(
    'happyFlow',
    'buyer@maison.test',
    'Password123!'
  );

  try {
    
    const fixtureName = 'items_5'; // 5 items
    const filePath = path.join(fixurePath, fixtureName + '.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const products = JSON.parse(raw);
    
    // add the items
    await addMultipleItems(apiContext, products);

    // verify the cart items amount
    let cart = await getCart(apiContext);
    expect(cart.cart.items.length).toBe(5);
    expect(cart.cart.count).toBe(10);

    // clear the cart
    await clearCart(apiContext);

    // verify if the cart is empty
    cart = await getCart(apiContext);
    expect(cart.cart.items.length).toBe(0);
    expect(cart.cart.count).toBe(0);
  } finally {
    await apiContext.dispose();
  }
});

test('Add out of stock item to cart', async () => {

  const apiContext = await userData.loginUser('happyFlow', 'buyer@maison.test', 'Password123!');

  try {

    await addItemToCart('outOfStock', apiContext, 6, 1);

  } finally {
    await apiContext.dispose();
  }
    
});

test('Add item with insufficient stock quantity to cart', async () => {

  const apiContext = await userData.loginUser('happyFlow', 'buyer@maison.test', 'Password123!');

  try {

    await addItemToCart('insufficientStock', apiContext, 1, 1000000);

  } finally {
    await apiContext.dispose();
  }
    
});

test('Add non-existing product to cart', async () => {

  const apiContext = await userData.loginUser('happyFlow', 'buyer@maison.test', 'Password123!');

  try {

    await addItemToCart('productNotFound', apiContext, 99999, 1);

  } finally {
    await apiContext.dispose();
  }
    
});

test('Add invalid product quantity to cart', async () => {

  const apiContext = await userData.loginUser('happyFlow', 'buyer@maison.test', 'Password123!');

  try {

    await addItemToCart('invalidQuantity', apiContext, 1, -1);

  } finally {
    await apiContext.dispose();
  }
    
});


});