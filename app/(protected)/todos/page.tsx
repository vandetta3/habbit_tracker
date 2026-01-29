"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Plus,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  X,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";
import { db } from "@/lib/instant";
import { useToast } from "@/components/ui/toast";
import { TODO_PRIORITIES } from "@/lib/constants";
import type { Todo, TodoPriority } from "@/types";

export default function TodosPage() {
  const { addToast } = useToast();
  const { user } = db.useAuth();
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formDueTime, setFormDueTime] = useState("");
  const [formPriority, setFormPriority] = useState<TodoPriority>("medium");

  // Query todos - filtered by current user
  const { data, isLoading } = db.useQuery({
    todos: {
      $: {
        where: {
          user: user?.id || "",
        },
      },
    },
  });

  const todos = (data?.todos || []) as unknown as Todo[];

  // Separate by status
  const pendingTodos = todos.filter((t) => t.status === "pending");
  const completedTodos = todos.filter((t) => t.status === "done");

  // Sort pending by priority (high -> medium -> low) then by due date
  const sortedPendingTodos = [...pendingTodos].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by due date
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    return 0;
  });

  // Sort completed by completion date (most recent first)
  const sortedCompletedTodos = [...completedTodos].sort((a, b) => {
    return (b.completedAt || 0) - (a.completedAt || 0);
  });

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormDueDate("");
    setFormDueTime("");
    setFormPriority("medium");
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreating(true);
  };

  const openEditDialog = (todo: Todo) => {
    setSelectedTodo(todo);
    setFormTitle(todo.title);
    setFormDescription(todo.description || "");
    setFormDueDate(todo.dueDate || "");
    setFormDueTime(todo.dueTime || "");
    setFormPriority(todo.priority);
    setIsEditing(true);
  };

  const openViewDialog = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsEditing(false);
    setShowDeleteConfirm(false);
  };

  const closeAllDialogs = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedTodo(null);
    setShowDeleteConfirm(false);
  };

  const handleCreate = async () => {
    if (!formTitle.trim()) {
      addToast("Please enter a title", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      await db.transact([
        db.tx.todos[crypto.randomUUID()]
          .update({
            title: formTitle.trim(),
            description: formDescription.trim() || undefined,
            status: "pending",
            dueDate: formDueDate || undefined,
            dueTime: formDueTime || undefined,
            priority: formPriority,
            createdAt: Date.now(),
          })
          .link({ user: user!.id }),
      ]);

      addToast("Todo created successfully!", "success");
      resetForm();
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating todo:", error);
      addToast("Failed to create todo. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTodo || !formTitle.trim()) {
      addToast("Please enter a title", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      await db.transact([
        db.tx.todos[selectedTodo.id].update({
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          dueDate: formDueDate || undefined,
          dueTime: formDueTime || undefined,
          priority: formPriority,
        }),
      ]);

      addToast("Todo updated successfully!", "success");
      setIsEditing(false);
      closeAllDialogs();
    } catch (error) {
      console.error("Error updating todo:", error);
      addToast("Failed to update todo. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTodo) return;

    setIsSubmitting(true);

    try {
      await db.transact([db.tx.todos[selectedTodo.id].delete()]);

      addToast("Todo deleted successfully", "success");
      closeAllDialogs();
    } catch (error) {
      console.error("Error deleting todo:", error);
      addToast("Failed to delete todo. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (todo: Todo, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    const newStatus = todo.status === "done" ? "pending" : "done";

    try {
      await db.transact([
        db.tx.todos[todo.id].update({
          status: newStatus,
          completedAt: newStatus === "done" ? Date.now() : undefined,
        }),
      ]);

      addToast(
        newStatus === "done" ? "Todo completed! 🎉" : "Marked as pending",
        "success"
      );
    } catch (error) {
      console.error("Error toggling todo:", error);
      addToast("Failed to update todo. Please try again.", "error");
    }
  };

  const getPriorityColor = (priority: TodoPriority) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-50 dark:bg-red-950 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950 border-yellow-200";
      case "low":
        return "text-gray-500 bg-gray-50 dark:bg-gray-900 border-gray-200";
    }
  };

  const formatDueDateTime = (dueDate?: string | null, dueTime?: string | null) => {
    if (!dueDate) return null;

    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const isPast = date < today && !isToday;

    let dateStr = "";
    if (isToday) dateStr = "Today";
    else if (isTomorrow) dateStr = "Tomorrow";
    else {
      dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }

    if (dueTime) {
      // Convert 24hr to 12hr format
      const [hours, minutes] = dueTime.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      dateStr += ` at ${displayHour}:${minutes} ${ampm}`;
    }

    return { text: dateStr, isPast };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
            <p className="text-muted-foreground">Loading your todos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
          <p className="text-muted-foreground">
            Manage your tasks and to-do items
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Todo
        </Button>
      </div>

      {/* Summary Stats */}
      {todos.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todos.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingTodos.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTodos.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {todos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 text-6xl">✅</div>
            <h3 className="mb-2 text-lg font-semibold">No todos yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Create your first todo to start organizing your tasks and staying productive.
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Todo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pending Todos */}
          {sortedPendingTodos.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Pending Tasks ({sortedPendingTodos.length})
              </h2>
              <div className="space-y-3">
                {sortedPendingTodos.map((todo) => {
                  const dueDateInfo = formatDueDateTime(todo.dueDate, todo.dueTime);
                  const priorityInfo = TODO_PRIORITIES.find((p) => p.value === todo.priority);

                  return (
                    <Card
                      key={todo.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => openViewDialog(todo)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <button
                            onClick={(e) => handleToggleComplete(todo, e)}
                            className="mt-1 transition-transform hover:scale-110"
                          >
                            <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{todo.title}</h3>
                                {todo.description && (
                                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                    {todo.description}
                                  </p>
                                )}
                              </div>
                              <Badge
                                variant="outline"
                                className={`${getPriorityColor(todo.priority)} shrink-0`}
                              >
                                {priorityInfo?.label}
                              </Badge>
                            </div>

                            {dueDateInfo && (
                              <div className="mt-3 flex items-center gap-1 text-sm">
                                {dueDateInfo.isPast ? (
                                  <>
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-red-500 font-medium">
                                      Overdue: {dueDateInfo.text}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    {todo.dueTime ? (
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="text-muted-foreground">
                                      Due: {dueDateInfo.text}
                                    </span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Todos */}
          {sortedCompletedTodos.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-muted-foreground">
                Completed ({sortedCompletedTodos.length})
              </h2>
              <div className="space-y-3">
                {sortedCompletedTodos.map((todo) => {
                  const dueDateInfo = formatDueDateTime(todo.dueDate, todo.dueTime);

                  return (
                    <Card
                      key={todo.id}
                      className="opacity-70 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openViewDialog(todo)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <button
                            onClick={(e) => handleToggleComplete(todo, e)}
                            className="mt-1 transition-transform hover:scale-110"
                          >
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          </button>

                          <div className="flex-1">
                            <h3 className="font-semibold text-lg line-through decoration-muted-foreground">
                              {todo.title}
                            </h3>
                            {todo.description && (
                              <p className="mt-1 text-sm text-muted-foreground line-through line-clamp-2">
                                {todo.description}
                              </p>
                            )}
                            {dueDateInfo && (
                              <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                                {todo.dueTime ? (
                                  <Clock className="h-4 w-4" />
                                ) : (
                                  <Calendar className="h-4 w-4" />
                                )}
                                <span>Due: {dueDateInfo.text}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Todo Dialog */}
      <Dialog open={isCreating} onOpenChange={(open) => !open && setIsCreating(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Todo</DialogTitle>
            <DialogDescription>
              Add a new task to your todo list
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-title">Title *</Label>
              <Input
                id="create-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter todo title..."
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Add details about this task..."
                rows={4}
                maxLength={1000}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-due-date">Due Date</Label>
                <Input
                  id="create-due-date"
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-due-time">Due Time</Label>
                <Input
                  id="create-due-time"
                  type="time"
                  value={formDueTime}
                  onChange={(e) => setFormDueTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Priority *</Label>
              <div className="flex gap-3">
                {TODO_PRIORITIES.map((priority) => (
                  <Button
                    key={priority.value}
                    type="button"
                    variant={formPriority === priority.value ? "default" : "outline"}
                    onClick={() => setFormPriority(priority.value as TodoPriority)}
                    className="flex-1"
                  >
                    {priority.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreating(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isSubmitting || !formTitle.trim()}
            >
              {isSubmitting ? "Creating..." : "Create Todo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Edit Todo Dialog */}
      <Dialog
        open={!!selectedTodo && !showDeleteConfirm}
        onOpenChange={(open) => !open && closeAllDialogs()}
      >
        <DialogContent className="max-w-2xl">
          {selectedTodo && (
            <>
              {!isEditing ? (
                // View Mode
                <>
                  <DialogHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleComplete(selectedTodo)}
                            className="mt-1 transition-transform hover:scale-110"
                          >
                            {selectedTodo.status === "done" ? (
                              <CheckCircle2 className="h-7 w-7 text-green-500" />
                            ) : (
                              <Circle className="h-7 w-7 text-muted-foreground hover:text-primary" />
                            )}
                          </button>
                          <div className="flex-1">
                            <DialogTitle
                              className={`text-2xl ${
                                selectedTodo.status === "done"
                                  ? "line-through decoration-muted-foreground"
                                  : ""
                              }`}
                            >
                              {selectedTodo.title}
                            </DialogTitle>
                            {selectedTodo.description && (
                              <DialogDescription className="mt-2 whitespace-pre-wrap">
                                {selectedTodo.description}
                              </DialogDescription>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={closeAllDialogs}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    {/* Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Priority:</span>
                        <Badge
                          variant="outline"
                          className={getPriorityColor(selectedTodo.priority)}
                        >
                          {TODO_PRIORITIES.find((p) => p.value === selectedTodo.priority)?.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant={selectedTodo.status === "done" ? "default" : "secondary"}>
                          {selectedTodo.status === "done" ? "Completed" : "Pending"}
                        </Badge>
                      </div>

                      {selectedTodo.dueDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Due:</span>
                          {(() => {
                            const dueDateInfo = formatDueDateTime(
                              selectedTodo.dueDate,
                              selectedTodo.dueTime
                            );
                            return dueDateInfo ? (
                              <span
                                className={
                                  dueDateInfo.isPast && selectedTodo.status === "pending"
                                    ? "text-red-500 font-medium"
                                    : ""
                                }
                              >
                                {dueDateInfo.isPast && selectedTodo.status === "pending" && (
                                  <AlertCircle className="inline h-4 w-4 mr-1" />
                                )}
                                {dueDateInfo.text}
                              </span>
                            ) : null;
                          })()}
                        </div>
                      )}

                      {selectedTodo.completedAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Completed:</span>
                          <span className="text-muted-foreground">
                            {new Date(selectedTodo.completedAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">Created:</span>
                        <span>
                          {new Date(selectedTodo.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFormTitle(selectedTodo.title);
                          setFormDescription(selectedTodo.description || "");
                          setFormDueDate(selectedTodo.dueDate || "");
                          setFormDueTime(selectedTodo.dueTime || "");
                          setFormPriority(selectedTodo.priority);
                          setIsEditing(true);
                        }}
                        className="flex-1 sm:flex-none"
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex-1 sm:flex-none"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </DialogFooter>
                </>
              ) : (
                // Edit Mode
                <>
                  <DialogHeader>
                    <DialogTitle>Edit Todo</DialogTitle>
                    <DialogDescription>Make changes to your task</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Title *</Label>
                      <Input
                        id="edit-title"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Enter todo title..."
                        maxLength={200}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Add details about this task..."
                        rows={4}
                        maxLength={1000}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-due-date">Due Date</Label>
                        <Input
                          id="edit-due-date"
                          type="date"
                          value={formDueDate}
                          onChange={(e) => setFormDueDate(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-due-time">Due Time</Label>
                        <Input
                          id="edit-due-time"
                          type="time"
                          value={formDueTime}
                          onChange={(e) => setFormDueTime(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Priority *</Label>
                      <div className="flex gap-3">
                        {TODO_PRIORITIES.map((priority) => (
                          <Button
                            key={priority.value}
                            type="button"
                            variant={formPriority === priority.value ? "default" : "outline"}
                            onClick={() => setFormPriority(priority.value as TodoPriority)}
                            className="flex-1"
                          >
                            {priority.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdate}
                      disabled={isSubmitting || !formTitle.trim()}
                    >
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
            <DialogTitle>Delete Todo?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedTodo?.title}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Todo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
