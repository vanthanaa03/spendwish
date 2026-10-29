"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TransactionRow } from "./transaction-row";
import { ArrowDownLeft, ArrowUpRight, Wallet, PiggyBank, Plus, Percent } from "lucide-react";
import { formatINR, methodDef, PAYMENT_METHODS, sumBy, type Transaction } from "@/lib/expense";
import { cn } from "@/lib/utils";

interface DashboardProps {
  transactions: Transaction[];
  loading: boolean;
  onAddNew: () => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  onViewAll: () => void;
}

export function Dashboard({ transactions, loading, onAddNew, onEdit, onDelete, onViewAll }: DashboardProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthTx = transactions.filter((t) => t.date.slice(0, 7) === monthPrefix);

    const totalIncome = sumBy(transactions, (t) => t.type === "INCOME");
    const totalExpense = sumBy(transactions, (t) => t.type === "EXPENSE");
    const monthIncome = sumBy(monthTx, (t) => t.type === "INCOME");
    const monthExpense = sumBy(monthTx, (t) => t.type === "EXPENSE");

    const byMethod = PAYMENT_METHODS.map((m) => ({
      ...m,
      inflow: sumBy(monthTx, (t) => t.paymentMethod === m.value && t.type === "INCOME"),
      outflow: sumBy(monthTx, (t) => t.paymentMethod === m.value && t.type === "EXPENSE"),
    }));

    const savingsRate = monthIncome > 0 ? Math.max(0, Math.round(((monthIncome - monthExpense) / monthIncome) * 100)) : 0;

    return { totalIncome, totalExpense, monthIncome, monthExpense, byMethod, savingsRate, txCount: transactions.length };
  }, [transactions]);

  const balance = stats.totalIncome - stats.totalExpense;
  const recent = transactions.slice(0, 6);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-44 rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
        </div>
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Balance hero */}
      <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/20">
        <CardContent className="p-5 sm:p-7">
          <div className="flex items-center gap-2 text-emerald-100">
            <Wallet className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total balance</span>
          </div>
          <p className="mt-2 text-4xl font-bold tabular-nums sm:text-5xl">{formatINR(balance)}</p>
          <p className="mt-1 text-sm text-emerald-100/90">
            {stats.txCount} transaction{stats.txCount === 1 ? "" : "s"} recorded
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-xs text-emerald-50">
                <ArrowDownLeft className="size-3.5" /> Money In
              </div>
              <p className="mt-1 text-lg font-bold tabular-nums sm:text-xl">{formatINR(stats.totalIncome)}</p>
            </div>
            <div className="rounded-2xl bg-black/15 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-xs text-emerald-50">
                <ArrowUpRight className="size-3.5" /> Money Out
              </div>
              <p className="mt-1 text-lg font-bold tabular-nums sm:text-xl">{formatINR(stats.totalExpense)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* This month */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-3xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex size-6 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                <ArrowDownLeft className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              </span>
              Income this month
            </div>
            <p className="mt-2 text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{formatINR(stats.monthIncome)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex size-6 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950">
                <ArrowUpRight className="size-3.5 text-rose-600 dark:text-rose-400" />
              </span>
              Spent this month
            </div>
            <p className="mt-2 text-xl font-bold tabular-nums text-rose-600 dark:text-rose-400">{formatINR(stats.monthExpense)}</p>
          </CardContent>
        </Card>
      </div>

      {/* How money moved — payment method breakdown */}
      <Card className="rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Percent className="size-4 text-emerald-600" />
            This month by payment mode
          </CardTitle>
          <p className="text-xs text-muted-foreground">How your cash was credited and debited</p>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {stats.byMethod.map((m) => {
            const Icon = m.icon;
            const net = m.inflow - m.outflow;
            return (
              <div key={m.value} className="rounded-2xl bg-muted/60 p-3">
                <div className="flex items-center gap-1.5">
                  <span className={cn("flex size-6 items-center justify-center rounded-lg", m.classes)}>
                    <Icon className="size-3.5" />
                  </span>
                  <span className="text-xs font-medium">{m.label}</span>
                </div>
                <p className={cn("mt-2 text-sm font-bold tabular-nums", net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                  {net >= 0 ? "+" : "−"}
                  {formatINR(Math.abs(net))}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                  ↑{formatINR(m.inflow)} · ↓{formatINR(m.outflow)}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent transactions */}
      <Card className="rounded-3xl">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <PiggyBank className="size-4 text-emerald-600" />
            Recent activity
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400" onClick={onViewAll}>
            View all
          </Button>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <Wallet className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No transactions yet</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Start tracking your income & expenses</p>
              </div>
              <Button onClick={onAddNew} className="rounded-xl bg-emerald-500 text-white hover:bg-emerald-600">
                <Plus className="size-4" /> Add first transaction
              </Button>
            </div>
          ) : (
            <div className="space-y-0.5">
              {recent.map((t) => (
                <TransactionRow key={t.id} transaction={t} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
