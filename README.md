# Fullstack QA Framework

[![UI Tests](https://github.com/Dag86/fullstack-qa-framework/actions/workflows/ui.yml/badge.svg)](https://github.com/Dag86/fullstack-qa-framework/actions/workflows/ui.yml)
[![API Mock Tests](https://github.com/Dag86/fullstack-qa-framework/actions/workflows/api-mock.yml/badge.svg)](https://github.com/Dag86/fullstack-qa-framework/actions/workflows/api-mock.yml)
[![Node.js](https://img.shields.io/badge/node-20.x-339933?logo=node.js\&logoColor=fff)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript\&logoColor=fff)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.x-45ba4b?logo=playwright\&logoColor=fff)](https://playwright.dev/)
[![Lint](https://img.shields.io/badge/ESLint-8.x-4B32C3?logo=eslint\&logoColor=fff)](https://eslint.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

A **portfolio-ready, full-stack QA automation framework** showcasing:

* **UI Testing** with Playwright (TypeScript, POM pattern) against SauceDemo
* **API Testing (Mocked)** using Playwright route interception (auth + products)
* **Modular structure** ready for Unit (Vitest/Jest) and Performance (k6) modules
* **CI-ready** (GitHub Actions badges & artifacts)

---

## Table of Contents

- [Fullstack QA Framework](#fullstack-qa-framework)
  - [Table of Contents](#table-of-contents)
  - [Stack](#stack)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
  - [Running Tests](#running-tests)
    - [Run everything (UI + API mocked)](#run-everything-ui--api-mocked)
    - [Only UI tests](#only-ui-tests)
    - [Only mocked API tests](#only-mocked-api-tests)
  - [Mock API Module](#mock-api-module)
  - [Reports \& Artifacts](#reports--artifacts)
  - [CI/CD (GitHub Actions)](#cicd-github-actions)
  - [Contributing](#contributing)
  - [Troubleshooting](#troubleshooting)
  - [Roadmap](#roadmap)
  - [License](#license)

---

## Stack

* **Language:** TypeScript (Node 20)
* **UI:** Playwright + Page Object Model (POM)
* **API:** Playwright `page.route()` mocking (SauceDemo-style endpoints)
* **Lint/Format:** ESLint + Prettier
* **Env:** `dotenv`
* **Reporters:** Playwright HTML (Allure hooks ready)
* **CI:** GitHub Actions

---

## Project Structure

```
project-root/
├── fixtures/
│   ├── mock-data.ts                 # Fake users/products for mocked API
│   └── (future) schemas/            # AJV JSON schemas (optional)
├── pages/                           # POM classes for UI (Login, Inventory, etc.)
├── tests/
│   ├── ui/                          # UI specs (SauceDemo flows)
│   └── api/                         # Mocked API specs
├── utils/
│   ├── mockApi.ts                   # Route interception helper
│   ├── apiClient.ts                 # For real API tests (future)
│   └── *.ts                         # Helpers (locators, screenshots, etc.)
├── reports/                         # HTML/Allure reports (gitignored)
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── .env.example / .env              # Local runtime vars (gitignore your .env)
```

---

## Getting Started

```bash
# Node 20 is recommended
npm ci
npx playwright install --with-deps

# create local env from example
cp .env.example .env
```

> **Windows (PowerShell):**
>
> ```powershell
> npm ci
> npx playwright install --with-deps
> Copy-Item .env.example .env -Force
> ```

---

## Running Tests

### Run everything (UI + API mocked)

```bash
npx playwright test
```

### Only UI tests

```bash
npx playwright test tests/ui
```

### Only mocked API tests

```bash
npm run test:api:mock
# or
npx playwright test -g "Mocked"
```

> The `-g "Mocked"` filter runs suites whose `describe()` names include “Mocked”.

---

## Mock API Module

SauceDemo has **no public API**, so this project **mocks** endpoints with Playwright routing.

* **Origin:** `http://mock.local` (configurable with `MOCK_ORIGIN` in `.env`)
* **Endpoints:**

  * `POST /api/login` → `200 { token }` for `standard_user` / `secret_sauce`,
    `401 { message }` for invalid creds,
    `200 { locked: true }` for `locked_out_user`.
  * `GET /api/products` → `{ products: [...], total }`
  * `GET /api/products/:id` → product | `404 { message }`

**Key files**

* `fixtures/mock-data.ts` – fake users/products
* `utils/mockApi.ts` – registers `page.route()` for the above endpoints
* `tests/api/mock-*.spec.ts` – specs calling the mocked API via `fetch`

Run:

```bash
npm run test:api:mock
```

---

## Reports & Artifacts

* **HTML report (local):**

  ```bash
  npx playwright show-report reports/ui
  ```
* **Test results (default):** `playwright-report/`, `test-results/` (both gitignored)
* **Allure (optional):** switch reporter in `playwright.config.ts`, output to `reports/allure/`

---

## CI/CD (GitHub Actions)

Add these workflows (filenames must match badges):

`.github/workflows/ui.yml`

```yaml
name: UI Tests
on: [push, pull_request]
jobs:
  ui:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test tests/ui
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-ui
          path: playwright-report
```

`.github/workflows/api-mock.yml`

```yaml
name: API Mock Tests
on: [push, pull_request]
jobs:
  api-mock:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:api:mock
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-api-mock
          path: playwright-report
```

> After committing those, the badges at the top will light up.

---

## Contributing

1. Create a feature branch:

   ```bash
   git checkout -b feature/<short-desc>
   ```
2. Make changes with tests.
3. Run:

   ```bash
   npx playwright test
   npm run lint
   ```
4. PR into `main`.

---

## Troubleshooting

* **“No tests found”**: Don’t pass paths as args; they’re treated as regex filters. Use `npx playwright test` or `-g` filters.
* **CRLF/LF warnings on Windows**:
  `git config core.autocrlf true`
* **Mock origin navigation fails**: Set `MOCK_ORIGIN=http://localhost.test` in `.env`.
* **Type errors on JSON**: Make sure `resolveJsonModule: true` in `tsconfig.json`.

---

## Roadmap

* **Module 4:** Unit tests (Vitest) for helpers & validators
* **Module 5:** Performance tests (k6) — login/product browse
* **Module 6:** Allure reporting + Codecov
* **Security:** `npm audit` and OWASP ZAP baseline (optional)

---

## License

MIT — see `LICENSE` (add one if missing).
