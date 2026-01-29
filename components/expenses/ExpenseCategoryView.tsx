"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getSpendByCategory } from "@/lib/expenses";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import type { Expense, ExpenseCategory } from "@/types";

interface ExpenseCategoryViewProps {
  expenses: Expense[];
}

export function ExpenseCategoryView({ expenses }: ExpenseCategoryViewProps) {
  const categorySpending = getSpendByCategory(expenses);

  // Get category icon
  const getCategoryIcon = (category: ExpenseCategory): string => {
    const cat = EXPENSE_CATEGORIES.find((c) => c.value === category);
    return cat?.icon || "📦";
  };

  // Get category color
  const getCategoryColor = (category: ExpenseCategory): string => {
    const cat = EXPENSE_CATEGORIES.find((c) => c.value === category);
    return cat?.color || "#6b7280";
  };

  if (categorySpending.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="mb-2 text-4xl">📊</div>
          <p className="text-sm text-muted-foreground">No expense data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categorySpending.map((category) => (
              <div key={category.category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(category.category)}</span>
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatCurrency(category.total)}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.percentage}%
                    </Badge>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${category.percentage}%`,
                      backgroundColor: getCategoryColor(category.category),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categorySpending.map((category) => (
          <Card
            key={category.category}
            className="overflow-hidden transition-all hover:shadow-lg"
          >
            <div
              className="h-2"
              style={{ backgroundColor: getCategoryColor(category.category) }}
            />
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{getCategoryIcon(category.category)}</span>
                <CardTitle className="text-lg">{category.category}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Total Spent</div>
                <div className="text-2xl font-bold">{formatCurrency(category.total)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Transactions</div>
                  <div className="font-semibold">{category.count}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">% of Total</div>
                  <div className="font-semibold">{category.percentage}%</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Average per Transaction</div>
                <div className="font-semibold">
                  {formatCurrency(Math.round(category.total / category.count))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top 3 Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Top 3 Spending Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categorySpending.slice(0, 3).map((category, index) => (
              <div key={category.category} className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                    index === 0
                      ? "bg-yellow-500 text-yellow-950"
                      : index === 1
                      ? "bg-gray-400 text-gray-950"
                      : "bg-orange-600 text-orange-950"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-2xl">{getCategoryIcon(category.category)}</span>
                <div className="flex-1">
                  <div className="font-semibold">{category.category}</div>
                  <div className="text-sm text-muted-foreground">
                    {category.count} transaction{category.count !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(category.total)}</div>
                  <Badge variant="secondary" className="text-xs">
                    {category.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
