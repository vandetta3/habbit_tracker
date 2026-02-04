"use client";

import Link from "next/link";
import { X, LogOut, User, FileText, Wallet, Apple } from "lucide-react";
import { db } from "@/lib/instant";

interface MoreMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MoreMenu({ open, onClose }: MoreMenuProps) {
  const { user } = db.useAuth();

  const handleLogout = () => {
    db.auth.signOut();
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-2xl shadow-2xl lg:hidden animate-slide-up max-h-[80vh] overflow-y-auto">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold">More</h2>
            <button
              type="button"
              className="-m-2.5 p-2.5 text-muted-foreground"
              onClick={onClose}
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* User Info */}
          <div className="border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Signed in as</p>
                <p className="text-sm text-muted-foreground">{user?.email || "Guest"}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-6 py-4 space-y-2">
            <Link href="/nutrition" onClick={onClose}>
              <div className="flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm font-medium hover:bg-accent transition-colors">
                <Apple className="h-5 w-5 text-muted-foreground" />
                <span>Nutrition</span>
              </div>
            </Link>
            <Link href="/notes" onClick={onClose}>
              <div className="flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm font-medium hover:bg-accent transition-colors">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span>Notes</span>
              </div>
            </Link>
            <Link href="/expenses" onClick={onClose}>
              <div className="flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm font-medium hover:bg-accent transition-colors">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                <span>Expenses</span>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm font-medium hover:bg-accent transition-colors"
            >
              <LogOut className="h-5 w-5 text-muted-foreground" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
