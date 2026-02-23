import Link from "@/components/navigation/ref-link";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Page Not Found</CardTitle>
          <CardDescription>
            The page you are looking for does not exist or may have been moved.
          </CardDescription>
          <div className="pt-2">
            <Button asChild size="sm">
              <Link href="/market/funds">Back to Funds</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
    </section>
  );
}
