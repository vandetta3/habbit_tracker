"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Edit2,
  Trash2,
  X,
  Pin,
  PinOff,
  StickyNote,
} from "lucide-react";
import { db } from "@/lib/instant";
import { useToast } from "@/components/ui/toast";
import type { Note } from "@/types";

const NOTE_COLORS = [
  { name: "Yellow", bg: "bg-yellow-100", dark: "dark:bg-yellow-900/20", border: "border-yellow-200", text: "text-yellow-900 dark:text-yellow-100" },
  { name: "Pink", bg: "bg-pink-100", dark: "dark:bg-pink-900/20", border: "border-pink-200", text: "text-pink-900 dark:text-pink-100" },
  { name: "Blue", bg: "bg-blue-100", dark: "dark:bg-blue-900/20", border: "border-blue-200", text: "text-blue-900 dark:text-blue-100" },
  { name: "Green", bg: "bg-green-100", dark: "dark:bg-green-900/20", border: "border-green-200", text: "text-green-900 dark:text-green-100" },
  { name: "Purple", bg: "bg-purple-100", dark: "dark:bg-purple-900/20", border: "border-purple-200", text: "text-purple-900 dark:text-purple-100" },
  { name: "Orange", bg: "bg-orange-100", dark: "dark:bg-orange-900/20", border: "border-orange-200", text: "text-orange-900 dark:text-orange-100" },
];

export default function NotesPage() {
  const { addToast } = useToast();
  const { user } = db.useAuth();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formColor, setFormColor] = useState(0);
  const [formTags, setFormTags] = useState("");

  // Query notes - filtered by current user
  const { data, isLoading } = db.useQuery({
    notes: {
      $: {
        where: {
          user: user?.id || "",
        },
      },
    },
  });

  const notes = (data?.notes || []) as unknown as Note[];

  // Separate pinned and unpinned notes
  const pinnedNotes = notes.filter((n) => n.isPinned);
  const unpinnedNotes = notes.filter((n) => !n.isPinned);

  // Sort by updated date (most recent first)
  const sortedPinnedNotes = [...pinnedNotes].sort((a, b) => b.updatedAt - a.updatedAt);
  const sortedUnpinnedNotes = [...unpinnedNotes].sort((a, b) => b.updatedAt - a.updatedAt);

  const resetForm = () => {
    setFormTitle("");
    setFormContent("");
    setFormColor(0);
    setFormTags("");
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreating(true);
  };

  const openEditDialog = (note: Note) => {
    setSelectedNote(note);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormColor(0); // Will be replaced with actual color index
    setFormTags(note.tags?.join(", ") || "");
    setIsEditing(true);
  };

  const openViewDialog = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(false);
    setShowDeleteConfirm(false);
  };

  const closeAllDialogs = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedNote(null);
    setShowDeleteConfirm(false);
  };

  const parseTags = (tagsString: string): string[] => {
    if (!tagsString.trim()) return [];
    return tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  };

  const handleCreate = async () => {
    if (!formTitle.trim()) {
      addToast("Please enter a title", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const tags = parseTags(formTags);
      await db.transact([
        db.tx.notes[crypto.randomUUID()]
          .update({
            title: formTitle.trim(),
            content: formContent.trim(),
            tags: tags.length > 0 ? tags : undefined,
            isPinned: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
          .link({ user: user!.id }),
      ]);

      addToast("Note created successfully!", "success");
      resetForm();
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating note:", error);
      addToast("Failed to create note. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedNote || !formTitle.trim()) {
      addToast("Please enter a title", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const tags = parseTags(formTags);
      await db.transact([
        db.tx.notes[selectedNote.id].update({
          title: formTitle.trim(),
          content: formContent.trim(),
          tags: tags.length > 0 ? tags : undefined,
          updatedAt: Date.now(),
        }),
      ]);

      addToast("Note updated successfully!", "success");
      setIsEditing(false);
      closeAllDialogs();
    } catch (error) {
      console.error("Error updating note:", error);
      addToast("Failed to update note. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) return;

    setIsSubmitting(true);

    try {
      await db.transact([db.tx.notes[selectedNote.id].delete()]);

      addToast("Note deleted successfully", "success");
      closeAllDialogs();
    } catch (error) {
      console.error("Error deleting note:", error);
      addToast("Failed to delete note. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePin = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await db.transact([
        db.tx.notes[note.id].update({
          isPinned: !note.isPinned,
          updatedAt: Date.now(),
        }),
      ]);

      addToast(
        note.isPinned ? "Note unpinned" : "Note pinned",
        "success"
      );
    } catch (error) {
      console.error("Error toggling pin:", error);
      addToast("Failed to update note. Please try again.", "error");
    }
  };

  const getNoteColor = (index: number) => {
    return NOTE_COLORS[index % NOTE_COLORS.length];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
            <p className="text-muted-foreground">Loading your notes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">
            Create and manage your sticky notes
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 text-6xl">
              <StickyNote className="h-16 w-16 mx-auto text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No notes yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Create your first note to start capturing your thoughts and ideas.
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pinned Notes */}
          {sortedPinnedNotes.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Pin className="h-5 w-5" />
                Pinned ({sortedPinnedNotes.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedPinnedNotes.map((note, index) => {
                  const color = getNoteColor(index);
                  return (
                    <Card
                      key={note.id}
                      className={`${color.bg} ${color.dark} ${color.border} border-2 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 relative group`}
                      onClick={() => openViewDialog(note)}
                    >
                      <CardContent className="pt-6 pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className={`font-bold text-lg ${color.text} flex-1 pr-2 break-words`}>
                            {note.title}
                          </h3>
                          <button
                            onClick={(e) => handleTogglePin(note, e)}
                            className={`${color.text} opacity-100 transition-opacity shrink-0`}
                          >
                            <Pin className="h-4 w-4 fill-current" />
                          </button>
                        </div>
                        <p className={`text-sm ${color.text} line-clamp-4 whitespace-pre-wrap`}>
                          {note.content}
                        </p>
                        {note.tags && note.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {note.tags.map((tag, i) => (
                              <span
                                key={i}
                                className={`text-xs px-2 py-0.5 rounded-full ${color.text} bg-white/30 dark:bg-black/20`}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 text-xs opacity-60">
                          {new Date(note.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Regular Notes */}
          {sortedUnpinnedNotes.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                All Notes ({sortedUnpinnedNotes.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedUnpinnedNotes.map((note, index) => {
                  const color = getNoteColor(index);
                  return (
                    <Card
                      key={note.id}
                      className={`${color.bg} ${color.dark} ${color.border} border-2 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 relative group`}
                      onClick={() => openViewDialog(note)}
                    >
                      <CardContent className="pt-6 pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className={`font-bold text-lg ${color.text} flex-1 pr-2 break-words`}>
                            {note.title}
                          </h3>
                          <button
                            onClick={(e) => handleTogglePin(note, e)}
                            className={`${color.text} opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity shrink-0`}
                          >
                            <PinOff className="h-4 w-4" />
                          </button>
                        </div>
                        <p className={`text-sm ${color.text} line-clamp-4 whitespace-pre-wrap`}>
                          {note.content}
                        </p>
                        {note.tags && note.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {note.tags.map((tag, i) => (
                              <span
                                key={i}
                                className={`text-xs px-2 py-0.5 rounded-full ${color.text} bg-white/30 dark:bg-black/20`}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 text-xs opacity-60">
                          {new Date(note.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
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

      {/* Create Note Dialog */}
      <Dialog open={isCreating} onOpenChange={(open) => !open && setIsCreating(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
            <DialogDescription>
              Add a new sticky note
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-title">Title *</Label>
              <Input
                id="create-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter note title..."
                maxLength={100}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-content">Content</Label>
              <Textarea
                id="create-content"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Write your note here..."
                rows={6}
                maxLength={5000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-tags">Tags (comma-separated)</Label>
              <Input
                id="create-tags"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="work, ideas, personal..."
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas
              </p>
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
              {isSubmitting ? "Creating..." : "Create Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Edit Note Dialog */}
      <Dialog
        open={!!selectedNote && !showDeleteConfirm}
        onOpenChange={(open) => !open && closeAllDialogs()}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedNote && (
            <>
              {!isEditing ? (
                // View Mode
                <>
                  <DialogHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-8">
                        <div className="flex items-start gap-3 mb-2">
                          <button
                            onClick={(e) => handleTogglePin(selectedNote, e)}
                            className="mt-1 transition-transform hover:scale-110"
                          >
                            {selectedNote.isPinned ? (
                              <Pin className="h-5 w-5 text-primary fill-current" />
                            ) : (
                              <PinOff className="h-5 w-5 text-muted-foreground hover:text-primary" />
                            )}
                          </button>
                          <div className="flex-1">
                            <DialogTitle className="text-2xl">
                              {selectedNote.title}
                            </DialogTitle>
                          </div>
                        </div>
                        {selectedNote.tags && selectedNote.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {selectedNote.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
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
                    <div className="rounded-lg border bg-muted/30 p-4 min-h-[200px]">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {selectedNote.content || (
                          <span className="text-muted-foreground italic">No content</span>
                        )}
                      </p>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>
                        Created: {new Date(selectedNote.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                      <div>
                        Updated: {new Date(selectedNote.updatedAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={() => openEditDialog(selectedNote)}
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
                    <DialogTitle>Edit Note</DialogTitle>
                    <DialogDescription>Make changes to your note</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Title *</Label>
                      <Input
                        id="edit-title"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Enter note title..."
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-content">Content</Label>
                      <Textarea
                        id="edit-content"
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        placeholder="Write your note here..."
                        rows={8}
                        maxLength={5000}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                      <Input
                        id="edit-tags"
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                        placeholder="work, ideas, personal..."
                        maxLength={200}
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate tags with commas
                      </p>
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
            <DialogTitle>Delete Note?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedNote?.title}"? This action cannot be
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
              {isSubmitting ? "Deleting..." : "Delete Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
