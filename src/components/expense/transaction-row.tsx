"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { categoryDef, formatINR, formatTime, methodDef, type Transaction } from "@/lib/expense";
import { cn } from "@/lib/utils";

interface TransactionRowProps {
  transaction: Transaction;
  onEdit?: (t: Transaction) => void;
  onDelete?: (t: Transaction) => void;
}

export function TransactionRow({ transaction, onEdit, onDelete }: TransactionRowProps) {
  const isIncome = transaction.type === "INCOME";
  const cat = categoryDef(transaction.type, transaction.category);
  const CatIcon = cat.icon;
  const method = methodDef(transaction.paymentMethod);
  const MethodIcon = method.icon;

  return (
    <div className="group flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-muted/60">
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", cat.classes)}>
        <CatIcon className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{transaction.description || transaction.category}</p>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MethodIcon className="size-3" />
            {method.label}
          </span>
          <span aria-hidden>·</span>
          <span>{transaction.category}</span>
          <span aria-hidden className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">{formatTime(transaction.date)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <span className={cn("flex items-center gap-0.5 text-sm font-bold tabular-nums sm:text-base", isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
          {isIncome ? <ArrowDownLeft className="size-4" aria-label="credited" /> : <ArrowUpRight className="size-4" aria-label="debited" />}
          {formatINR(transaction.amount)}
        </span>
        {onEdit && (
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100" onClick={() => onEdit(transaction)} aria-label={`Edit ${transaction.description || transaction.category}`}>
            <Pencil className="size-3.5" />
          </Button>
        )}
        {onDelete && (
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive opacity-100 sm:opacity-0 sm:group-hover:opacity-100" onClick={() => onDelete(transaction)} aria-label={`Delete ${transaction.description || transaction.category}`}>
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function MethodBadge({ value }: { value: string }) {
  const method = methodDef(value);
  const Icon = method.icon;
  return (
    <Badge variant="secondary" className="gap-1">
      <Icon className="size-3" />
      {method.label}
    </Badge>
  );
}
