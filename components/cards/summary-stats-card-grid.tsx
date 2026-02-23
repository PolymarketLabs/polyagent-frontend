import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export type SummaryStatItem = {
  label: string;
  value: ReactNode;
  valueClassName?: string;
};

type SummaryStatsCardGridProps = {
  items: SummaryStatItem[];
  loading?: boolean;
};

export function SummaryStatsCardGrid({ items, loading = false }: SummaryStatsCardGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="text-xs tracking-wide text-[var(--text-muted)]">{item.label}</div>
            {loading ? (
              <div className="mt-2 h-7 w-20 animate-pulse rounded bg-[var(--surface-muted)]" />
            ) : (
              <div
                className={`mt-2 text-lg font-semibold ${item.valueClassName ?? "text-[var(--text)]"}`}
              >
                {item.value}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
