"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TodosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
        <p className="text-muted-foreground">
          Manage your tasks and to-do items
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Todo features will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
