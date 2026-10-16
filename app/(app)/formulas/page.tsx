import type { Metadata } from "next";
import { Suspense } from "react";
import { FormulaLibrary } from "@/components/learn/formula-library";
import { PageSkeleton } from "@/components/learn/skeletons";

export const metadata: Metadata = { title: "Formula Library" };

export default function FormulasPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <FormulaLibrary />
    </Suspense>
  );
}
