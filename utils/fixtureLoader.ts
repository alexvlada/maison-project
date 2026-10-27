import * as fs from 'fs';
import * as path from 'path';

const FIXTURES_PATH = path.join(__dirname, '../fixtures');

/**
 // Loads any fixture file by name
 * @param fileName - file name without the .json extension (e.g. 'shipping', 'categories')
 * @returns parsed JSON object
 */
export function loadFixture<T = any>(fileName: string): T {
  const filePath = path.join(FIXTURES_PATH, `${fileName}.json`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

// Loads a fixture that is a plain array
export function loadArrayFixture<T = any>(fileName: string): T[] {
  const filePath = path.join(FIXTURES_PATH, `${fileName}.json`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T[];
}