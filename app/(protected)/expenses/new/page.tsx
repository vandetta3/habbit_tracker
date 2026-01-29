"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { db } from "@/lib/instant";
import { useToast } from "@/components/ui/toast";
import { getTodayString } from "@/lib/date-utils";
import { convertToPaise } from "@/lib/expenses";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_MODES,
  NECESSITY_LEVELS,
  SAVINGS_POTENTIAL,
  EMOTION_TAGS,
  EXPENSE_INTENTS,
} from "@/lib/constants";
import type { ExpenseCategory, PaymentMode, NecessityLevel, SavingsPotential, EmotionTag, ExpenseIntent } from "@/types";

export default function NewExpensePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = db.useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getTodayString());
  const [category, setCategory] = useState<ExpenseCategory>("Food & Dining");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");
  const [merchant, setMerchant] = useState("");
  const [notes, setNotes] = useState("");
  const [necessityLevel, setNecessityLevel] = useState<NecessityLevel>("necessary");
  const [savingsPotential, setSavingsPotential] = useState<SavingsPotential>("none");
  const [wasteFlag, setWasteFlag] = useState(false);
  const [valueScore, setValueScore] = useState(3);
  const [emotionTag, setEmotionTag] = useState<EmotionTag>("neutral");
  const [expenseIntent, setExpenseIntent] = useState<ExpenseIntent>("survival");
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      addToast("Please enter a title", "error");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      addToast("Please enter a valid amount", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      await db.transact([
        db.tx.expenses[crypto.randomUUID()]
          .update({
            title: title.trim(),
            amount: convertToPaise(amountNum),
            currency: "INR",
            date,
            category,
            paymentMode,
            merchant: merchant.trim() || undefined,
            notes: notes.trim() || undefined,
            necessityLevel,
            savingsPotential,
            wasteFlag,
            valueScore,
            emotionTag,
            expenseIntent,
            isRecurring,
            recurringType: undefined,
            deletedAt: undefined,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
          .link({ user: user!.id }),
      ]);

      addToast("Expense added successfully!", "success");
      router.push("/expenses");
    } catch (error) {
      console.error("Error creating expense:", error);
      addToast("Failed to create expense. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToStep2 = title.trim() && amount && parseFloat(amount) > 0;
  const canProceedToStep3 = canProceedToStep2;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/expenses")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Expense</h1>
          <p className="text-muted-foreground">Track your spending with behavioral insights</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                step >= s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted bg-background text-muted-foreground"
              }`}
            >
              {step > s ? <Check className="h-5 w-5" /> : s}
            </div>
            {s < 4 && <div className={`w-16 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Lunch at restaurant"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={getTodayString()}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {EXPENSE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value as ExpenseCategory)}
                    className={`flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-all hover:border-primary/50 ${
                      category === cat.value
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Mode *</Label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {PAYMENT_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setPaymentMode(mode.value as PaymentMode)}
                    className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all hover:border-primary/50 ${
                      paymentMode === mode.value
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <span className="text-xl">{mode.icon}</span>
                    <span className="text-sm font-medium">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!canProceedToStep2}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Optional Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant / Vendor</Label>
              <Input
                id="merchant"
                placeholder="e.g., Amazon, Local Store"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional details about this expense..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="recurring" className="font-normal cursor-pointer">
                This is a recurring expense (subscription, monthly bill, etc.)
              </Label>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!canProceedToStep3}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Behavioral Tracking */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Behavioral Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Was this expense necessary? *</Label>
              <div className="grid gap-2">
                {NECESSITY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setNecessityLevel(level.value as NecessityLevel)}
                    className={`flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all hover:border-primary/50 ${
                      necessityLevel === level.value
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-muted-foreground">{level.description}</div>
                    </div>
                    {necessityLevel === level.value && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Could you have saved money? *</Label>
              <div className="grid gap-2">
                {SAVINGS_POTENTIAL.map((potential) => (
                  <button
                    key={potential.value}
                    type="button"
                    onClick={() => setSavingsPotential(potential.value as SavingsPotential)}
                    className={`flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all hover:border-primary/50 ${
                      savingsPotential === potential.value
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{potential.label}</div>
                      <div className="text-sm text-muted-foreground">{potential.description}</div>
                    </div>
                    {savingsPotential === potential.value && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Was this wasteful spending? *</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWasteFlag(false)}
                  className={`flex-1 rounded-lg border-2 p-3 transition-all hover:border-primary/50 ${
                    !wasteFlag ? "border-primary bg-primary/10" : "border-border"
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setWasteFlag(true)}
                  className={`flex-1 rounded-lg border-2 p-3 transition-all hover:border-primary/50 ${
                    wasteFlag ? "border-primary bg-primary/10" : "border-border"
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>How much value did you receive? * (1-5)</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setValueScore(score)}
                    className={`flex-1 rounded-lg border-2 p-3 transition-all hover:border-primary/50 ${
                      valueScore === score
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">1 = Poor value, 5 = Excellent value</p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setStep(4)}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Intent & Emotion */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Intent & Emotion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>What was your emotional state? *</Label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {EMOTION_TAGS.map((emotion) => (
                  <button
                    key={emotion.value}
                    type="button"
                    onClick={() => setEmotionTag(emotion.value as EmotionTag)}
                    className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-all hover:border-primary/50 ${
                      emotionTag === emotion.value
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <span className="text-xl">{emotion.icon}</span>
                    <span className="text-sm font-medium">{emotion.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>What was the purpose of this expense? *</Label>
              <div className="grid gap-2">
                {EXPENSE_INTENTS.map((intent) => (
                  <button
                    key={intent.value}
                    type="button"
                    onClick={() => setExpenseIntent(intent.value as ExpenseIntent)}
                    className={`flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all hover:border-primary/50 ${
                      expenseIntent === intent.value
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <span className="text-2xl">{intent.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{intent.label}</div>
                      <div className="text-sm text-muted-foreground">{intent.description}</div>
                    </div>
                    {expenseIntent === intent.value && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Expense"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
