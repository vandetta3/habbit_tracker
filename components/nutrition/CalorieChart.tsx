"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import type { NutritionEntry } from "@/types";

interface CalorieChartProps {
  entries: NutritionEntry[];
  target?: number;
}

export function CalorieChart({ entries, target }: CalorieChartProps) {
  // Sort entries by date and prepare data
  const data = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(entry => {
      let fill = '#3b82f6'; // default blue
      
      if (target) {
        const diff = Math.abs(entry.caloriesIntake - target);
        const percentage = (diff / target) * 100;
        
        if (percentage <= 10) {
          fill = '#10b981'; // green - within 10%
        } else if (percentage <= 20) {
          fill = '#f59e0b'; // yellow - 10-20% variance
        } else {
          fill = '#ef4444'; // red - >20% variance
        }
      }
      
      return {
        date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calories: entry.caloriesIntake,
        fill,
      };
    });
  
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          label={{ value: 'Calories (kcal)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
        />
        <Legend />
        {target && (
          <ReferenceLine
            y={target}
            stroke="#8b5cf6"
            strokeDasharray="3 3"
            label={{ value: 'Target', position: 'right', fill: '#8b5cf6' }}
          />
        )}
        <Bar
          dataKey="calories"
          name="Calorie Intake (kcal)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
