import type { Metadata } from "next";
import { TutorView } from "@/components/tutor/tutor-view";

export const metadata: Metadata = { title: "AI Tutor" };

export default function Page() {
  return <TutorView />;
}
