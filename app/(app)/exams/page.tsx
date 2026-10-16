import type { Metadata } from "next";
import { Suspense } from "react";
import { ExamHub } from "@/components/exam/exam-hub";
import { PageSkeleton } from "@/components/learn/skeletons";

export const metadata: Metadata = { title: "Mock Board Exams" };

export default function ExamsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ExamHub />
    </Suspense>
  );
}
