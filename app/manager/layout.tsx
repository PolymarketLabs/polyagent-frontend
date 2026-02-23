import type { ReactNode } from "react";
import { PageSection } from "@/components/layout/page-section";

type ManagerLayoutProps = {
  children: ReactNode;
};

export default function ManagerLayout({ children }: ManagerLayoutProps) {
  return <PageSection>{children}</PageSection>;
}
