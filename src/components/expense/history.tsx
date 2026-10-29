"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TransactionRow } from "./transaction-row";
import { Search, SlidersHorizontal, Wallet, X } from "lucide-react";
import { formatDateLabel, formatINR, PAYMENT_METHODS, sumBy, type PaymentMethod, type Transaction, type TransactionType } from "@/lib/expense";
import { cn } from "@/lib/utils";

interface HistoryProps {
  transactions: Transaction[];
  loading: boolean;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}

type TypeFilter = "ALL" | TransactionType;

export function History({ transactions, loading, onEdit, onDelete }: HistoryProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "ALL">("ALL");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (typeFilter !== "ALL" && t.type !== typeFilter) return false;
      if (methodFilter !== "ALL" && t.paymentMethod !== methodFilter) return false;
      if (q) {
        const haystack = `${t.description ?? ""} ${t.category} ${PAYMENT_METHODS.find((m) => m.value === t.paymentMethod)?.label ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
        // also match plain amount search
        if (!haystack.includes(q) && !String(t.amount).includes(q)) return false;
      }
      return true;
    });
  }, [transactions, query, typeFilter, methodFilter]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Transaction[]>();
    for (const t of filtered) {
      const key = t.date.slice(0, 10);
      const list = groups.get(key) ?? [];
      list.push(t);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  const totals = useMemo(() => {
    return {
      income: sumBy(filtered, (t) => t.type === "INCOME"),
      expense: sumBy(filtered, (t) => t.type === "EXPENSE"),
    };
  }, [filtered]);

  const hasFilters = typeFilter !== "ALL" || methodFilter !== "ALL" || query.trim() !== "";

  const resetFilters = () => {
    setQuery("");
    setTypeFilter("ALL");
    setMethodFilter("ALL");
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 rounded-3xl" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes, category, amount…" className="rounded-2xl pl-9" aria-label="Search transactions" />
        </div>
        <Button variant={showFilters ? "default" : "outline"} size="icon" className={cn("size-11 shrink-0 rounded-2xl", showFilters && "bg-emerald-500 text-white hover:bg-emerald-600")} onClick={() => setShowFilters((s) => !s)} aria-label="Toggle filters">
          <SlidersHorizontal className="size-4" />
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <Card className="rounded-3xl">
          <CardContent className="space-y-4 p-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Type</p>
              <div className="flex flex-wrap gap-2">
                {(["ALL", "INCOME", "EXPENSE"] as TypeFilter[]).map((tf) => (
                  <button key={tf} type="button" onClick={() => setTypeFilter(tf)} aria-pressed={typeFilter === tf} className={cn("rounded-full border-2 px-3.5 py-1.5 text-xs font-semibold capitalize transition-all", typeFilter === tf ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted")}>
                    {tf === "ALL" ? "All" : tf === "INCOME" ? "Income" : "Expense"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Payment mode</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setMethodFilter("ALL")} aria-pressed={methodFilter === "ALL"} className={cn("rounded-full border-2 px-3.5 py-1.5 text-xs font-semibold transition-all", methodFilter === "ALL" ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted")}>
                  All modes
                </button>
                {PAYMENT_METHODS.map((m) => (
                  <button key={m.value} type="button" onClick={() => setMethodFilter(m.value)} aria-pressed={methodFilter === m.value} className={cn("rounded-full border-2 px-3.5 py-1.5 text-xs font-semibold transition-all", methodFilter === m.value ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted")}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-muted-foreground">
                <X className="size-3.5" /> Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary of filtered results */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-2.5 text-xs">
          <span className="font-medium text-muted-foreground">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </span>
          <span className="flex gap-3 font-semibold tabular-nums">
            <span className="text-emerald-600 dark:text-emerald-400">+{formatINR(totals.income)}</span>
            <span className="text-rose-600 dark:text-rose-400">−{formatINR(totals.expense)}</span>
          </span>
        </div>
      )}

      {/* Grouped list */}
      {grouped.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Wallet className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{hasFilters ? "No matching transactions" : "No transactions yet"}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{hasFilters ? "Try changing your search or filters" : "Recorded income & expenses will show up here"}</p>
          </div>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={resetFilters} className="rounded-xl">
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([day, items]) => {
            const dayIn = sumBy(items, (t) => t.type === "INCOME");
            const dayOut = sumBy(items, (t) => t.type === "EXPENSE");
            return (
              <div key={day}>
                <div className="mb-1 flex items-center justify-between px-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{formatDateLabel(day)}</h3>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {dayIn > 0 && <span className="text-emerald-600 dark:text-emerald-400">+{formatINR(dayIn)}</span>}
                    {dayIn > 0 && dayOut > 0 && " · "}
                    {dayOut > 0 && <span className="text-rose-600 dark:text-rose-400">−{formatINR(dayOut)}</span>}
                  </p>
                </div>
                <Card className="rounded-3xl py-1">
                  <CardContent className="p-1.5 sm:p-2">
                    {items.map((t) => (
                      <TransactionRow key={t.id} transaction={t} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
