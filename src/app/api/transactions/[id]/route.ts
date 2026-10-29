import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const VALID_TYPES = ["INCOME", "EXPENSE"];
const VALID_METHODS = ["CASH", "UPI", "CARD", "BANK"];

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { type, amount, category, description, paymentMethod, date } = body ?? {};

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "type must be INCOME or EXPENSE" }, { status: 400 });
    }
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 });
    }
    if (!category || typeof category !== "string" || category.trim().length === 0) {
      return NextResponse.json({ error: "category is required" }, { status: 400 });
    }
    if (!VALID_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ error: "paymentMethod must be CASH, UPI, CARD or BANK" }, { status: 400 });
    }

    let parsedDate = new Date();
    if (date) {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: "date is invalid" }, { status: 400 });
      }
    }

    const existing = await db.transaction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const transaction = await db.transaction.update({
      where: { id },
      data: {
        type,
        amount: Math.round(amountNum * 100) / 100,
        category: category.trim(),
        description: typeof description === "string" && description.trim().length > 0 ? description.trim() : null,
        paymentMethod,
        date: parsedDate,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("PUT /api/transactions/[id] error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.transaction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    await db.transaction.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/transactions/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
