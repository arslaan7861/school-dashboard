"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background p-6">
      <Card className="max-w-md w-full border-destructive/20 shadow-lg">
        <CardContent className="pt-10 pb-10 text-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">Something went wrong!</h2>
          <p className="text-muted-foreground mb-8">
            An unexpected error occurred. We've been notified and are looking into it.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
            <Button onClick={() => reset()} variant="default">
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
