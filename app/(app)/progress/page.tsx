import type { Metadata } from "next";
import { ProgressView } from "@/components/progress/progress-view";

export const metadata: Metadata = { title: "My Progress" };

export default function Page() {
  return <ProgressView />;
}
