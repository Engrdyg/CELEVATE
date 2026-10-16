import type { Metadata } from "next";
import { ReviewView } from "@/components/review/review-view";

export const metadata: Metadata = { title: "My Review" };

export default function Page() {
  return <ReviewView />;
}
