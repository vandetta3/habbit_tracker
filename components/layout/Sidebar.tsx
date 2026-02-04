"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Target,
  CheckSquare,
  FileText,
  Wallet,
  Timer,
  Apple,
  LogOut,
} from "lucide-react";
import { db } from "@/lib/instant";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Habits", href: "/habits", icon: Target },
  { name: "Nutrition", href: "/nutrition", icon: Apple },
  { name: "Timers", href: "/timers", icon: Timer },
  { name: "Todos", href: "/todos", icon: CheckSquare },
  { name: "Expenses", href: "/expenses", icon: Wallet },
  { name: "Notes", href: "/notes", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    db.auth.signOut();
  };

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col gap-y-5 overflow-y-auto border-r bg-card px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Image 
            src="/dailystacklogo.png" 
            alt="Daily Stack" 
            width={180} 
            height={40}
            className="h-10 w-auto"
            priority
          />
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <button
                onClick={handleLogout}
                className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}
