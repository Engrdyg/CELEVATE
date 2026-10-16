import type { Metadata } from "next";
import { Suspense } from "react";
import { ExamResults } from "@/components/exam/exam-results";
import { PageSkeleton } from "@/components/learn/skeletons";

export const metadata: Metadata = { title: "Exam Results" };

export default function ExamResultsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ExamResults />
    </Suspense>
  );
}
