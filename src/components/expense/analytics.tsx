"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from "recharts";
import { BarChart3, ChartPie, CalendarRange, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { buildDailyTrend, buildMonthlyTrend, categoryDef, formatCompact, formatINR, groupSum, sumBy, type Transaction } from "@/lib/expense";

const PIE_COLORS = ["#10b981", "#f59e0b", "#8b5cf6", "#14b8a6", "#ec4899", "#84cc16", "#06b6d4", "#f97316", "#a855f7", "#eab308", "#78716c"];

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid rgba(0,0,0,0.08)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  fontSize: "12px",
  padding: "8px 12px",
} as const;

interface AnalyticsProps {
  transactions: Transaction[];
  loading: boolean;
}

export function Analytics({ transactions, loading }: AnalyticsProps) {
  const monthly = useMemo(() => buildMonthlyTrend(transactions, 6), [transactions]);
  const daily = useMemo(() => buildDailyTrend(transactions, 30), [transactions]);

  const categoryData = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "EXPENSE");
    return groupSum(expenses, (t) => t.category).slice(0, 8);
  }, [transactions]);

  const methodData = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "EXPENSE");
    return groupSum(expenses, (t) => t.paymentMethod).map((d) => ({ ...d, label: d.name }));
  }, [transactions]);

  const methodLabel = (v: string) => {
    const labels: Record<string, string> = { CASH: "Cash", UPI: "UPI", CARD: "Card", BANK: "Bank Transfer" };
    return labels[v] ?? v;
  };

  const topCategory = categoryData[0];
  const monthExpense = sumBy(transactions, (t) => t.type === "EXPENSE");
  const avgDaily = daily.length > 0 ? monthExpense / 30 : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-72 rounded-3xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      </div>
    );
  }

  const hasData = transactions.length > 0;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="rounded-3xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total spent</p>
            <p className="mt-1 text-lg font-bold tabular-nums">{formatINR(monthExpense)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg. per day (30d)</p>
            <p className="mt-1 text-lg font-bold tabular-nums">{formatINR(avgDaily)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Top category</p>
            <p className="mt-1 truncate text-lg font-bold">{topCategory ? topCategory.name : "—"}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Top mode of payment</p>
            <p className="mt-1 truncate text-lg font-bold">{methodData[0] ? methodLabel(methodData[0].name) : "—"}</p>
          </CardContent>
        </Card>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <BarChart3 className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No data to analyze yet</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Add a few transactions to see charts and insights</p>
          </div>
        </div>
      ) : (
        <>
          {/* 6-month income vs expense */}
          <Card className="rounded-3xl">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarRange className="size-4 text-emerald-600" />
                Income vs expense — last 6 months
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-64 w-full sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v: number) => formatCompact(v)} width={58} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatINR(Number(value))} cursor={{ fill: "rgba(128,128,128,0.08)" }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Daily spend area */}
            <Card className="rounded-3xl">
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="size-4 text-emerald-600" />
                  Daily flow — last 30 days
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={daily} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={10} interval={6} />
                      <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v: number) => formatCompact(v)} width={58} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatINR(Number(value))} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                      <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" />
                      <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2} fill="url(#expenseGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category donut */}
            <Card className="rounded-3xl">
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ChartPie className="size-4 text-emerald-600" />
                  Spending by category
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                {categoryData.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">No expenses recorded yet</p>
                ) : (
                  <>
                    <div className="h-52 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="85%" paddingAngle={3} strokeWidth={0}>
                            {categoryData.map((entry, i) => (
                              <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [formatINR(Number(value)), categoryDef("EXPENSE", String(name)).name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-1 space-y-1.5">
                      {categoryData.slice(0, 5).map((d, i) => (
                        <div key={d.name} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <span className="size-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            {d.name}
                          </span>
                          <span className="font-semibold tabular-nums">{formatINR(d.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment mode split */}
          <Card className="rounded-3xl">
            <CardHeader className="pb-0">
              <CardTitle className="text-base">Where did the money go? — by payment mode</CardTitle>
              <p className="text-xs text-muted-foreground">Total debits split across Cash, UPI, Card and Bank transfer</p>
            </CardHeader>
            <CardContent className="pt-4">
              {methodData.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No expenses recorded yet</p>
              ) : (
                <div className="h-48 w-full sm:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={methodData} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(128,128,128,0.2)" />
                      <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v: number) => formatCompact(v)} />
                      <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={12} width={44} tickFormatter={(v: string) => methodLabel(v)} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatINR(Number(value)), "Spent"]} cursor={{ fill: "rgba(128,128,128,0.08)" }} />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={30}>
                        {methodData.map((entry, i) => (
                          <Cell key={entry.name} fill={["#10b981", "#8b5cf6", "#f59e0b", "#06b6d4"][i % 4]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insights footer */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/40">
              <ArrowDownLeft className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <p className="text-sm text-emerald-900 dark:text-emerald-200">
                <span className="font-semibold">Money in:</span> across all time, {formatINR(sumBy(transactions, (t) => t.type === "INCOME"))} has been credited to your accounts.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-rose-50 p-4 dark:bg-rose-950/40">
              <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-rose-600" />
              <p className="text-sm text-rose-900 dark:text-rose-200">
                <span className="font-semibold">Money out:</span> {formatINR(monthExpense)} has been debited so far — review categories above to spot savings.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
