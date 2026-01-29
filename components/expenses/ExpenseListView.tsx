"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Edit2, Trash2, Search, X } from "lucide-react";
import { db } from "@/lib/instant";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/expenses";
import { getTodayString } from "@/lib/date-utils";
import { EXPENSE_CATEGORIES, PAYMENT_MODES, NECESSITY_LEVELS, SAVINGS_POTENTIAL, EMOTION_TAGS, EXPENSE_INTENTS } from "@/lib/constants";
import type { Expense, ExpenseCategory, PaymentMode, NecessityLevel, SavingsPotential, EmotionTag, ExpenseIntent } from "@/types";

interface ExpenseListViewProps {
  expenses: Expense[];
}

export function ExpenseListView({ expenses }: ExpenseListViewProps) {
  const { addToast } = useToast();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editCategory, setEditCategory] = useState<ExpenseCategory>("Food & Dining");
  const [editPaymentMode, setEditPaymentMode] = useState<PaymentMode>("Cash");
  const [editMerchant, setEditMerchant] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editNecessityLevel, setEditNecessityLevel] = useState<NecessityLevel>("necessary");
  const [editSavingsPotential, setEditSavingsPotential] = useState<SavingsPotential>("none");
  const [editWasteFlag, setEditWasteFlag] = useState(false);
  const [editValueScore, setEditValueScore] = useState(3);
  const [editEmotionTag, setEditEmotionTag] = useState<EmotionTag>("neutral");
  const [editExpenseIntent, setEditExpenseIntent] = useState<ExpenseIntent>("survival");

  // Filter expenses by search query
  const filteredExpenses = expenses.filter((expense) => {
    const query = searchQuery.toLowerCase();
    return (
      expense.title.toLowerCase().includes(query) ||
      expense.category.toLowerCase().includes(query) ||
      (expense.merchant && expense.merchant.toLowerCase().includes(query))
    );
  });

  // Group expenses by date
  const groupedExpenses = filteredExpenses.reduce((groups, expense) => {
    const date = expense.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a));

  const getDateLabel = (date: string): string => {
    const today = getTodayString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (date === today) return "Today";
    if (date === yesterdayStr) return "Yesterday";

    const expenseDate = new Date(date);
    return expenseDate.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryIcon = (category: ExpenseCategory): string => {
    const cat = EXPENSE_CATEGORIES.find((c) => c.value === category);
    return cat?.icon || "📦";
  };

  const openExpenseDetail = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditing(false);
    setShowDeleteConfirm(false);
    // Initialize edit form
    setEditTitle(expense.title);
    setEditAmount((expense.amount / 100).toString());
    setEditDate(expense.date);
    setEditCategory(expense.category);
    setEditPaymentMode(expense.paymentMode);
    setEditMerchant(expense.merchant || "");
    setEditNotes(expense.notes || "");
    setEditNecessityLevel(expense.necessityLevel);
    setEditSavingsPotential(expense.savingsPotential);
    setEditWasteFlag(expense.wasteFlag);
    setEditValueScore(expense.valueScore);
    setEditEmotionTag(expense.emotionTag);
    setEditExpenseIntent(expense.expenseIntent);
  };

  const closeModal = () => {
    setSelectedExpense(null);
    setIsEditing(false);
    setShowDeleteConfirm(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedExpense || !editTitle.trim()) {
      addToast("Please enter a title", "error");
      return;
    }

    const amountNum = parseFloat(editAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      addToast("Please enter a valid amount", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      await db.transact([
        db.tx.expenses[selectedExpense.id].update({
          title: editTitle.trim(),
          amount: Math.round(amountNum * 100),
          date: editDate,
          category: editCategory,
          paymentMode: editPaymentMode,
          merchant: editMerchant.trim() || undefined,
          notes: editNotes.trim() || undefined,
          necessityLevel: editNecessityLevel,
          savingsPotential: editSavingsPotential,
          wasteFlag: editWasteFlag,
          valueScore: editValueScore,
          emotionTag: editEmotionTag,
          expenseIntent: editExpenseIntent,
          updatedAt: Date.now(),
        }),
      ]);

      addToast("Expense updated successfully!", "success");
      setIsEditing(false);
      closeModal();
    } catch (error) {
      console.error("Error updating expense:", error);
      addToast("Failed to update expense. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedExpense) return;

    setIsSubmitting(true);

    try {
      // Soft delete
      await db.transact([
        db.tx.expenses[selectedExpense.id].update({
          deletedAt: Date.now(),
        }),
      ]);

      addToast("Expense deleted successfully", "success");
      closeModal();
    } catch (error) {
      console.error("Error deleting expense:", error);
      addToast("Failed to delete expense. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search expenses by title, category, or merchant..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-2 text-4xl">🔍</div>
            <p className="text-sm text-muted-foreground">No expenses found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date} className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">{getDateLabel(date)}</h3>
              <div className="space-y-2">
                {groupedExpenses[date]
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((expense) => (
                    <Card
                      key={expense.id}
                      className="cursor-pointer transition-colors hover:bg-accent"
                      onClick={() => openExpenseDetail(expense)}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
                          {getCategoryIcon(expense.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{expense.title}</h4>
                            {expense.wasteFlag && (
                              <Badge variant="destructive" className="text-xs">
                                Waste
                              </Badge>
                            )}
                            {expense.isRecurring && (
                              <Badge variant="secondary" className="text-xs">
                                Recurring
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{expense.category}</span>
                            <span>•</span>
                            <span>{expense.paymentMode}</span>
                            {expense.merchant && (
                              <>
                                <span>•</span>
                                <span>{expense.merchant}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{formatCurrency(expense.amount)}</div>
                          <Badge
                            variant={
                              expense.necessityLevel === "necessary"
                                ? "default"
                                : expense.necessityLevel === "luxury"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {expense.necessityLevel}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expense Detail Modal */}
      <Dialog open={!!selectedExpense && !showDeleteConfirm} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedExpense && (
            <>
              {!isEditing ? (
                // View Mode
                <>
                  <DialogHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{getCategoryIcon(selectedExpense.category)}</span>
                        <div>
                          <DialogTitle className="text-2xl">{selectedExpense.title}</DialogTitle>
                          <DialogDescription className="mt-2">
                            {new Date(selectedExpense.date).toLocaleDateString("en-IN", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </DialogDescription>
                        </div>
                      </div>
                      <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    {/* Amount */}
                    <div className="rounded-lg border p-4 text-center">
                      <div className="text-sm text-muted-foreground">Amount</div>
                      <div className="text-3xl font-bold">{formatCurrency(selectedExpense.amount)}</div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Category</div>
                        <Badge>{selectedExpense.category}</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Payment Mode</div>
                        <Badge variant="outline">{selectedExpense.paymentMode}</Badge>
                      </div>
                      {selectedExpense.merchant && (
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Merchant</div>
                          <div className="font-medium">{selectedExpense.merchant}</div>
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Necessity Level</div>
                        <Badge>{selectedExpense.necessityLevel}</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Savings Potential</div>
                        <Badge variant="secondary">{selectedExpense.savingsPotential}</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Value Score</div>
                        <div className="font-medium">{selectedExpense.valueScore}/5</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Emotion</div>
                        <Badge variant="outline">{selectedExpense.emotionTag}</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Intent</div>
                        <Badge variant="outline">{selectedExpense.expenseIntent}</Badge>
                      </div>
                    </div>

                    {/* Flags */}
                    <div className="flex gap-2">
                      {selectedExpense.wasteFlag && (
                        <Badge variant="destructive">Wasteful</Badge>
                      )}
                      {selectedExpense.isRecurring && (
                        <Badge variant="secondary">Recurring</Badge>
                      )}
                    </div>

                    {/* Notes */}
                    {selectedExpense.notes && (
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Notes</div>
                        <div className="rounded-lg border p-3 text-sm">{selectedExpense.notes}</div>
                      </div>
                    )}
                  </div>

                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="w-full sm:w-auto"
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                // Edit Mode - Simplified version
                <>
                  <DialogHeader>
                    <DialogTitle>Edit Expense</DialogTitle>
                    <DialogDescription>Make changes to your expense details</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Title *</Label>
                      <Input
                        id="edit-title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        maxLength={100}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="edit-amount">Amount (₹) *</Label>
                        <Input
                          id="edit-amount"
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-date">Date *</Label>
                        <Input
                          id="edit-date"
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-notes">Notes</Label>
                      <Textarea
                        id="edit-notes"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={3}
                        maxLength={500}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEdit} disabled={isSubmitting || !editTitle.trim()}>
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedExpense?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
