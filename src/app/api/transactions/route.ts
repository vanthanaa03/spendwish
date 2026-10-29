import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const VALID_TYPES = ["INCOME", "EXPENSE"];
const VALID_METHODS = ["CASH", "UPI", "CARD", "BANK"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const method = searchParams.get("method");
    const category = searchParams.get("category");

    const where: Record<string, string> = {};
    if (type && VALID_TYPES.includes(type)) where.type = type;
    if (method && VALID_METHODS.includes(method)) where.paymentMethod = method;
    if (category) where.category = category;

    const transactions = await db.transaction.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const transaction = await db.transaction.create({
      data: {
        type,
        amount: Math.round(amountNum * 100) / 100,
        category: category.trim(),
        description: typeof description === "string" && description.trim().length > 0 ? description.trim() : null,
        paymentMethod,
        date: parsedDate,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
