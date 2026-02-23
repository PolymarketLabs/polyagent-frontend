"use client";

import Link from "@/components/navigation/ref-link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
};

export default function GlobalErrorPage({ error }: GlobalErrorPageProps) {
  useEffect(() => {
    console.error("Unhandled page error:", error);
  }, [error]);

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Something Went Wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. If the issue persists, please contact the administrator.
          </CardDescription>
          <div className="pt-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/market/funds">Back to Funds</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
    </section>
  );
}
