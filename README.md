# SpendWise 💸

A neat, mobile-friendly **daily expense tracker** — record every rupee coming in and going out, and always know *how* your money moved (Cash, UPI, Card or Bank Transfer).

## ✨ Features

- **Income & expense tracking** — add transactions in seconds with a big amount pad and one-tap category chips
- **Payment modes** — tag every transaction as Cash, UPI, Card or Bank Transfer; see exactly how cash was credited/debited
- **Dashboard** — total balance, money in/out, this-month stats and per-mode breakdown
- **History** — day-grouped list (Today / Yesterday / date) with search and filters by type & payment mode
- **Analytics** — 6-month income-vs-expense chart, 30-day daily flow, spending-by-category donut and debits-by-payment-mode chart
- **Edit & delete** — full control over every entry, with confirmation before deleting
- **Website + mobile site in one** — responsive layout with a bottom navigation bar and bottom-sheet form on mobile, top nav on desktop

## 🛠 Tech Stack

| Layer      | Tech                                       |
| ---------- | ------------------------------------------ |
| Framework  | Next.js 16 (App Router) + TypeScript       |
| UI         | Tailwind CSS 4 + shadcn/ui + Lucide icons  |
| Charts     | Recharts                                   |
| Database   | Prisma ORM + SQLite                        |
| Data layer | TanStack Query                             |

## 🚀 Getting Started

```bash
# 1. install dependencies
bun install   # or npm install

# 2. configure the database
#    create a .env file with:
DATABASE_URL="file:./db/custom.db"

# 3. push the Prisma schema to SQLite
bun run db:push   # or npx prisma db push

# 4. start the dev server
bun run dev       # or npm run dev
```

Open http://localhost:3000 and start tracking!

## 📁 Project Structure

```
prisma/schema.prisma              # Transaction model (type, amount, category,
                                  #   description, paymentMethod, date)
src/app/api/transactions/         # REST API: GET / POST, PUT / DELETE by id
src/lib/expense.ts                # Categories, payment methods, formatters, stats
src/components/expense/           # Dashboard, History, Analytics, TransactionForm
src/app/page.tsx                  # App shell: header, tabs, mobile bottom nav
```
