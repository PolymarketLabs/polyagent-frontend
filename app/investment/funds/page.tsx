import { ServerAuthGuard } from "@/components/auth/server-auth-guard";
import { InvestmentFundsTable } from "@/app/investment/funds/_components/investment-funds-table";
import { InvestmentSummaryCards } from "@/app/investment/funds/_components/investment-summary-cards";
import { PageHeaderCard } from "@/components/cards/page-header-card";
import { SectionCard } from "@/components/cards/section-card";

export default async function InvestmentFundsPage() {
  return (
    <ServerAuthGuard>
      <PageHeaderCard
        eyebrow="Portfolio"
        title="My Investments"
        description="Track your invested funds, monitor NAV changes, and review portfolio performance."
      />

      <InvestmentSummaryCards />

      <SectionCard
        title="Investment Positions"
        description="Click Details to open a detail page."
        headerClassName="pb-3"
        titleClassName="text-base"
      >
        <InvestmentFundsTable />
      </SectionCard>
    </ServerAuthGuard>
  );
}
