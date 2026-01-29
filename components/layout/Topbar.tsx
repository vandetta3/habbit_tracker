"use client";

import { db } from "@/lib/instant";
import { User } from "lucide-react";

export function Topbar() {
  const { user } = db.useAuth();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          <h2 className="text-xl font-semibold lg:hidden">Habit Builder</h2>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* User menu */}
          <div className="flex items-center gap-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden text-sm font-medium sm:inline">
              {user?.email || "Guest"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
