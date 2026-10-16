import type { Metadata } from "next";
import { SubjectsIndex } from "@/components/learn/subjects-index";

export const metadata: Metadata = { title: "Subjects" };

export default function SubjectsPage() {
  return <SubjectsIndex />;
}
