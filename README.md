# Maison Playwright Test Suite

Comprehensive test suite for the Maison e-commerce demo application, built with Playwright and TypeScript. Part of my QA automation portfolio.

## Project Structure

```text
maison-project/
├── api-objects/          # API Object Model
├── page-objects/         # Page Object Model
├── types/                # TypeScript types
├── utils/                # Helpers (fixture loader, test data)
├── fixtures/             # Test data (JSON)
├── schemas/              # JSON Schemas for validation
├── tests/
│   ├── api/              # API tests
│   ├── ui/               # UI tests
│   ├── e2e/              # End-to-end tests
│   └── performance/      # k6 performance tests
└── playwright.config.ts
```

## Tech Stack

- **Playwright** – UI, API, and E2E testing
- **TypeScript** – Type safety
- **k6** – Performance testing
- **AJV** – JSON Schema validation
- **Faker** – Test data generation
- **Docker** – Maison application

## Setup

### Prerequisites

- Node.js 20+
- Docker
- k6 (for performance tests)

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```dotenv
BASE_URL=http://localhost:4000
API_BASE_URL=http://localhost:4000/api/v1/
NEW_USER_PASSWORD=your-test-password
```

| Variable | Description | Example |
|---|---|---|
| `BASE_URL` | Frontend URL (for UI tests) | `http://localhost:4000` |
| `API_BASE_URL` | Backend API URL (for API tests) | `http://localhost:4000/api/v1/` |
| `NEW_USER_PASSWORD` | Password used for new test users | `your-test-password` |

Replace `your-test-password` with a suitable test password. Never commit your actual `.env` file or credentials to Git. Add `.env` to `.gitignore` and consider providing a `.env.example` file with placeholder values.

### Start the Application

```bash
npm run docker:start
```

### Run Tests

```bash
npm run test:api       # API tests
npm run test:schemas   # Schema validation
npm run test:ui        # UI tests (Chromium)
npm run test:e2e       # E2E tests
npm run perf:smoke     # Performance smoke test
```

## Test Suites

### API Tests

- **Auth** – Register, login, and current-user endpoints
- **Products** – List, detail, categories, and seller products
- **Cart** – Add, retrieve, remove, and clear items
- **Orders** – Place orders, list orders, and retrieve order details

### Schema Validation

Seven JSON Schemas validated with AJV:

- `product-detail`
- `product-list`
- `order`
- `orders-list`
- `user-me`
- `cart`
- `error`

### UI Tests

- **Registration** – Buyer registration, atelier registration, and mandatory-field validation
- **Login** – Buyer login, atelier login, and invalid credentials

### E2E Tests

Complete user journey:

`Register → Login → Search → Checkout → Verify`

### Performance Tests (k6)

The project includes five performance tests, each targeting a different scenario.

| Test | Command | Duration | VUs | Purpose |
|---|---|---|---:|---|
| Smoke | `npm run perf:smoke` | 10s | 5 | API availability |
| Load | `npm run perf:load` | 2 min | 50 | Normal traffic performance |
| Stress | `npm run perf:stress` | 5 min | 500 | System limits under increasing load |
| Spike | `npm run perf:spike` | 1.5 min | 500 | Handling sudden traffic surges |
| Soak | `npm run perf:soak` | 12 min | 100 | Long-term stability |

### Running Performance Tests

```bash
npm run perf:smoke    # Smoke test (also runs in CI)
npm run perf:load     # Load test (manual)
npm run perf:stress   # Stress test (manual)
npm run perf:spike    # Spike test (manual)
npm run perf:soak     # Soak test (manual)
```

### Performance Results (Maison API)

| Test | Average | p(95) | Max | Failed |
|---|---:|---:|---:|---:|
| Smoke | 11 ms | 22 ms | 34 ms | 0% |
| Load | 8 ms | 15 ms | 90 ms | 0% |
| Stress | 124 ms | 463 ms | 9.29 s | 0% |
| Spike | 423 ms | 472 ms | 34.49 s | 0% |
| Soak | 8.51 ms | 18 ms | 98 ms | 0% |

**Conclusion**

The Maison API recorded zero failed requests across the reported test runs, including tests with up to 500 virtual users. Response times degraded under extreme load, particularly in the stress and spike scenarios. The 12-minute soak test showed no obvious signs of instability in the reported results.

**Note:** Only `perf:smoke` runs in CI. The remaining performance tests are executed manually for deeper performance analysis.

## CI/CD

GitHub Actions runs automatically on every push and pull request.

- **Test job** – API, E2E, and UI tests
- **Performance job** – k6 smoke test