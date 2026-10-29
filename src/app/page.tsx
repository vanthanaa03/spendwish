"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Providers } from "@/components/expense/providers";
import { Dashboard } from "@/components/expense/dashboard";
import { History } from "@/components/expense/history";
import { Analytics } from "@/components/expense/analytics";
import { TransactionForm } from "@/components/expense/transaction-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Home, History as HistoryIcon, Loader2, Plus, Wallet, Trash2 } from "lucide-react";
import { formatINR, sumBy, type Transaction } from "@/lib/expense";
import { cn } from "@/lib/utils";

type TabId = "home" | "history" | "analytics";

function ExpenseApp() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>("home");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await fetch("/api/transactions");
      if (!res.ok) throw new Error("Failed to load transactions");
      return res.json() as Promise<Transaction[]>;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to delete");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({ title: "Transaction deleted", description: deleteTarget ? `${formatINR(deleteTarget.amount)} · ${deleteTarget.category}` : undefined });
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast({ title: "Could not delete transaction", description: err.message, variant: "destructive" });
    },
  });

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditing(t);
    setFormOpen(true);
  };

  const balance = sumBy(transactions, (t) => t.type === "INCOME") - sumBy(transactions, (t) => t.type === "EXPENSE");

  const navItems: { id: TabId; label: string; icon: typeof Home }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "history", label: "History", icon: HistoryIcon },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-muted/40">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/40">
              <Wallet className="size-5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-tight">SpendWise</h1>
              <p className="text-[11px] text-muted-foreground">Daily expense tracker</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 rounded-2xl bg-muted p-1 md:flex" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  aria-current={tab === item.id ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                    tab === item.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[11px] text-muted-foreground">Balance</p>
              <p className={cn("text-sm font-bold tabular-nums", balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>{formatINR(balance)}</p>
            </div>
            <Button onClick={openAdd} className="hidden rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 md:inline-flex">
              <Plus className="size-4" /> Add
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-4 sm:pt-6 md:pb-12" role="main">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : (
          <>
            <div className={cn(tab === "home" ? "block" : "hidden")}>
              <Dashboard transactions={transactions} loading={isLoading} onAddNew={openAdd} onEdit={openEdit} onDelete={setDeleteTarget} onViewAll={() => setTab("history")} />
            </div>
            <div className={cn(tab === "history" ? "block" : "hidden")}>
              <History transactions={transactions} loading={isLoading} onEdit={openEdit} onDelete={setDeleteTarget} />
            </div>
            <div className={cn(tab === "analytics" ? "block" : "hidden")}>
              <Analytics transactions={transactions} loading={isLoading} />
            </div>
          </>
        )}
      </main>

      {/* Desktop FAB (kept for quick access) */}
      <Button onClick={openAdd} size="icon" aria-label="Add transaction" className="fixed bottom-6 right-6 z-40 hidden size-14 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 hover:bg-emerald-600 md:flex">
        <Plus className="size-6" />
      </Button>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur-md md:hidden" aria-label="Mobile navigation" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="relative mx-auto grid max-w-md grid-cols-4 px-2">
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button key={item.id} type="button" onClick={() => setTab(item.id)} aria-current={active ? "page" : undefined} className={cn("flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors", active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                <Icon className={cn("size-5", active && "stroke-[2.5]")} />
                {item.label}
              </button>
            );
          })}
          {/* Center spacer for add button */}
          <div aria-hidden className="min-h-[56px]" />
          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button key={item.id} type="button" onClick={() => setTab(item.id)} aria-current={active ? "page" : undefined} className={cn("flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors", active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                <Icon className={cn("size-5", active && "stroke-[2.5]")} />
                {item.label}
              </button>
            );
          })}
          {/* Center add button */}
          <button
            type="button"
            onClick={openAdd}
            aria-label="Add transaction"
            className="absolute -top-6 left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 ring-4 ring-background transition-transform active:scale-95"
          >
            <Plus className="size-7" />
          </button>
        </div>
      </nav>

      {/* Add / Edit form */}
      <TransactionForm open={formOpen} onOpenChange={setFormOpen} editing={editing} />

      {/* Delete confirmation */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="size-5 text-destructive" /> Delete this transaction?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  {deleteTarget.type === "INCOME" ? "Income" : "Expense"} of <span className="font-semibold text-foreground">{formatINR(deleteTarget.amount)}</span> · {deleteTarget.category}
                  {deleteTarget.description ? ` — "${deleteTarget.description}"` : ""} will be permanently removed.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending} className="rounded-xl bg-destructive text-white hover:bg-destructive/90">
              {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function Page() {
  return (
    <Providers>
      <ExpenseApp />
    </Providers>
  );
}
