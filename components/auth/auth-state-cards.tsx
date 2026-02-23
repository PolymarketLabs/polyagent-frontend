import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthenticationRequiredCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Required</CardTitle>
        <CardDescription>
          Connect your wallet and sign in with Ethereum to view this page.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export function AccessDeniedCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Denied</CardTitle>
        <CardDescription>
          Your current role does not have permission to view this page.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
