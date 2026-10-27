export type RegistrationRole = 'buyer' | 'atelier' | 'seller' | '';
export type RegistrationScenario = 'happyFlow' | 'alreadyExistingUser' | 'badRequest1' | 'badRequest2' | 'badRequest3' | 'badRequest4';
export type LoginScenario = 'happyFlow' | 'missingCredentials' | 'invalidCredentials' | 'badRequest1';
export type AddItemScenario = 'happyFlow' | 'outOfStock' | 'insufficientStock' | 'productNotFound' | 'invalidQuantity';
export type PlaceOrderScenario = 'happyFlow' | 'emptyCart';
export type SellerProductsScenario = 'happyFlow' | 'forbiddenRole';
export type SortDirection = 'asc' | 'desc';