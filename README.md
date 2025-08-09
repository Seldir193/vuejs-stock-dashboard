# Magnificent Seven – Financial Dashboard (Vue 3)

Interactive dashboard for the “Magnificent Seven” (AAPL, MSFT, AMZN, GOOG, META, NVDA, TSLA).  
Displays **Revenue (Quarterly & TTM)**, **Net Income (TTM)**, **Gross Margin (LQ)**, **YoY Revenue Growth**, and **TTM Breakdown** via donut charts.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Data Flow](#data-flow)
- [Widgets Charts](#widgets-charts)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Quality Guidelines](#quality-guidelines)
- [Troubleshooting](#troubleshooting)
- [To-Do](#to-do)

---

## Tech Stack
- **Vue 3** (Composition API)
- **Pinia** (State Management)
- **vue-chartjs 5** + **Chart.js 4** + **chartjs-plugin-datalabels**
- **Day.js** (Quarter helper)
- **ESLint** (Vue/JS linting)
- **Webpack** (vue-loader)

---

## Quick Start
**Requirements:** Node.js ≥ 18

```bash
# 1) Install dependencies
npm install

# 2) Run local dev server
npm run serve

# 3) Check/fix lint issues
npm run lint
npm run lint:fix

# 4) Build for production
npm run build

```

---

## Project Structure

```text

src/
  assets/
    img/                 
  components/
    BaseCard.vue
    widgets/
      RevenueWidget.vue
      RevenueChart.vue         
      RevenueBreakdown.vue     
      NetIncomeChart.vue       
      GrossMarginChart.vue      
      RevenueGrowthChart.vue    
  services/
    stockService.js             
  stores/
    useSevenStore.js           
  utils/
    metrics.js                  
  App.vue
  main.js

```

---

## Data Flow
1. **API Call** – `stockService.js` retrieves financial data for all defined symbols from the API.
2. **State Management** – The fetched data is stored in the Pinia store `useSevenStore.js`.
3. **Data Processing** – `metrics.js` parses, calculates, and formats the raw data into a usable structure.
4. **Visualization** – The processed data is displayed in widget components using Chart.js.

---

## Widgets Charts
- **NetIncomeChart.vue** – Displays the net income trend over multiple quarters using a bar/line chart.
- **GrossMarginChart.vue** – Visualizes the last reported gross margin percentage with color-coded bars per company.
- **RevenueChart.vue** – Shows total revenue over time for selected companies.
- **Custom Tooltips** – Provide detailed quarter information on hover.
- **Color Coding** – Each company is assigned a distinct color for easier identification.

---

## Configuration
- API base URL / Keys: configure in `.env` / `.env.local` (e.g. `VUE_APP_API_BASE`, `VUE_APP_API_KEY`).
- Symbols: managed in `src/stores/useSevenStore.js` (`SYMBOLS` array).
- Chart options: defined in each widget component under `options` / `chart-options`.
- Feature flags (optional, Webpack DefinePlugin):
  - `__VUE_OPTIONS_API__`: `true`
  - `__VUE_PROD_DEVTOOLS__`: `false`
  - `__VUE_PROD_HYDRATION_MISMATCH_DETAILS__`: `false`

  ---

## Scripts
- **npm run serve** – Starts the development server with hot-reload.
- **npm run build** – Compiles and minifies the project for production deployment.
- **npm run lint** – Runs ESLint to check for code style and syntax issues.
- **npm run test** – Executes unit tests (if configured).

---

## Quality Guidelines
- **One task per function** – Each function should handle only a single responsibility.
- **Maximum 14 lines per function** – Longer logic should be split into helper functions.
- **Meaningful names** – Use descriptive names for variables, functions, and components.
- **No unused code** – Remove unused variables, imports, and commented-out code.
- **Follow PEP 8 / ESLint rules** – Ensure the code is consistent with established style guides.
- **Consistent formatting** – Apply Prettier or your chosen formatter before commits.

---

## Troubleshooting
- **Data not loading** – Check API keys, network connection, and console errors.
- **Chart not rendering** – Verify data format and ensure Chart.js plugins are registered.
- **Styling issues** – Clear browser cache and check for conflicting CSS.
- **Build errors** – Run `npm install` to ensure dependencies are up-to-date.
- **ESLint warnings** – Fix code style issues or adjust `.eslintrc` if necessary.

---

## To-Do
- Add more chart types (e.g., pie, radar).
- Implement dark mode support.
- Improve mobile responsiveness.
- Add unit tests for all utility functions.
- Enhance performance for large datasets.

---
