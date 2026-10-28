# Maison Playwright Test Suite

Comprehensive test suite for the Maison e-commerce demo application, built with Playwright and TypeScript. Part of my QA automation portfolio.

## Project Structure

maison-project/
├── api-objects/       # API Object Model
├── page-objects/      # Page Object Model
├── types/             # TypeScript types
├── utils/             # Helpers (fixture loader, test data)
├── fixtures/          # Test data (JSON)
├── schemas/           # JSON Schemas for validation
├── tests/
│   ├── api/           # API tests
│   ├── ui/            # UI tests
│   ├── e2e/           # End-to-end tests
│   └── performance/   # k6 performance tests
└── playwright.config.ts

## Tech Stack

- Playwright – UI, API, E2E testing
- TypeScript – type safety
- k6 – performance testing
- AJV – JSON Schema validation
- Faker – test data generation
- Docker – Maison application

## Setup

### Prerequisites

- Node.js 20+
- Docker
- k6 (for performance tests)

### Install dependencies

npm install

### Environment variables

Create a `.env` file in the project root:

BASE_URL=http://localhost:4000
API_BASE_URL=http://localhost:4000/api/v1/
NEW_USER_PASSWORD=TestPassword123!

| Variable | Description | Example |
|----------|-------------|---------|
| BASE_URL | Frontend URL (for UI tests) | http://localhost:4000 |
| API_BASE_URL | Backend API URL (for API tests) | http://localhost:4000/api/v1/ |
| NEW_USER_PASSWORD | Password used for new test users | TestPassword123! |

### Start the application

npm run docker:start

### Run tests

npm run test:api        # API tests
npm run test:schemas    # Schema validation
npm run test:ui         # UI tests (Chromium)
npm run test:e2e        # E2E tests
npm run perf:smoke      # Performance smoke test

## Test Suites

### API Tests
- Auth – register, login, me
- Products – list, detail, categories, seller products
- Cart – add, get, remove, clear
- Orders – place, list, detail

### Schema Validation
- 7 JSON Schemas validated with AJV
- product-detail, product-list, order, orders-list, user-me, cart, error

### UI Tests
- Registration – buyer, atelier, mandatory data validation
- Login – buyer, atelier, invalid credentials

### E2E Tests
- Full user journey: register → login → search → checkout → verify

### Performance Tests (k6)

The project includes 5 performance tests, each targeting a different scenario:

| Test | Command | Duration | VUs | What it measures |
|------|---------|----------|-----|------------------|
| Smoke | npm run perf:smoke | 10s | 5 | API availability |
| Load | npm run perf:load | 2min | 50 | Normal traffic performance |
| Stress | npm run perf:stress | 5min | 500 | Breaking point |
| Spike | npm run perf:spike | 1.5min | 500 | Sudden surge handling |
| Soak | npm run perf:soak | 12min | 100 | Long-term stability |

### Running performance tests

npm run perf:smoke    # Smoke test (also runs in CI)
npm run perf:load     # Load test (manual)
npm run perf:stress   # Stress test (manual)
npm run perf:spike    # Spike test (manual)
npm run perf:soak     # Soak test (manual)

### Results (Maison API)

| Test | avg | p(95) | max | failed |
|------|-----|-------|-----|--------|
| Smoke | 11ms | 22ms | 34ms | 0% |
| Load | 8ms | 15ms | 90ms | 0% |
| Stress | 124ms | 463ms | 9.29s | 0% |
| Spike | 423ms | 472ms | 34.49s | 0% |
| Soak | 8.51ms | 18ms | 98ms | 0% |

Conclusion: Maison API stays stable up to 500 VUs with zero failures, though response times degrade under extreme load. No memory leaks detected during the 12-minute soak test.

Note: Only perf:smoke runs in CI. Other tests are run manually for deeper performance analysis.

## CI/CD

GitHub Actions runs on every push and PR:

- test job: API + E2E + UI tests
- performance job: k6 smoke test