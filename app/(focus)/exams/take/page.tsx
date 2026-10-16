import type { Metadata } from "next";
import { ExamSessionView } from "@/components/exam/exam-session";

export const metadata: Metadata = { title: "Mock Board Exam" };

export default function TakeExamPage() {
  return <ExamSessionView />;
}
