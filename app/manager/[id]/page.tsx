import { notFound } from "next/navigation";

import { getMarketFundDetail, getMarketFundPerformance } from "@/lib/api/services/market";
import { formatPct, formatUsd } from "@/lib/format/fund";
import { EditableFundCards } from "./_components/editable-fund-cards";
import { ExecutionIntentsTable } from "./_components/execution-intents-table";
import { ManagerActionPanel } from "./_components/manager-action-panel";
import { FundOverviewGrid } from "@/components/fund/fund-detail-sections";
import { FundPositionsTable } from "@/components/fund/fund-positions-table";
import { FundTransactionsTable } from "@/components/fund/fund-transactions-table";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { SectionCard } from "@/components/cards/section-card";
import { ServerAuthGuard } from "@/components/auth/server-auth-guard";

type ManagerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ManagerDetailPage({ params }: ManagerDetailPageProps) {
  const { id } = await params;
  const fundId = Number(id);

  if (!Number.isInteger(fundId) || fundId <= 0) {
    notFound();
  }

  let fund: Awaited<ReturnType<typeof getMarketFundDetail>>;
  let performance: Awaited<ReturnType<typeof getMarketFundPerformance>>;
  try {
    [fund, performance] = await Promise.all([
      getMarketFundDetail(fundId),
      getMarketFundPerformance(fundId),
    ]);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      notFound();
    }
    throw error;
  }

  const overviewKpis = [
    { label: "Current NAV", value: formatUsd(fund.currentNav, 3) },
    {
      label: "Cumulative Return",
      value: formatPct(fund.cumulativeReturnPct),
      tone: fund.cumulativeReturnPct >= 0 ? "text-[var(--deposit)]" : "text-[var(--danger)]",
    },
    {
      label: "Max Drawdown",
      value: formatPct(fund.maxDrawdownPct),
      tone: "text-[var(--danger)]",
    },
    { label: "AUM", value: formatUsd(fund.aum) },
    { label: "Investor Count", value: new Intl.NumberFormat("en-US").format(fund.investorCount) },
  ];

  return (
    <ServerAuthGuard requiredRole="MANAGER">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <EditableFundCards
            fund={{
              fundId: fund.fundId,
              fundName: fund.fundName,
              fundDescription: fund.fundDescription,
              status: fund.status,
              vaultAddress: fund.vaultAddress,
              manager: fund.manager,
              createdAt: fund.createdAt,
              riskProfile: fund.riskProfile,
              marketUniverse: fund.marketUniverse,
              rebalanceRule: fund.rebalanceRule,
              minimumDeposit: fund.minimumDeposit,
              minimumRedeem: fund.minimumRedeem,
              managementFeeRate: fund.managementFeeRate,
              performanceFeeRate: fund.performanceFeeRate,
              autoStopLossPct: fund.autoStopLossPct,
            }}
            overviewContent={<FundOverviewGrid items={overviewKpis} />}
          />

          <SectionCard
            title="Performance (NAV)"
            description="Daily performance line chart preview with NAV data."
            headerClassName="pb-3"
            titleClassName="text-base"
          >
            <PerformanceChart points={performance} seriesLabel="NAV" />
          </SectionCard>

          <SectionCard
            title="Holdings"
            description="Top positions and current cash reserve."
            headerClassName="pb-3"
            titleClassName="text-base"
          >
            <FundPositionsTable fundId={fundId} />
          </SectionCard>

          <SectionCard
            title="Transactions"
            description="Recent investor deposit and redeem activity."
            headerClassName="pb-3"
            titleClassName="text-base"
          >
            <FundTransactionsTable fundId={fundId} />
          </SectionCard>

          <SectionCard
            title="Execution Intents"
            description="Queue and execution status of manager trade intents."
            headerClassName="pb-3"
            titleClassName="text-base"
          >
            <ExecutionIntentsTable fundId={fundId} />
          </SectionCard>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:h-fit">
          <ManagerActionPanel fundId={fundId} />
        </aside>
      </section>
    </ServerAuthGuard>
  );
}
