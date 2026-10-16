"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlarmClock,
  ArrowRight,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  History,
  Layers,
  ListChecks,
  PlayCircle,
  Settings2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input, Label, FieldHint } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/states";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { EXAM_PRESETS, pickQuestions, poolSize, type ExamPreset } from "@/lib/exams";
import { subjects, type SubjectId } from "@/lib/content";
import { activeExam, scoreExam, submittedExams } from "@/lib/analytics";
import { useProgress, type ExamConfig } from "@/lib/store/progress";
import { useStoreReady } from "@/hooks/use-hydrated";
import { SUBJECT_COLOR } from "@/lib/subject-style";
import { cn, formatDuration } from "@/lib/utils";

export function ExamHub() {
  const router = useRouter();
  const params = useSearchParams();
  const ready = useStoreReady();
  const state = useProgress();
  const startExam = useProgress((s) => s.startExam);
  const discardExam = useProgress((s) => s.discardExam);
  const scheduleExam = useProgress((s) => s.scheduleExam);

  const [pending, setPending] = useState<ExamConfig | null>(() => {
    const id = params.get("preset");
    return EXAM_PRESETS.find((p) => p.id === id)?.config ?? null;
  });
  const [scheduleFor, setScheduleFor] = useState<ExamPreset | null>(null);

  // Custom builder
  const [cSubjects, setCSubjects] = useState<SubjectId[]>(["mste", "hge", "psad"]);
  const [cCount, setCCount] = useState("20");
  const [cMinutes, setCMinutes] = useState("40");
  const [cAuto, setCAuto] = useState(true);
  const [cReveal, setCReveal] = useState(true);
  const available = poolSize(cSubjects);

  const active = ready ? activeExam(state) : null;
  const history = useMemo(() => (ready ? submittedExams(state).map(scoreExam).reverse() : []), [ready, state]);

  const begin = (config: ExamConfig) => {
    const ids = pickQuestions(config);
    if (!ids.length) {
      toast.error("No questions available for that selection");
      return;
    }
    startExam({ ...config, questionCount: ids.length }, ids);
    router.push("/exams/take");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Mock Board Exams"
        description="Timed, distraction-free examinations that follow strict exam rules: no answers or solutions until you submit."
      />

      {active && (
        <Card className="mb-6 flex flex-col gap-4 border-iris/40 bg-iris-soft p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-iris-strong text-white">
              <AlarmClock className="size-5" />
            </span>
            <div>
              <p className="font-display text-[15px] font-semibold">Exam in progress: {active.config.title}</p>
              <p className="text-[13px] text-muted">
                {Object.keys(active.answers).length}/{active.questionIds.length} answered · autosaved in this browser
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                discardExam(active.id);
                toast("Exam discarded");
              }}
            >
              <Trash2 /> Discard
            </Button>
            <Button asChild variant="iris">
              <Link href="/exams/take">
                <PlayCircle /> Resume exam
              </Link>
            </Button>
          </div>
        </Card>
      )}

      <h2 className="mb-3 font-display text-base font-semibold">Exam presets</h2>
      <Stagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {EXAM_PRESETS.map((p) => (
          <StaggerItem key={p.id}>
            <Card className="flex h-full flex-col p-5 transition-colors hover:border-line-strong">
              <div className="flex items-center gap-1.5">
                {p.config.subjects.map((s) => (
                  <span key={s} className="h-1.5 w-6 rounded-full" style={{ background: SUBJECT_COLOR[s] }} aria-hidden />
                ))}
              </div>
              <h3 className="mt-4 font-display text-[15px] font-semibold">{p.title}</h3>
              <p className="mt-1 flex-1 text-[13px] leading-5 text-muted">{p.description}</p>
              <div className="mt-4 flex gap-3 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <ListChecks className="size-3.5" /> {p.config.questionCount} items
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" /> {p.config.minutes} min
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => setPending(p.config)}>
                  Start
                </Button>
                <Button size="icon-sm" variant="outline" aria-label={`Schedule ${p.title}`} onClick={() => setScheduleFor(p)}>
                  <CalendarPlus />
                </Button>
              </div>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Build a custom exam</CardTitle>
              <CardDescription>Choose subjects, length and rules</CardDescription>
            </div>
            <Settings2 className="size-5 text-muted" aria-hidden />
          </CardHeader>
          <CardContent className="space-y-5">
            <fieldset>
              <legend className="mb-2 text-xs font-medium text-muted">Subjects</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {subjects.map((s) => {
                  const on = cSubjects.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      onClick={() => setCSubjects((cur) => (on ? cur.filter((x) => x !== s.id) : [...cur, s.id]))}
                      className={cn("flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-[13px] transition-colors", on ? "border-primary bg-primary-soft" : "border-line hover:border-line-strong")}
                    >
                      <span className={cn("grid size-4 place-items-center rounded border", on ? "border-primary bg-primary-strong text-primary-fg" : "border-line-strong")}>
                        {on && <CheckCircle2 className="size-3" />}
                      </span>
                      <span className="font-medium">{s.code}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted">Questions</p>
                <Segmented size="sm" label="Number of questions" value={cCount} onChange={setCCount} options={["10", "20", "30", "45"].map((v) => ({ value: v, label: v }))} />
                <FieldHint>{available} available in selection</FieldHint>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted">Time limit</p>
                <Segmented size="sm" label="Time limit in minutes" value={cMinutes} onChange={setCMinutes} options={["20", "40", "60", "90"].map((v) => ({ value: v, label: `${v}m` }))} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2.5">
                <span>
                  <span className="block text-[13px] font-medium">Auto-submit when time expires</span>
                  <span className="block text-xs text-muted">Mirrors strict board exam conditions</span>
                </span>
                <Switch checked={cAuto} onCheckedChange={setCAuto} />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2.5">
                <span>
                  <span className="block text-[13px] font-medium">Show solutions in results</span>
                  <span className="block text-xs text-muted">Answers are never shown during the exam</span>
                </span>
                <Switch checked={cReveal} onCheckedChange={setCReveal} />
              </label>
            </div>
            <Button
              className="w-full"
              disabled={cSubjects.length === 0 || available === 0}
              onClick={() =>
                setPending({
                  title: `Custom · ${cSubjects.map((s) => subjects.find((x) => x.id === s)?.code).join(" + ")}`,
                  subjects: cSubjects,
                  questionCount: Math.min(Number(cCount), available),
                  minutes: Number(cMinutes),
                  autoSubmit: cAuto,
                  revealSolutions: cReveal,
                  shuffle: true,
                })
              }
            >
              Review instructions & start <ArrowRight />
            </Button>
            {Number(cCount) > available && available > 0 && (
              <p className="text-xs text-warning">The current bank has {available} items for this selection, so the exam will use {available}.</p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Scheduled exam</CardTitle>
                <CardDescription>Plan a timed session ahead</CardDescription>
              </div>
              <CalendarClock className="size-5 text-muted" aria-hidden />
            </CardHeader>
            <CardContent>
              {ready && state.scheduledExam ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-subtle/50 p-4">
                  <div>
                    <p className="text-[13px] font-semibold">{state.scheduledExam.title}</p>
                    <p className="text-xs text-muted">{new Date(state.scheduledExam.at).toLocaleString(undefined, { weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => (scheduleExam(null), toast("Schedule cleared"))}>
                      Clear
                    </Button>
                    <Button size="sm" onClick={() => setPending(EXAM_PRESETS.find((p) => p.id === state.scheduledExam!.presetId)?.config ?? EXAM_PRESETS[0].config)}>
                      Start now
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-muted">No exam scheduled. Use the calendar button on any preset to plan one.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Exam history</CardTitle>
                <CardDescription>{history.length} submitted</CardDescription>
              </div>
              <History className="size-5 text-muted" aria-hidden />
            </CardHeader>
            <CardContent className="pt-3">
              {history.length === 0 ? (
                <EmptyState compact icon={ClipboardCheck} title="No exams taken yet" description="Your submitted mock exams and scores will be listed here." />
              ) : (
                <ul className="divide-y divide-line">
                  {history.map((r) => (
                    <li key={r.exam.id}>
                      <Link href={`/exams/results?id=${r.exam.id}`} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-subtle/60">
                        <span
                          className={cn(
                            "grid size-11 shrink-0 place-items-center rounded-lg font-mono text-[13px] font-semibold",
                            r.percent >= 70 ? "bg-success-soft text-success" : r.percent >= 50 ? "bg-warning-soft text-warning" : "bg-danger-soft text-danger",
                          )}
                        >
                          {r.percent}%
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium">{r.exam.config.title}</span>
                          <span className="block text-xs text-muted">
                            {new Date(r.exam.submittedAt!).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · {r.correct}/{r.total} · {formatDuration(r.secondsUsed)}
                          </span>
                        </span>
                        <ArrowRight className="size-4 text-faint" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Instructions */}
      <Dialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent className="max-w-xl">
          {pending && (
            <>
              <DialogHeader>
                <DialogTitle>{pending.title}</DialogTitle>
                <DialogDescription>Read the examination instructions before you begin.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  [Layers, `${Math.min(pending.questionCount, poolSize(pending.subjects))}`, "items"],
                  [Clock, `${pending.minutes} min`, "time limit"],
                  [ShieldCheck, pending.autoSubmit ? "Auto" : "Manual", "submission"],
                ].map(([I, v, l]) => {
                  const Icon = I as typeof Clock;
                  return (
                    <div key={l as string} className="rounded-xl border border-line bg-subtle/50 py-3">
                      <Icon className="mx-auto size-4 text-primary-text" aria-hidden />
                      <p className="mt-1.5 font-display text-[15px] font-semibold">{v as string}</p>
                      <p className="text-[11px] text-muted">{l as string}</p>
                    </div>
                  );
                })}
              </div>
              <ol className="mt-5 list-decimal space-y-2 pl-5 text-[13px] leading-6 text-muted marker:font-mono marker:text-faint">
                <li>Each item has one best answer. Unanswered items are scored as incorrect.</li>
                <li>Correct answers and solutions stay hidden until you submit the whole exam.</li>
                <li>Use <strong className="text-fg">Mark for review</strong> and the question palette to revisit items.</li>
                <li>Your answers are autosaved in this browser, so you can resume after a refresh.</li>
                <li>{pending.autoSubmit ? "The exam is submitted automatically when the timer reaches zero." : "When time runs out you'll be prompted to submit."}</li>
              </ol>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button onClick={() => (begin(pending), setPending(null))}>
                  <PlayCircle /> Begin exam
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ScheduleDialog
        preset={scheduleFor}
        onClose={() => setScheduleFor(null)}
        onSave={(at) => {
          if (!scheduleFor) return;
          scheduleExam({ title: scheduleFor.config.title, at, presetId: scheduleFor.id });
          toast.success("Mock exam scheduled", { description: new Date(at).toLocaleString() });
          setScheduleFor(null);
        }}
      />
    </PageContainer>
  );
}

function ScheduleDialog({ preset, onClose, onSave }: { preset: ExamPreset | null; onClose: () => void; onSave: (iso: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <Dialog open={!!preset} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule {preset?.title}</DialogTitle>
          <DialogDescription>Pick a time to sit this mock exam. It will appear on your dashboard and in notifications.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value) onSave(new Date(value).toISOString());
          }}
        >
          <Label htmlFor="sched">Date and time</Label>
          <Input id="sched" type="datetime-local" required value={value} onChange={(e) => setValue(e.target.value)} className="mt-2" />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!value}>
              Save schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
