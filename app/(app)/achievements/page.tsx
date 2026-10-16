import type { Metadata } from "next";
import { AchievementsView } from "@/components/progress/achievements-view";

export const metadata: Metadata = { title: "Achievements" };

export default function Page() {
  return <AchievementsView />;
}
