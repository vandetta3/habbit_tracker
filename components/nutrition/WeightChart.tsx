"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { NutritionEntry } from "@/types";

interface WeightChartProps {
  entries: NutritionEntry[];
}

export function WeightChart({ entries }: WeightChartProps) {
  // Sort entries by date and prepare data
  const data = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: entry.bodyWeight,
    }));
  
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
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
          label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
          domain={['dataMin - 2', 'dataMax + 2']}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={{ fill: '#8b5cf6', r: 4 }}
          name="Body Weight (kg)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
