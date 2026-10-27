import { faker } from '@faker-js/faker';

const randomNumber = Math.floor(1000 + Math.random() * 9000);

export class TestData {
  static randomGender(): 'male' | 'female' {
    return faker.helpers.arrayElement(['male', 'female']);
  }

  static randomFirstName(gender?: 'male' | 'female'): string {
    return faker.person.firstName(gender);
  }

  static randomLastName(): string {
    return faker.person.lastName();
  }

  static randomAtelierName(): string {
    return `Test atelier ${faker.string.alpha(5).toLowerCase()}`;
  }

  static randomEmail(): string {
    return `demo.user${randomNumber}@maison.com`;
  }

  static randomAtelierEmail(): string {
    return `demo.atelier${randomNumber}@maison.com`;
  }

  static randomSerbianPhone(): string {
    const country = '+381';
    const prefixes = ['60', '61', '62', '63', '64', '65', '66', '68', '69'];
    const prefix = faker.helpers.arrayElement(prefixes);
    const suffix = faker.string.numeric(faker.helpers.arrayElement([6, 7]));
    return `${country}${prefix}${suffix}`;
  }

  static randomDateOfBirth(): string {
    const date = faker.date.birthdate({ min: 18, max: 65, mode: 'age' });
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  static randomUser() {
    const gender = this.randomGender();
    
    return {
      gender,
      firstName: this.randomFirstName(gender), // ← name matching the gender
      lastName: this.randomLastName(),
      email: this.randomEmail(),
      phone: this.randomSerbianPhone(),
      dateOfBirth: this.randomDateOfBirth(),
      password: 'TestPassword123!'
    };
  }
}