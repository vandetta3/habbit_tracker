"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { db } from "@/lib/instant";
import { useToast } from "@/components/ui/toast";
import {
  formatCurrency,
  getSpendingHealthMetrics,
  calculateTotalSpend,
} from "@/lib/expenses";
import { getLastNDays } from "@/lib/date-utils";
import { ExpenseListView } from "@/components/expenses/ExpenseListView";
import { ExpenseCategoryView } from "@/components/expenses/ExpenseCategoryView";
import type { Expense } from "@/types";

type ViewMode = "list" | "category";

export default function ExpensesPage() {
  const { addToast } = useToast();
  const { user } = db.useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">("month");

  // Query expenses - filtered by current user and non-deleted
  const { data, isLoading } = db.useQuery({
    expenses: {
      $: {
        where: {
          user: user?.id || "",
        },
      },
    },
  });

  const allExpenses = (data?.expenses || []) as unknown as Expense[];
  
  // Filter out soft-deleted expenses
  const expenses = allExpenses.filter((e) => !e.deletedAt);

  // Calculate metrics based on selected period
  const periodDays = selectedPeriod === "week" ? 7 : 30;
  const periodExpenses = expenses.filter((e) => {
    const lastNDays = getLastNDays(periodDays);
    return lastNDays.includes(e.date);
  });

  const metrics = getSpendingHealthMetrics(periodExpenses);
  const totalSpendWeek = calculateTotalSpend(
    expenses.filter((e) => getLastNDays(7).includes(e.date))
  );
  const totalSpendMonth = calculateTotalSpend(
    expenses.filter((e) => getLastNDays(30).includes(e.date))
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground">Loading your expenses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track and analyze your spending</p>
        </div>
        <Link href="/expenses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant={selectedPeriod === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("week")}
          >
            This Week
          </Button>
          <Button
            variant={selectedPeriod === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("month")}
          >
            This Month
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Spent ({selectedPeriod === "week" ? "Week" : "Month"})
              </CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalSpend)}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {formatCurrency(Math.round(metrics.avgDailySpend))}/day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Necessary Spending</CardTitle>
              <span className="text-2xl">✅</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.necessaryPercentage}%</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(metrics.necessarySpend)} of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wasteful Spending</CardTitle>
              <span className="text-2xl">
                {metrics.wastefulPercentage > 15 ? "⚠️" : "✨"}
              </span>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metrics.wastefulPercentage > 15 ? "text-red-500" : ""}`}>
                {metrics.wastefulPercentage}%
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(metrics.wastefulSpend)}
                {metrics.wastefulPercentage > 15 && " - High!"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Potential</CardTitle>
              <span className="text-2xl">🎯</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(metrics.savingsOpportunity)}
              </div>
              <p className="text-xs text-muted-foreground">Potential monthly savings</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weekly/Monthly Report Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Spent</span>
                <span className="font-semibold">{formatCurrency(totalSpendWeek)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Daily Average</span>
                <span className="font-semibold">
                  {formatCurrency(Math.round(totalSpendWeek / 7))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Spent</span>
                <span className="font-semibold">{formatCurrency(totalSpendMonth)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Daily Average</span>
                <span className="font-semibold">
                  {formatCurrency(Math.round(totalSpendMonth / 30))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {expenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 text-6xl">💰</div>
            <h3 className="mb-2 text-lg font-semibold">No expenses yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Start tracking your expenses to gain insights into your spending patterns.
            </p>
            <Link href="/expenses/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Expense
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* View Switcher */}
          <div className="flex items-center gap-2 border-b">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 font-medium transition-colors ${
                viewMode === "list"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("category")}
              className={`px-4 py-2 font-medium transition-colors ${
                viewMode === "category"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Category View
            </button>
          </div>

          {/* View Content */}
          {viewMode === "list" && <ExpenseListView expenses={expenses} />}
          {viewMode === "category" && <ExpenseCategoryView expenses={expenses} />}
        </>
      )}

      {/* Link to Analytics */}
      {expenses.length > 0 && (
        <Link href="/expenses/analytics">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                📊 View Detailed Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get deeper insights into your spending patterns, behavioral trends, and smart comparisons
              </p>
            </CardContent>
          </Card>
        </Link>
      )}
    </div>
  );
}
