"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { db } from "@/lib/instant";
import {
  formatCurrency,
  getSpendingHealthMetrics,
  generateInsights,
  getTopWasteCategories,
  getEmotionDrivenExpenses,
  getSpendByCategory,
  compareMonths,
  compareWeekdayVsWeekend,
  getPaymentModeBreakdown,
} from "@/lib/expenses";
import { getLastNDays } from "@/lib/date-utils";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Expense } from "@/types";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function ExpenseAnalyticsPage() {
  const { user } = db.useAuth();

  // Query expenses
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
  const expenses = allExpenses.filter((e) => !e.deletedAt);

  // Get last 30 days expenses for most analytics
  const last30Days = getLastNDays(30);
  const recentExpenses = expenses.filter((e) => last30Days.includes(e.date));

  // Calculate metrics
  const metrics = getSpendingHealthMetrics(recentExpenses);
  const insights = generateInsights(recentExpenses);
  const topWasteCategories = getTopWasteCategories(recentExpenses, 5);
  const emotionBreakdown = getEmotionDrivenExpenses(recentExpenses);
  const categorySpending = getSpendByCategory(recentExpenses);
  const monthComparison = compareMonths(expenses);
  const weekdayWeekendComparison = compareWeekdayVsWeekend(recentExpenses);
  const paymentModeBreakdown = getPaymentModeBreakdown(recentExpenses);

  // Prepare chart data
  const necessaryVsNonNecessaryData = [
    { name: "Necessary", value: metrics.necessarySpend, percentage: metrics.necessaryPercentage },
    { name: "Non-Necessary", value: metrics.nonNecessarySpend, percentage: 100 - metrics.necessaryPercentage },
  ];

  const categoryChartData = categorySpending.slice(0, 8).map((cat) => ({
    name: cat.category.length > 15 ? cat.category.substring(0, 12) + "..." : cat.category,
    amount: cat.total / 100,
  }));

  const emotionChartData = Object.entries(emotionBreakdown)
    .filter(([, data]) => data.count > 0)
    .map(([emotion, data]) => ({
      name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      count: data.count,
      amount: data.total / 100,
    }));

  const paymentModeChartData = Object.entries(paymentModeBreakdown)
    .filter(([, data]) => data.count > 0)
    .map(([mode, data]) => ({
      name: mode,
      amount: data.total / 100,
      count: data.count,
    }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/expenses">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/expenses">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 text-6xl">📊</div>
            <h3 className="mb-2 text-lg font-semibold">No data yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Add some expenses to see analytics and insights
            </p>
            <Link href="/expenses/new">
              <Button>Add Your First Expense</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/expenses">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your spending patterns</p>
        </div>
      </div>

      {/* A. Spending Health */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Spending Health (Last 30 Days)</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
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
                {formatCurrency(metrics.necessarySpend)}
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
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Opportunity</CardTitle>
              <span className="text-2xl">🎯</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(metrics.savingsOpportunity)}
              </div>
              <p className="text-xs text-muted-foreground">Potential savings</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Necessary vs Non-Necessary Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Necessary vs Non-Necessary Spending</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={necessaryVsNonNecessaryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${entry.percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {necessaryVsNonNecessaryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#f59e0b"} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* B. Behavioral Insights */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Behavioral Insights</h2>
        
        {/* Insights Cards */}
        {insights.length > 0 && (
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            {insights.map((insight, index) => (
              <Card key={index} className={`border-l-4 ${
                insight.type === "warning" ? "border-red-500" :
                insight.type === "success" ? "border-green-500" :
                "border-blue-500"
              }`}>
                <CardContent className="pt-6">
                  <p className="text-sm">{insight.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Top Waste Categories */}
        {topWasteCategories.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Top Wasteful Spending Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topWasteCategories.map((cat, index) => (
                  <div key={cat.category} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{cat.category}</div>
                      <div className="text-sm text-muted-foreground">
                        {cat.count} wasteful transaction{cat.count !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(cat.total)}</div>
                      <Badge variant="destructive" className="text-xs">
                        {cat.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emotion-driven expenses */}
        {emotionChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Emotion-Driven Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={emotionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === "amount") return formatCurrency(value * 100);
                      return value;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* C. Category Intelligence */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Category Intelligence</h2>
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categoryChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value: number) => formatCurrency(value * 100)} />
                <Bar dataKey="amount" fill="#8b5cf6" name="Amount (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* D. Smart Comparisons */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Smart Comparisons</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          {/* This Month vs Last Month */}
          <Card>
            <CardHeader>
              <CardTitle>This Month vs Last Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Current Month</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(monthComparison.currentMonth.total)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Previous Month</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(monthComparison.previousMonth.total)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {monthComparison.percentageChange > 0 ? (
                    <>
                      <TrendingUp className="h-5 w-5 text-red-500" />
                      <span className="font-semibold text-red-500">
                        +{monthComparison.percentageChange}% increase
                      </span>
                    </>
                  ) : monthComparison.percentageChange < 0 ? (
                    <>
                      <TrendingDown className="h-5 w-5 text-green-500" />
                      <span className="font-semibold text-green-500">
                        {monthComparison.percentageChange}% decrease
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold">No change</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekday vs Weekend */}
          <Card>
            <CardHeader>
              <CardTitle>Weekday vs Weekend Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Weekday Average</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(weekdayWeekendComparison.weekday.average)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total: {formatCurrency(weekdayWeekendComparison.weekday.total)} ({weekdayWeekendComparison.weekday.count} transactions)
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Weekend Average</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(weekdayWeekendComparison.weekend.average)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total: {formatCurrency(weekdayWeekendComparison.weekend.total)} ({weekdayWeekendComparison.weekend.count} transactions)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Mode Distribution */}
        {paymentModeChartData.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Payment Mode Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentModeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${entry.count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {paymentModeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value * 100)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
