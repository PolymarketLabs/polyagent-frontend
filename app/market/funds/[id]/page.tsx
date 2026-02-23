import { notFound } from "next/navigation";

import {
  getMarketFundDetail,
  getMarketFundPerformance,
  listMarketFundInvestorRankings,
} from "@/lib/api/services/market";
import {
  formatAddress,
  formatNumber,
  formatPct,
  formatUsd,
  formatUtcDateTime,
} from "@/lib/format/fund";
import { FundTransactionsTable } from "@/components/fund/fund-transactions-table";
import {
  FundOverviewGrid,
  FundRulesGrid,
  FundStrategyGrid,
} from "@/components/fund/fund-detail-sections";
import { FundPositionsTable } from "@/components/fund/fund-positions-table";
import { TradePanelCard } from "@/components/cards/trade-panel-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PerformanceChart } from "@/components/charts/performance-chart";

function getStatusBadgeVariant(status: string): "success" | "warning" | "destructive" | "default" {
  if (status === "RUNNING") {
    return "success";
  }
  if (status === "STOPPED") {
    return "destructive";
  }
  return "default";
}

function formatStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

type FundDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MarketFundDetailPage({ params }: FundDetailPageProps) {
  const { id } = await params;
  const fundId = Number(id);

  if (!Number.isInteger(fundId) || fundId <= 0) {
    notFound();
  }

  const [fund, performance, rankingData] = await Promise.all([
    getMarketFundDetail(fundId),
    getMarketFundPerformance(fundId),
    listMarketFundInvestorRankings(fundId, { page: 1, pageSize: 10 }),
  ]);

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

  const rulesKpis = [
    { label: "Minimum Deposit", value: formatUsd(fund.minimumDeposit) },
    { label: "Minimum Redeem", value: formatUsd(fund.minimumRedeem) },
    { label: "Management Fee", value: `${(fund.managementFeeRate * 100).toFixed(1)}%` },
    { label: "Performance Fee", value: `${(fund.performanceFeeRate * 100).toFixed(1)}%` },
    {
      label: "Auto Stop-Loss",
      value: `${(fund.autoStopLossPct * 100).toFixed(1)}%`,
      fullRow: true,
    },
  ];

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Fund Detail
              </p>
              <Badge variant={getStatusBadgeVariant(fund.status)}>
                {formatStatus(fund.status)}
              </Badge>
              <Badge>Fund #{fund.fundId}</Badge>
            </div>
            <CardTitle>{fund.fundName}</CardTitle>
            <CardDescription>{fund.fundDescription}</CardDescription>
            <div className="space-y-1 pt-1 text-xs text-[var(--text-muted)]">
              <div>
                Vault: <span className="font-mono">{fund.vaultAddress}</span>
              </div>
              <div>
                Manager: <span className="font-mono">{fund.manager}</span>
              </div>
              <div>Created At: {formatUtcDateTime(fund.createdAt)}</div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
            <CardDescription>Core fund indicators for quick decision making.</CardDescription>
          </CardHeader>
          <CardContent>
            <FundOverviewGrid items={overviewKpis} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Strategy</CardTitle>
            <CardDescription>Target markets and portfolio construction approach.</CardDescription>
          </CardHeader>
          <CardContent>
            <FundStrategyGrid
              riskProfile={fund.riskProfile}
              marketUniverse={fund.marketUniverse}
              rebalanceRule={fund.rebalanceRule}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rules</CardTitle>
            <CardDescription>Investment thresholds and fee settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <FundRulesGrid items={rulesKpis} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance (NAV)</CardTitle>
            <CardDescription>Daily performance line chart preview with NAV data.</CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceChart points={performance} seriesLabel="NAV" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Positions</CardTitle>
            <CardDescription>Top prediction markets by current portfolio weight.</CardDescription>
          </CardHeader>
          <CardContent>
            <FundPositionsTable fundId={fundId} pageSize={5} showPagination={false} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Investors</CardTitle>
            <CardDescription>Ranked by holding share in this fund.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Investor</TableHead>
                  <TableHead>Shares</TableHead>
                  <TableHead>Share of Fund</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankingData.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>#{item.rank}</TableCell>
                    <TableCell className="font-mono" title={item.investor}>
                      {formatAddress(item.investor)}
                    </TableCell>
                    <TableCell>{formatNumber(item.holdingShares)}</TableCell>
                    <TableCell className="text-[var(--text)]">
                      {formatPct(item.holdingSharePct)}
                    </TableCell>
                  </TableRow>
                ))}
                {rankingData.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-[var(--text-muted)]">
                      No investor rankings
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <CardDescription>Recent deposit and redeem records for this fund.</CardDescription>
          </CardHeader>
          <CardContent>
            <FundTransactionsTable fundId={fundId} pageSize={5} showPagination={false} />
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-28 lg:h-fit">
        <TradePanelCard
          vaultAddress={fund.vaultAddress}
          minimumDeposit={fund.minimumDeposit}
          minimumRedeem={fund.minimumRedeem}
          currentNav={fund.currentNav}
        />
      </aside>
    </section>
  );
}
