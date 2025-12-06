# 🌊 Cora Finance

> **Your AI-powered personal finance assistant — built for Portugal, ready for the world.**

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-postgres-3ecf8e?logo=supabase)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ What is Cora Finance?

Cora Finance is a **personal finance web app** that helps you understand where your money goes, find tax savings you're missing, and feel confident about your financial future.

Most finance apps were built for the US market. Cora is different:

- 🇵🇹 **Portugal-first** — understands Portuguese tax law (IRS), local banks (Moey, ActivoBank, CGD), and EU investment brokers (XTB, Trading212, Degiro).
- 🤖 **Proactive, not passive** — Cora comes to *you* with insights; you don't have to dig.
- 🎓 **Educational** — teaches you *why*, not just *what*, building financial literacy over time.
- 🧘 **Calm confidence** — reduces anxiety through clarity, not overwhelming you with data.

> *"You're leaving €847 on the table this year in IRS deductions you didn't claim."*

---

## 🚀 Features

| Category | What you get |
|----------|--------------|
| **Smart Data Import** | Upload bank statement PDFs — AI parses and categorizes transactions automatically. |
| **Safe-to-Spend** | Know exactly how much you can spend without dipping below your comfort floor. |
| **Insight Feed** | Proactive alerts for spending anomalies, invisible subscriptions, and opportunities. |
| **Tax Intelligence** | Finds IRS deductions, tracks tax deadlines, and optimizes your investments for Portuguese tax law. |
| **Investment Dashboard** | Unified view of your portfolio across brokers, with risk analysis and diversification tips. |
| **Debt Management** | Compare payoff strategies (Avalanche vs Snowball), simulate extra payments, see true loan costs. |
| **Goals & FIRE** | Track savings goals, emergency fund progress, and your path to financial independence. |
| **Financial Literacy** | Contextual micro-lessons triggered by your real financial situations. |
| **Push Notifications** | Get proactive alerts when something important happens. |
| **Liquid Glass UI** | A modern, glassmorphism-inspired design that feels calm, confident, and beautiful. |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS + custom Liquid Glass design tokens |
| **UI Primitives** | shadcn/ui + custom components |
| **Database & Auth** | Supabase (Postgres + Auth + Row-Level Security) |
| **ORM / Migrations** | Drizzle ORM (migrations in `db/`) |
| **AI / LLM** | OpenRouter (transaction parsing, chat, insights) |
| **Testing** | Playwright (E2E, PWA), Jest (unit) |
| **Charts** | Recharts |
| **Icons** | Lucide React |

---

## ⚡ Quick Start

### Prerequisites

- **Node.js 18+**
- **npm** (or pnpm)
- A **Supabase** project (for database, auth, and storage)
- An **OpenRouter** API key (for AI features)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/mrricardocarvalho/cora-finance.git
cd cora-finance

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and OpenRouter credentials

# 4. Run database migrations (apply SQL files in db/migrations)
# Use psql, pgcli, or your preferred tool

# 5. Start the dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and you're in! 🎉

### Production Build

```bash
npm run build
npm run start
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root (**never commit this file**):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `DATABASE_URL` | Postgres connection string |
| `OPENROUTER_API_KEY` | API key for AI features |
| `CRON_SECRET` | Secret to protect cron endpoints |

---

## 🧪 Testing

### Unit Tests (Jest)

```bash
npm test
```

### End-to-End Tests (Playwright)

```bash
# Install browsers (once per environment)
npx playwright install

# Run tests
npx playwright test
```

> **CI tip:** Run `npx playwright install --with-deps` in your pipeline.

---

## 📁 Repository Structure

```
/cora-finance
├── src/
│   ├── app/              # Next.js App Router pages and layouts
│   ├── components/       # React components (UI, dashboard, education, etc.)
│   ├── lib/              # Utilities, actions, AI helpers, i18n
│   ├── styles/           # globals.css with Liquid Glass design tokens
│   ├── db/               # Drizzle schema and helpers
│   └── types/            # TypeScript types
├── db/
│   └── migrations/       # SQL migration files (tracked in git)
├── docs/                 # Design docs, PRD, UX specs
├── scripts/              # Developer scripts and utilities
├── tests/                # Playwright and Jest tests
├── public/               # Static assets, PWA manifest, icons
├── .env.example          # Example environment variables
├── tailwind.config.ts    # Tailwind configuration
├── drizzle.config.ts     # Drizzle ORM config
├── playwright.config.ts  # Playwright E2E config
└── README.md             # You are here!
```

---

## 🎨 Style & Design

Cora uses a custom **Liquid Glass** design system inspired by macOS Lake Tahoe.

Key design tokens (in `src/styles/globals.css`):

- **Glass surfaces:** `--surface`, `--surface-glass`, `--surface-elevated`
- **Gradients:** `--gradient-primary`, `--gradient-glass`, `--gradient-mesh`
- **Shadows:** `--shadow-glass`, `--shadow-elevated`

When adding components, prefer tokenized colors and reuse the `glass` utility classes for consistency.

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository.
2. **Clone** your fork and create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Install dependencies** and set up your environment (see Quick Start).
4. **Make your changes** — follow the code style and run linting:
   ```bash
   npm run lint
   ```
5. **Write or update tests** and ensure they pass:
   ```bash
   npm test
   npx playwright test
   ```
6. **Commit** with a clear message:
   - `feat:` — new feature
   - `fix:` — bug fix
   - `docs:` — documentation update
   - `refactor:` — code restructuring
7. **Open a Pull Request** against `dev` with a summary of your changes.

### Code of Conduct

Be respectful, kind, and collaborative. We're building something useful together. 💙

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Dev server won't start | Run `npm run build` to surface build-time errors. |
| Playwright tests fail | Run `npx playwright install` to install browsers. |
| Supabase auth/DB errors | Check `.env` variables and ensure migrations are applied. |
| AI features not working | Confirm your OpenRouter API key is set and valid. |

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 💬 Contact & Support

- **Maintainer:** [@mrricardocarvalho](https://github.com/mrricardocarvalho)
- **Project Docs:** See [docs/](docs) for UX specs, PRD, and design rationale.
- **Issues:** Open an issue on GitHub for bugs or feature requests.

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/)
- [OpenRouter](https://openrouter.ai/)
- [Playwright](https://playwright.dev/)
- [Lucide Icons](https://lucide.dev/)
- [Recharts](https://recharts.org/)

---

> *Cora Finance — built for Ricar, ready for Portugal.* 🇵🇹


