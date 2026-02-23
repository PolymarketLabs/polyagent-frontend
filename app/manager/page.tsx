import { ManagedFundsSection } from "@/app/manager/_components/managed-funds-section";
import { ManagerSummaryCards } from "@/app/manager/_components/manager-summary-cards";
import { ServerAuthGuard } from "@/components/auth/server-auth-guard";
import { PageHeaderCard } from "@/components/cards/page-header-card";

export default async function ManagerPage() {
  return (
    <ServerAuthGuard requiredRole="MANAGER">
      <PageHeaderCard
        eyebrow="Manager Console"
        title="Fund Management"
        description="Manager-facing table scaffold now uses shadcn components and TanStack state model."
      />

      <ManagerSummaryCards />

      <ManagedFundsSection />
    </ServerAuthGuard>
  );
}
