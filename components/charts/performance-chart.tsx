"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PerformancePoint = {
  date: string;
  value: number;
};

function formatValue(value: number, fractionDigits: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function formatTickDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${month}/${day}/${year.slice(2)}`;
}

type PerformanceChartProps = {
  points?: PerformancePoint[];
  seriesLabel?: string;
  fractionDigits?: number;
  yAxisWidth?: number;
};

export function PerformanceChart({
  points,
  seriesLabel = "Value",
  fractionDigits = 3,
  yAxisWidth = 56,
}: PerformanceChartProps) {
  const chartPoints = points ?? [];
  const numericValues = chartPoints
    .map((item) => item.value)
    .filter((value) => Number.isFinite(value));
  const yDomain: [number, number] =
    numericValues.length > 0
      ? (() => {
          const minValue = Math.min(...numericValues);
          const maxValue = Math.max(...numericValues);
          const range = maxValue - minValue;
          const reference = Math.max(Math.abs(maxValue), Math.abs(minValue), 1);
          const padding = range > 0 ? range * 0.05 : reference * 0.05;
          return [minValue - padding, maxValue + padding];
        })()
      : [0, 1];

  return (
    <div className="space-y-4">
      <div className="h-64 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartPoints}
            margin={{ left: 0, right: 16, top: 16, bottom: 0 }}
            accessibilityLayer={false}
          >
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatTickDate}
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              minTickGap={20}
            />
            <YAxis
              dataKey="value"
              tickFormatter={(value: number) =>
                Number.isFinite(value) ? formatValue(value, fractionDigits) : "—"
              }
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              width={yAxisWidth}
              domain={yDomain}
            />
            <Tooltip
              formatter={(value) => {
                const numericValue =
                  typeof value === "number"
                    ? value
                    : typeof value === "string"
                      ? Number(value)
                      : NaN;
                if (!Number.isFinite(numericValue)) {
                  return ["—", seriesLabel];
                }
                return [formatValue(numericValue, fractionDigits), seriesLabel];
              }}
              labelFormatter={(label) => `Date: ${String(label)}`}
              contentStyle={{
                borderColor: "var(--border-strong)",
                backgroundColor: "var(--surface)",
                borderRadius: "8px",
                color: "var(--text)",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--primary)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
