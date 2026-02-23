import type { ReactNode } from "react";
import { PageSection } from "@/components/layout/page-section";

type MarketLayoutProps = {
  children: ReactNode;
};

export default function MarketLayout({ children }: MarketLayoutProps) {
  return <PageSection>{children}</PageSection>;
}
