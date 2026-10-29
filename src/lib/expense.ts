import { Briefcase, Building2, TrendingUp, Gift, MoreHorizontal, Utensils, ShoppingBasket, Bus, ShoppingBag, Receipt, HomeIcon, Film, HeartPulse, GraduationCap, Plane, Banknote, Smartphone, CreditCard, Landmark, type LucideIcon } from "lucide-react";

/* ---------------- Types ---------------- */

export type TransactionType = "INCOME" | "EXPENSE";
export type PaymentMethod = "CASH" | "UPI" | "CARD" | "BANK";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
  paymentMethod: PaymentMethod;
  date: string;
  createdAt: string;
  updatedAt: string;
}

/* ---------------- Categories ---------------- */

export interface CategoryDef {
  name: string;
  icon: LucideIcon;
  classes: string; // tailwind classes for the icon chip
}

export const INCOME_CATEGORIES: CategoryDef[] = [
  { name: "Salary", icon: Briefcase, classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  { name: "Business", icon: Building2, classes: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400" },
  { name: "Investment", icon: TrendingUp, classes: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-400" },
  { name: "Gift", icon: Gift, classes: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  { name: "Other", icon: MoreHorizontal, classes: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300" },
];

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { name: "Food & Dining", icon: Utensils, classes: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" },
  { name: "Groceries", icon: ShoppingBasket, classes: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-400" },
  { name: "Transport", icon: Bus, classes: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400" },
  { name: "Shopping", icon: ShoppingBag, classes: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400" },
  { name: "Bills & Utilities", icon: Receipt, classes: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  { name: "Rent", icon: HomeIcon, classes: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400" },
  { name: "Entertainment", icon: Film, classes: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-400" },
  { name: "Health", icon: HeartPulse, classes: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400" },
  { name: "Education", icon: GraduationCap, classes: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400" },
  { name: "Travel", icon: Plane, classes: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400" },
  { name: "Other", icon: MoreHorizontal, classes: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300" },
];

export function categoriesFor(type: TransactionType): CategoryDef[] {
  return type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function categoryDef(type: TransactionType, name: string): CategoryDef {
  const list = categoriesFor(type);
  return list.find((c) => c.name === name) ?? list[list.length - 1];
}

/* ---------------- Payment methods ---------------- */

export interface MethodDef {
  value: PaymentMethod;
  label: string;
  icon: LucideIcon;
  classes: string;
  /** flow wording: how money moved */
  credit: string;
  debit: string;
}

export const PAYMENT_METHODS: MethodDef[] = [
  { value: "CASH", label: "Cash", icon: Banknote, classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400", credit: "Cash received", debit: "Paid in cash" },
  { value: "UPI", label: "UPI", icon: Smartphone, classes: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400", credit: "Credited via UPI", debit: "Paid via UPI" },
  { value: "CARD", label: "Card", icon: CreditCard, classes: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400", credit: "Credited to card", debit: "Paid by card" },
  { value: "BANK", label: "Bank Transfer", icon: Landmark, classes: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400", credit: "Bank account credited", debit: "Bank transfer sent" },
];

export function methodDef(value: string): MethodDef {
  return PAYMENT_METHODS.find((m) => m.value === value) ?? PAYMENT_METHODS[0];
}

/* ---------------- Formatters ---------------- */

const baseFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const paiseFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export function formatINR(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const hasPaise = Math.round(rounded * 100) % 100 !== 0;
  return hasPaise ? paiseFormatter.format(rounded) : baseFormatter.format(rounded);
}

export function formatCompact(amount: number): string {
  if (Math.abs(amount) >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (Math.abs(amount) >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (Math.abs(amount) >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

export function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60 * 1000).toISOString().slice(0, 10);
}

export function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  const yestStr = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, "0")}-${String(yest.getDate()).padStart(2, "0")}`;
  if (iso.slice(0, 10) === todayStr) return "Today";
  if (iso.slice(0, 10) === yestStr) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

/* ---------------- Client-side stats ---------------- */

export interface DayBucket {
  day: string; // yyyy-mm-dd
  label: string; // e.g. "12 Oct"
  income: number;
  expense: number;
}

export function buildDailyTrend(transactions: Transaction[], days: number): DayBucket[] {
  const buckets: DayBucket[] = [];
  const map = new Map<string, DayBucket>();
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const bucket = { day: key, label, income: 0, expense: 0 };
    buckets.push(bucket);
    map.set(key, bucket);
  }
  for (const t of transactions) {
    const b = map.get(t.date.slice(0, 10));
    if (!b) continue;
    if (t.type === "INCOME") b.income += t.amount;
    else b.expense += t.amount;
  }
  return buckets;
}

export interface MonthBucket {
  month: string; // yyyy-mm
  label: string; // e.g. "Aug"
  income: number;
  expense: number;
}

export function buildMonthlyTrend(transactions: Transaction[], months: number): MonthBucket[] {
  const buckets: MonthBucket[] = [];
  const map = new Map<string, MonthBucket>();
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-IN", { month: "short" });
    const bucket = { month: key, label, income: 0, expense: 0 };
    buckets.push(bucket);
    map.set(key, bucket);
  }
  for (const t of transactions) {
    const b = map.get(t.date.slice(0, 7));
    if (!b) continue;
    if (t.type === "INCOME") b.income += t.amount;
    else b.expense += t.amount;
  }
  return buckets;
}

export function sumBy(transactions: Transaction[], predicate: (t: Transaction) => boolean): number {
  return transactions.filter(predicate).reduce((acc, t) => acc + t.amount, 0);
}

export function groupSum(transactions: Transaction[], keyFn: (t: Transaction) => string): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const t of transactions) {
    const k = keyFn(t);
    map.set(k, (map.get(k) ?? 0) + t.amount);
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
