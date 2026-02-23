import { getAuthSessionStatus, type AuthSession } from "@/lib/api/services/auth";

export async function getServerAuthSession(): Promise<AuthSession | null> {
  try {
    const session = await getAuthSessionStatus();
    if (!session.authenticated || !session.address) {
      return null;
    }
    return {
      address: session.address,
      role: session.role,
    };
  } catch {
    return null;
  }
}
