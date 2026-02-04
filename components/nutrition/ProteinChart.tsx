"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import type { NutritionEntry } from "@/types";

interface ProteinChartProps {
  entries: NutritionEntry[];
  target?: number;
}

export function ProteinChart({ entries, target }: ProteinChartProps) {
  // Sort entries by date and prepare data
  const data = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      protein: entry.proteinIntake,
    }));
  
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available
      </div>
    );
  }
  
  // Calculate weekly average
  const avgProtein = data.reduce((sum, d) => sum + d.protein, 0) / data.length;
  
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
          label={{ value: 'Protein (g)', angle: -90, position: 'insideLeft' }}
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
        <ReferenceLine
          y={avgProtein}
          stroke="#10b981"
          strokeDasharray="5 5"
          label={{ value: `Avg: ${avgProtein.toFixed(0)}g`, position: 'right', fill: '#10b981' }}
        />
        <Line
          type="monotone"
          dataKey="protein"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ fill: '#ef4444', r: 4 }}
          name="Protein Intake (g)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
