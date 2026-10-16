import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/learn/skeletons";
import { getSubject, subjects } from "@/lib/content";
import { SubjectDetail } from "@/components/learn/subject-detail";

export function generateStaticParams() {
  return subjects.map((s) => ({ subjectId: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/subjects/[subjectId]">): Promise<Metadata> {
  const { subjectId } = await params;
  return { title: getSubject(subjectId)?.name ?? "Subject" };
}

export default function SubjectPage({ params }: PageProps<"/subjects/[subjectId]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SubjectContent params={params} />
    </Suspense>
  );
}

async function SubjectContent({ params }: { params: PageProps<"/subjects/[subjectId]">["params"] }) {
  const { subjectId } = await params;
  const subject = getSubject(subjectId);
  if (!subject) notFound();
  return <SubjectDetail subjectId={subject.id} />;
}
