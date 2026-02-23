import { MarketFundsTable } from "@/app/market/funds/_components/market-funds-table";
import { MarketSummaryCards } from "@/app/market/funds/_components/market-summary-cards";
import { PageHeaderCard } from "@/components/cards/page-header-card";
import { SectionCard } from "@/components/cards/section-card";

export default function FundsPage() {
  return (
    <>
      <PageHeaderCard
        className="bg-[var(--surface)]"
        eyebrow="Fund Discovery"
        title="Fund List"
        description="Explore prediction market funds and pick the ones that match your investment strategy."
      />

      <MarketSummaryCards />

      <SectionCard
        title="Funds"
        description="Click View to open a detail page."
        headerClassName="pb-3"
        titleClassName="text-base"
      >
        <MarketFundsTable />
      </SectionCard>
    </>
  );
}
