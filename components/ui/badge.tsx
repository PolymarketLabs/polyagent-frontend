import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition",
  {
    variants: {
      variant: {
        default: "border-[var(--border-strong)] bg-[var(--surface-muted)] text-[var(--text-muted)]",
        success:
          "border-[var(--success-soft-border)] bg-[var(--success-soft-bg)] text-[var(--success)]",
        warning:
          "border-[var(--warning-soft-border)] bg-[var(--warning-soft-bg)] text-[var(--warning)]",
        destructive:
          "border-[var(--danger-soft-border)] bg-[var(--danger-soft-bg)] text-[var(--danger)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
