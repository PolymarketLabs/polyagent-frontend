import type { ReactNode } from "react";
import { PageSection } from "@/components/layout/page-section";

type InvestmentLayoutProps = {
  children: ReactNode;
};

export default function InvestmentLayout({ children }: InvestmentLayoutProps) {
  return <PageSection>{children}</PageSection>;
}
