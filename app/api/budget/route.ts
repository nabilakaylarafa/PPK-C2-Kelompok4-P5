import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { BudgetStatus, BudgetSummaryResponse } from "@/lib/types";

// GET /api/budget?month=10&year=2026
// Returns budget amount, total expenses in that month, remaining budget, and status indicator
export async function GET(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const now = new Date();
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    const targetMonth = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;
    const targetYear = yearParam ? parseInt(yearParam, 10) : now.getFullYear();

    if (isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) {
      return NextResponse.json(
        { error: "Invalid month. Month must be between 1 and 12" },
        { status: 400 }
      );
    }

    if (isNaN(targetYear) || targetYear < 2000 || targetYear > 2100) {
      return NextResponse.json(
        { error: "Invalid year. Year must be between 2000 and 2100" },
        { status: 400 }
      );
    }

    // 1. Fetch user's budget record for the selected month and year
    const budgetRecord = await prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId: session.id,
          month: targetMonth,
          year: targetYear,
        },
      },
    });

    // 2. Compute total expenses in the selected month & year (UTC bounds)
    const startDate = new Date(Date.UTC(targetYear, targetMonth - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59, 999));

    const expenseTransactions = await prisma.transaction.findMany({
      where: {
        userId: session.id,
        type: "expense",
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
      },
    });

    const totalExpense = expenseTransactions.reduce((acc, tx) => acc + tx.amount, 0);
    const budgetAmount = budgetRecord ? budgetRecord.amount : 0;
    const remainingBudget = budgetAmount - totalExpense;

    let percentage = 0;
    if (budgetAmount > 0) {
      percentage = Math.round((totalExpense / budgetAmount) * 1000) / 10; // 1 decimal place
    }

    let status: BudgetStatus = "SAFE";
    if (budgetAmount > 0) {
      if (percentage >= 100) {
        status = "EXCEEDED";
      } else if (percentage >= 70) {
        status = "WARNING";
      } else {
        status = "SAFE";
      }
    }

    const responseData: BudgetSummaryResponse = {
      budget: budgetAmount,
      totalExpense,
      remainingBudget,
      percentage,
      status,
      month: targetMonth,
      year: targetYear,
      hasBudget: !!budgetRecord,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching budget summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget summary" },
      { status: 500 }
    );
  }
}

// POST /api/budget
// Set or update monthly budget for the authenticated user
export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const { month, year, amount } = body;

    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return NextResponse.json(
        { error: "Invalid month. Month must be between 1 and 12" },
        { status: 400 }
      );
    }

    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      return NextResponse.json(
        { error: "Invalid year. Year must be between 2000 and 2100" },
        { status: 400 }
      );
    }

    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json(
        { error: "Budget amount must be a positive number" },
        { status: 400 }
      );
    }

    // Upsert budget (Insert if not exists, Update if already exists)
    const budget = await prisma.budget.upsert({
      where: {
        userId_month_year: {
          userId: session.id,
          month: parsedMonth,
          year: parsedYear,
        },
      },
      update: {
        amount: parsedAmount,
      },
      create: {
        userId: session.id,
        month: parsedMonth,
        year: parsedYear,
        amount: parsedAmount,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Monthly budget successfully saved",
        budget,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error saving budget:", error);
    return NextResponse.json(
      { error: "Failed to save monthly budget" },
      { status: 500 }
    );
  }
}

