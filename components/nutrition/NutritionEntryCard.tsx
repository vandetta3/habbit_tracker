"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Beef, Droplet, Moon, Weight, Calendar } from "lucide-react";
import type { NutritionEntry } from "@/types";
import { formatDateForDisplay } from "@/lib/date-utils";

interface NutritionEntryCardProps {
  entry: NutritionEntry;
}

export function NutritionEntryCard({ entry }: NutritionEntryCardProps) {
  return (
    <Link href={`/nutrition/${entry.id}/edit`}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatDateForDisplay(entry.date)}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {entry.bodyWeight} kg
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <Flame className="h-4 w-4" />
              </div>
              <div className="text-sm">
                <div className="font-medium">{entry.caloriesIntake} kcal</div>
                <div className="text-xs text-muted-foreground">Calories</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Beef className="h-4 w-4" />
              </div>
              <div className="text-sm">
                <div className="font-medium">{entry.proteinIntake}g</div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Droplet className="h-4 w-4" />
              </div>
              <div className="text-sm">
                <div className="font-medium">{entry.waterIntake}L</div>
                <div className="text-xs text-muted-foreground">Water</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Moon className="h-4 w-4" />
              </div>
              <div className="text-sm">
                <div className="font-medium">{entry.sleepHours}h</div>
                <div className="text-xs text-muted-foreground">Sleep</div>
              </div>
            </div>
          </div>
          
          {entry.notes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground italic line-clamp-2">
                {entry.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
