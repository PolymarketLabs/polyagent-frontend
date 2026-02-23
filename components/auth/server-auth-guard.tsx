import type { ReactNode } from "react";

import type { UserRole } from "@/lib/api/services/auth";
import { getServerAuthSession } from "@/lib/auth/server-session";
import { AccessDeniedCard, AuthenticationRequiredCard } from "@/components/auth/auth-state-cards";

type ServerAuthGuardProps = {
  children: ReactNode;
  requiredRole?: UserRole;
};

export async function ServerAuthGuard({ children, requiredRole }: ServerAuthGuardProps) {
  const session = await getServerAuthSession();

  if (!session) {
    return <AuthenticationRequiredCard />;
  }

  if (requiredRole && session.role !== requiredRole) {
    return <AccessDeniedCard />;
  }

  return <>{children}</>;
}
