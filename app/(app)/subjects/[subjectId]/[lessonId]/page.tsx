import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Hammer } from "lucide-react";
import { getLesson, getSubject, lessonOutline } from "@/lib/content";
import { LessonBody } from "@/components/learn/lesson-body";
import { LessonReader } from "@/components/learn/lesson-reader";
import { PageContainer } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { ReaderSkeleton } from "@/components/learn/skeletons";

export function generateStaticParams() {
  return lessonOutline.map((l) => ({ subjectId: l.subjectId, lessonId: l.id }));
}

export async function generateMetadata({ params }: PageProps<"/subjects/[subjectId]/[lessonId]">): Promise<Metadata> {
  const { lessonId } = await params;
  const meta = lessonOutline.find((l) => l.id === lessonId);
  return { title: meta?.title ?? "Lesson", description: meta?.summary };
}

export default function LessonPage({ params }: PageProps<"/subjects/[subjectId]/[lessonId]">) {
  return (
    <Suspense fallback={<ReaderSkeleton />}>
      <LessonContent params={params} />
    </Suspense>
  );
}

async function LessonContent({ params }: { params: PageProps<"/subjects/[subjectId]/[lessonId]">["params"] }) {
  const { subjectId, lessonId } = await params;
  const meta = lessonOutline.find((l) => l.id === lessonId && l.subjectId === subjectId);
  if (!meta) notFound();
  const lesson = getLesson(lessonId);

  if (!lesson) {
    const subject = getSubject(subjectId)!;
    return (
      <PageContainer>
        <EmptyState
          icon={Hammer}
          title={`${meta.title} is in preparation`}
          description="This lesson is listed in the syllabus outline but hasn't been published yet. Practice questions on the topic may already be available."
          action={
            <>
              <Button asChild variant="outline">
                <Link href={`/subjects/${subjectId}`}>
                  <ArrowLeft /> Back to {subject.code}
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/practice?subject=${subjectId}`}>Practice {subject.code}</Link>
              </Button>
            </>
          }
        />
      </PageContainer>
    );
  }

  return (
    <LessonReader lessonId={lesson.id}>
      <LessonBody lesson={lesson} />
    </LessonReader>
  );
}
