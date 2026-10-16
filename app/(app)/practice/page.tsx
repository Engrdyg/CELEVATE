import type { Metadata } from "next";
import { Suspense } from "react";
import { PracticeView } from "@/components/practice/practice-view";
import { PageSkeleton } from "@/components/learn/skeletons";

export const metadata: Metadata = { title: "Practice Questions" };

export default function PracticePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PracticeView />
    </Suspense>
  );
}
