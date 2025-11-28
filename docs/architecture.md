# Cora Finance Fullstack Architecture Document

**Version:** 1.4 (Final Merged)
**Date:** 2025-11-28
**Author:** Winston (Architect Agent)
**Status:** Approved for Development

---

## 1. Introduction

This document outlines the complete fullstack architecture for **Cora Finance**, a Portugal-first personal finance PWA. It unifies the frontend and backend into a cohesive system designed for security, AI integration, and proactive user insights.

**Scope:**
- **Core Banking:** Transactions, categorization, spending analysis.
- **Investment Engine:** Multi-broker portfolios, performance tracking, tax optimization (PT IRS).
- **Debt Manager:** Loan tracking, payoff strategies (Avalanche/Snowball).
- **Planning:** Goals, Emergency Fund, FIRE projections.
- **Intelligence:** Proactive Insight Feed and Safe-to-Spend calculations.

---

## 2. High Level Architecture

### 2.1 Technical Summary
Cora Finance is a **Serverless PWA** built on **Next.js 14+**. It uses a **Supabase** backend for relational data, authentication, and vector search. The system is designed around an **Event-Driven Insight Engine** and uses **Aggregated Data Models** for high performance.

### 2.2 System Diagram

```mermaid
graph TD
    User[User Device (PWA)]
    
    subgraph "Next.js App (Vercel)"
        UI[UI Shell]
        Dashboard[View: Dashboard & Feed]
        Portfolio[View: Portfolio]
        Planning[View: Goals & Debt]
        ServerActions[Node.js Server Actions]
        PushService[Web Push Service]
    end
    
    subgraph "Core Engines"
        SafeCalc[Safe-to-Spend Calculator]
        DebtEngine[Debt Strategy Engine]
        TaxEngine[PT Tax Logic Engine]
        ParsingEngine[Two-Stage PDF Parser]
    end
    
    subgraph "Data Layer (Supabase)"
        DB[(Postgres: App Data)]
        Aggregates[Materialized Views]
        Triggers[DB Triggers]
        Auth[Auth & RLS]
        Realtime[Realtime Subscriptions]
    end
    
    subgraph "External"
        OpenAI[OpenAI API (Intelligence)]
        YahooFinance[Market Data API]
    end

    User <--> UI
    UI --> Dashboard
    UI --> Portfolio
    UI --> Planning
    
    Dashboard <--> ServerActions
    Portfolio <--> ServerActions
    
    ServerActions -- "1. Raw PDF" --> ParsingEngine
    ParsingEngine -- "2. Text JSON" --> OpenAI
    
    ServerActions <--> DB
    DB -- "Update Event" --> Triggers
    Triggers --> Aggregates
    
    %% Insight Flow
    DB -- "New Data" --> OpenAI
    OpenAI -- "Analysis" --> TaxEngine
    TaxEngine -- "Insight" --> DB
    DB -- "Push" --> Realtime
    DB -- "Notification" --> PushService
    PushService -.-> User
    
    %% Engines
    ServerActions <--> SafeCalc
    ServerActions <--> DebtEngine
```

---

## 3. Tech Stack

| Category | Technology | Purpose | Rationale |
| :--- | :--- | :--- | :--- |
| **Framework** | **Next.js 14+** | Fullstack | App Router for performant PWA; Server Actions for secure backend logic. |
| **Database** | **Supabase** | Backend | Postgres for relational data + Auth + Vector for AI. |
| **ORM** | **Drizzle ORM** | Data Access | Best-in-class TypeScript support and SQL-like syntax. |
| **UI** | **shadcn/ui** | Components | Accessible, customizable, matches UX spec. |
| **Styling** | **Tailwind CSS** | Styling | Utility-first, required for shadcn. |
| **AI** | **OpenAI GPT-4o** | Intelligence | Complex reasoning for tax rules and categorization. |
| **Parser** | **pdf-parse** | PDF Extraction | Lightweight Node.js library for Stage 1 parsing. |
| **Notifications** | **web-push** | Alerts | VAPID protocol for PWA push notifications. |
| **Market Data** | **Yahoo Finance** | Investments | Free/Cheap tier for MVP stock/ETF pricing. |
| **State** | **Zustand** | Client State | Simple global store for user preferences/session. |

---

## 4. Data Models (Schema Design)

### 4.1 Core Domain
**`profiles`**
- `id` (UUID, PK)
- `comfort_floor` (Decimal)
- `risk_tolerance` (Enum)
- `onboarding_completed` (Boolean)
- `onboarding_step` (Integer) - *Tracks progress (1-5)*
- `currency` (Default: 'EUR')
- `push_subscription` (JSON)

### 4.2 Banking & Debt Domain
**`accounts`**
- `id` (UUID, PK)
- `type` (Enum: checking, savings, credit_card, loan, broker)
- `name` (Text)
- `balance` (Decimal)
- `interest_rate` (Decimal) - *For Debt Engine*
- `min_payment` (Decimal) - *For Debt Engine*

**`transactions`**
- `id` (UUID, PK)
- `account_id` (FK)
- `amount` (Decimal)
- `date` (Date)
- `description` (Text)
- `category` (Text)
- `is_recurring` (Boolean)
- `tax_deductible` (Boolean)

**`monthly_summaries`** (Performance Aggregate)
- *Updated via DB Trigger on Transaction change*
- `user_id` (FK)
- `month` (Date)
- `total_in` (Decimal)
- `total_out` (Decimal)
- `savings_rate` (Decimal)

### 4.3 Investment Domain (Event-Sourced)
**`assets`** (Global Cache)
- `ticker` (PK)
- `name` (Text)
- `current_price` (Decimal)
- `last_updated` (Timestamp)

**`investment_transactions`** (The Source of Truth)
- `id` (UUID, PK)
- `account_id` (FK)
- `ticker` (FK)
- `type` (Enum: buy, sell, dividend)
- `quantity` (Decimal)
- `price_per_share` (Decimal)
- `fees` (Decimal)
- `date` (Date)

**`holdings`** (Derived Table)
- *Updated via DB Trigger on Investment Transaction*
- `id` (UUID, PK)
- `account_id` (FK)
- `ticker` (FK)
- `quantity` (Decimal)
- `avg_cost_basis` (Decimal)

### 4.4 Planning Domain
**`goals`**
- `id` (UUID, PK)
- `name` (Text)
- `target_amount` (Decimal)
- `current_amount` (Decimal)
- `deadline` (Date)
- `linked_account_id` (FK, Optional) - *Auto-update from account balance*

### 4.5 Intelligence Domain
**`insights`**
- `id` (UUID, PK)
- `type` (Enum: urgent, warning, opportunity, info)
- `title` (Text)
- `message` (Text)
- `score_impact` (Integer)
- `status` (Enum: new, read, dismissed, acted)

---

## 5. Key System Architectures

### 5.1 Domain Engines (Business Logic)

**A. Safe-to-Spend Engine**
$$SafeSpend = (LiquidAssets) - ComfortFloor - (PendingBills)$$
*   **Optimization:** Does NOT query raw transactions. Queries `accounts` + `profiles` + `recurring_patterns`.

**B. Investment Analysis Engine (PT Tax Aware)**
*   **FIFO Logic:** Matches shares against oldest `investment_transactions` "Buy" records to calculate accurate Capital Gains.
*   **Performance:** Calculates `(CurrentPrice * Qty) - (AvgCost * Qty)`.
*   **Global Asset Cache:** Cron job updates `assets` table prices every 15 mins. Users query DB, not API.

**C. Debt Strategy Engine**
*   **Simulation:** Runs Avalanche (Highest Interest) vs Snowball (Lowest Balance) simulations on demand.
*   **Output:** Returns payoff date and total interest saved for each strategy.

**D. The Insight Feed (Central Nervous System)**
The backend listens to changes in all domains to populate the Feed.
*   **Spending Event:** Transaction > Budget? -> `Insight`
*   **Investment Event:** Market Drop > 5%? -> `Insight`
*   **Tax Event:** Date = Dec 15? -> `Insight`

### 5.2 Infrastructure Engines (Technical Logic)

**A. Two-Stage Parsing Engine (Cost Optimization)**
Directly sending PDFs to OpenAI is too expensive.
1.  **Stage 1 (Node.js):** User uploads PDF. Server Action uses `pdf-parse` to extract raw text strings.
2.  **Stage 2 (AI):** Send *only* the text strings to OpenAI with a schema definition.
3.  **Result:** 90% reduction in token usage vs. Vision API.

**B. Proactive Notification Service**
1.  **Client:** Registers Service Worker -> Sends `PushSubscription` object to DB.
2.  **Server:** When an `Urgent` insight is generated, use `web-push` library to send encrypted payload.
3.  **Result:** User receives system notification even if app is closed.

---

## 6. API & Server Actions

### Core Actions
- `uploadStatement(formData)`: Triggers Two-Stage Parsing.
- `bulkUpdateCategories(ids[], category)`: High-performance batch update.
- `getDashboardData()`: Fetches `monthly_summaries`, `SafeSpend`, and `InsightFeed`.

### Investment Actions
- `addHolding(ticker, qty, price, date, fees)`: Adds transaction + updates avg cost.
- `getPortfolioAnalysis()`: Returns allocation %, risk score, and tax exposure.

### Planning Actions
- `calculateFireProjection(savingsRate, returnRate)`: Returns years to retirement.
- `updateGoal(id, amount)`: Updates progress manually (if not linked).

### Background Jobs (Cron)
- `syncMarketData()`: Updates `assets` table.
- `detectSubscriptions()`: Scans recent transactions for recurring amounts/merchants.

---

## 7. Security & Privacy

1.  **RLS (Row Level Security):** Strict policies. `auth.uid() = user_id`.
2.  **Privacy Shield:** API exposes `is_encrypted: true` status to UI.
3.  **Data Minimization:** We do not store PDF files. We extract data and delete the file immediately from memory.

---

## 8. Handoff Instructions

1.  **Database:** Run Supabase migration scripts (Schema + Triggers + RLS).
2.  **Env Vars:** Configure `OPENAI_API_KEY`, `SUPABASE_URL`, `VAPID_KEYS`.
3.  **Frontend:** Generate UI using UX Spec v1.3.
