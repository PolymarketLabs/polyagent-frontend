import type { ReactNode } from "react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PageHeaderCardProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
};

export function PageHeaderCard({ eyebrow, title, description, className }: PageHeaderCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {eyebrow}
          </p>
        ) : null}
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
    </Card>
  );
}
