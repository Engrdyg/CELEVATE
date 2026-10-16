import type { Metadata } from "next";
import { Onboarding } from "@/components/onboarding/onboarding";

export const metadata: Metadata = { title: "Set up your review" };

export default function OnboardingPage() {
  return <Onboarding />;
}
