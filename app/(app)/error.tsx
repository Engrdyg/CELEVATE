"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="mx-auto max-w-page px-4 py-16">
      <ErrorState
        title="This page couldn't load"
        description={
          <>
            Something unexpected happened. Your progress is safe in this browser.
            {error.digest && <span className="mt-1 block font-mono text-[11px] text-faint">Reference: {error.digest}</span>}
          </>
        }
        action={
          <div className="flex gap-2">
            <Button onClick={() => retry()}>
              <RotateCcw /> Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to Overview</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
