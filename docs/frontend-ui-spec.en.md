# Polyagent Frontend Product & UI Specification (Current Version)

## 1. Product Positioning & Goals

Polyagent is a frontend platform for prediction market funds, serving two user roles:

- Investors: discover funds, submit `deposit/redeem`, and track portfolio performance.
- Managers: maintain fund configurations, monitor managed funds, and operate execution intents.

The core goal is to combine fund discovery, investment operations, and manager workflows into one Web experience with wallet-based authentication and on-chain interaction.

## 2. Core Functional Modules

### 2.1 Global Shared Capabilities

- Fixed top navigation with module entry points.
- Wallet connection and SIWE sign-in.
- Role-based navigation visibility and page access control.
- Locale switching (`EN` / `中文`).
- Unified 404 and global runtime error pages.

### 2.2 Investor Module

- Market fund browsing with search and pagination.
- Fund detail view with KPIs, chart, positions, rankings, and transactions.
- Trade panel for `Deposit/Redeem` with on-chain reads and writes.
- Investment portfolio pages with summary cards and fund-level detail.

### 2.3 Manager Module

- Manager summary dashboard and managed fund list.
- Create Fund modal (current UI form flow).
- Manager fund detail with editable fund sections, analytics, and records.
- Management action panel for market parsing and trade-intent parameter setup (current UI prototype).

## 3. Overall Interface & Layout Structure

### 3.1 Global Frame

- Fixed `GlobalNav` on top.
- Main content centered with max width `1440px`.
- Consistent spacing and card-based information hierarchy.

### 3.2 Common Page Patterns

- List pages (`/market/funds`, `/investment/funds`, `/manager`):
  - Header card
  - Summary cards
  - Data table with search and server pagination
- Detail pages (`/market/funds/[id]`, `/investment/funds/[fundId]`, `/manager/[id]`):
  - Left 2/3 for data and analysis
  - Right 1/3 sticky operation panel

### 3.3 Access and Navigation Behavior

- `Funds` is public.
- `My Investments` requires authenticated session.
- `Fund Management` requires authenticated `MANAGER` role.
- Unauthorized states render in-content cards (`Authentication Required` / `Access Denied`) while keeping page frame.

## 4. Page Catalog & Purpose

### 4.1 `/`

- Purpose: entry forwarding.
- Behavior: redirects to `/market/funds`.

### 4.2 `/market/funds`

- Purpose: fund discovery.
- Main content:
  - discovery header
  - market-level summary cards
  - funds table (search, pagination, `View` action)

### 4.3 `/market/funds/[id]`

- Purpose: full fund detail and trading entry.
- Main content:
  - base fund card (includes Vault, Manager, Created At)
  - KPI cards
  - strategy card
  - NAV performance chart
  - top positions, top investors, recent transactions
  - right sticky `TradePanelCard`

### 4.4 `/investment/funds`

- Purpose: personal portfolio overview.
- Main content:
  - portfolio header
  - investment summary cards
  - investment positions table (search, pagination, `Details` action)

### 4.5 `/investment/funds/[fundId]`

- Purpose: investor-level detail on a specific fund.
- Main content:
  - fund base card with fund description
  - holding and PnL KPI cards
  - value trend chart
  - recent personal transactions
  - right sticky shared `TradePanelCard`

### 4.6 `/manager`

- Purpose: manager workspace overview and fund entry.
- Main content:
  - manager header
  - manager summary cards
  - managed funds table
  - `Create Fund` button + modal

### 4.7 `/manager/[id]`

- Purpose: manager operations for one fund.
- Main content:
  - editable fund sections (`Fund Operations`, `Strategy`, `Rules`)
  - overview KPI cards
  - NAV performance chart
  - holdings and transactions sections
  - execution intents table
  - right sticky `ManagerActionPanel`

### 4.8 `not-found` / `error`

- Purpose: route-not-found and runtime-exception handling.
- Behavior: keep global frame and render a focused message card in content area.
