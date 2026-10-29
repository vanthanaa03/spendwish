"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, TrendingDown, TrendingUp, IndianRupee, NotebookPen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { categoriesFor, methodDef, PAYMENT_METHODS, todayISO, type PaymentMethod, type Transaction, type TransactionType } from "@/lib/expense";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Transaction | null;
}

interface FormState {
  type: TransactionType;
  amount: string;
  category: string;
  paymentMethod: PaymentMethod;
  description: string;
  date: string;
}

function freshForm(editing: Transaction | null): FormState {
  if (editing) {
    return {
      type: editing.type,
      amount: String(editing.amount),
      category: editing.category,
      paymentMethod: editing.paymentMethod,
      description: editing.description ?? "",
      date: editing.date.slice(0, 10),
    };
  }
  return { type: "EXPENSE", amount: "", category: "", paymentMethod: "UPI", description: "", date: todayISO() };
}

export function TransactionForm({ open, onOpenChange, editing }: TransactionFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto p-0 gap-0 rounded-t-3xl sm:rounded-3xl top-auto bottom-0 translate-y-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:max-w-lg">
        <FormBody key={`${open}-${editing?.id ?? "new"}`} editing={editing} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function FormBody({ editing, onDone }: { editing: Transaction | null; onDone: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(() => freshForm(editing));
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(() => categoriesFor(form.type), [form.type]);

  const mutation = useMutation({
    mutationFn: async (payload: FormState) => {
      const body = {
        type: payload.type,
        amount: Number(payload.amount),
        category: payload.category,
        description: payload.description,
        paymentMethod: payload.paymentMethod,
        date: new Date(`${payload.date}T12:00:00`).toISOString(),
      };
      const res = editing
        ? await fetch(`/api/transactions/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: editing ? "Transaction updated" : form.type === "INCOME" ? "Income recorded" : "Expense recorded",
        description: `${methodDef(form.paymentMethod).label} · ${form.category}`,
      });
      onDone();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const switchType = (type: TransactionType) => {
    if (form.type === type) return;
    setForm((f) => ({ ...f, type, category: "" }));
  };

  const submit = () => {
    setError(null);
    if (!form.amount || Number(form.amount) <= 0 || isNaN(Number(form.amount))) {
      setError("Please enter a valid amount greater than 0");
      return;
    }
    if (!form.category) {
      setError("Please pick a category");
      return;
    }
    if (!form.date) {
      setError("Please pick a date");
      return;
    }
    mutation.mutate(form);
  };

  return (
    <>
      <div className="p-5 pb-0 sm:p-6 sm:pb-0">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle>{editing ? "Edit transaction" : "Add transaction"}</DialogTitle>
          <DialogDescription>Record money coming in or going out.</DialogDescription>
        </DialogHeader>
      </div>

      <div className="space-y-5 p-5 pt-4 sm:p-6">
        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
          <button
            type="button"
            onClick={() => switchType("EXPENSE")}
            aria-pressed={form.type === "EXPENSE"}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all",
              form.type === "EXPENSE" ? "bg-rose-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <TrendingDown className="size-4" /> Expense
          </button>
          <button
            type="button"
            onClick={() => switchType("INCOME")}
            aria-pressed={form.type === "INCOME"}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all",
              form.type === "INCOME" ? "bg-emerald-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <TrendingUp className="size-4" /> Income
          </button>
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <IndianRupee className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="amount"
              inputMode="decimal"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="h-14 rounded-2xl pl-11 text-2xl font-bold"
              autoFocus={!editing}
            />
          </div>
        </div>

        {/* Payment method */}
        <div className="space-y-1.5">
          <Label>Paid via / Received via</Label>
          <div className="grid grid-cols-4 gap-2">
            {PAYMENT_METHODS.map((m) => {
              const Icon = m.icon;
              const active = form.paymentMethod === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, paymentMethod: m.value }))}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border-2 px-1 py-3 text-xs font-medium transition-all",
                    active ? "border-emerald-500 bg-emerald-50 text-foreground dark:bg-emerald-950/50" : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className={cn("size-5", active ? "text-emerald-600 dark:text-emerald-400" : "")} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label>Category</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const Icon = c.icon;
              const active = form.category === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: c.name }))}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-medium transition-all",
                    active ? "border-emerald-500 bg-emerald-50 text-foreground dark:bg-emerald-950/50" : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="size-3.5" />
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">
            <span className="inline-flex items-center gap-1.5">
              <NotebookPen className="size-3.5" /> Note <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
          </Label>
          <Input
            id="description"
            placeholder={form.type === "INCOME" ? "e.g. October salary" : "e.g. Lunch with team"}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="rounded-xl"
            maxLength={120}
          />
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={form.date} max={todayISO()} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="rounded-xl" />
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onDone} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={mutation.isPending} className={cn("flex-1 rounded-xl font-semibold text-white", form.type === "INCOME" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600")}>
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : editing ? "Save changes" : `Add ${form.type === "INCOME" ? "income" : "expense"}`}
          </Button>
        </div>
      </div>
    </>
  );
}
