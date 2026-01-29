"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Target, CheckSquare, Wallet, Menu } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Habits", href: "/habits", icon: Target },
  { name: "Todos", href: "/todos", icon: CheckSquare },
  { name: "Expenses", href: "/expenses", icon: Wallet },
  { name: "More", href: "#", icon: Menu, isMenu: true },
];

interface MobileNavProps {
  onMenuClick: () => void;
}

export function MobileNav({ onMenuClick }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isMenu) {
            return (
              <button
                key={item.name}
                onClick={onMenuClick}
                className="flex flex-col items-center justify-center gap-1 min-w-0 flex-1 py-2 transition-colors"
              >
                <Icon className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">
                  {item.name}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-0 flex-1 py-2 transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-6 w-6", isActive && "text-primary")} />
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive && "text-primary"
                )}
              >
                {item.name}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
