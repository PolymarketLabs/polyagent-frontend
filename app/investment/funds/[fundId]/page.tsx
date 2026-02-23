import { notFound } from "next/navigation";

import { InvestmentDetailContent } from "@/app/investment/funds/[fundId]/_components/investment-detail-content";
import { ServerAuthGuard } from "@/components/auth/server-auth-guard";

type InvestmentDetailPageProps = {
  params: Promise<{
    fundId: string;
  }>;
};

export default async function InvestmentDetailPage({ params }: InvestmentDetailPageProps) {
  const { fundId: rawFundId } = await params;
  const fundId = Number(rawFundId);

  if (!Number.isInteger(fundId) || fundId <= 0) {
    notFound();
  }

  return (
    <ServerAuthGuard>
      <InvestmentDetailContent fundId={fundId} />
    </ServerAuthGuard>
  );
}
