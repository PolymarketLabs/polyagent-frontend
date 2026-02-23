import { Card, CardContent } from "@/components/ui/card";

export type FundOverviewItem = {
  label: string;
  value: string;
  tone?: string;
};

export type FundRulesItem = {
  label: string;
  value: string;
  fullRow?: boolean;
};

type FundOverviewGridProps = {
  items: FundOverviewItem[];
};

type FundStrategyGridProps = {
  riskProfile: string;
  marketUniverse: string | string[];
  rebalanceRule: string;
};

type FundRulesGridProps = {
  items: FundRulesItem[];
};

export function FundOverviewGrid({ items }: FundOverviewGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="text-xs tracking-wide text-[var(--text-muted)]">{item.label}</div>
            <div className={`mt-2 text-lg font-semibold ${item.tone ?? "text-[var(--text)]"}`}>
              {item.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function FundStrategyGrid({
  riskProfile,
  marketUniverse,
  rebalanceRule,
}: FundStrategyGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
        <p className="text-xs text-[var(--text-muted)]">Risk Profile</p>
        <p className="mt-1 text-sm font-semibold text-[var(--text)]">{riskProfile}</p>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
        <p className="text-xs text-[var(--text-muted)]">Market Universe</p>
        <p className="mt-1 text-sm font-semibold text-[var(--text)]">
          {Array.isArray(marketUniverse) ? marketUniverse.join(", ") : marketUniverse}
        </p>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 md:col-span-2">
        <p className="text-xs text-[var(--text-muted)]">Rebalance Rule</p>
        <p className="mt-1 text-sm font-semibold text-[var(--text)]">{rebalanceRule}</p>
      </div>
    </div>
  );
}

export function FundRulesGrid({ items }: FundRulesGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 ${
            item.fullRow ? "md:col-span-2" : ""
          }`}
        >
          <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
          <p className="mt-1 text-sm font-semibold text-[var(--text)]">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
