"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, GraduationCap, Repeat2, School } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldHint } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Switch } from "@/components/ui/switch";
import { ThemeSegmented } from "@/components/theme/theme-selector";
import { ThemeMenu } from "@/components/theme/theme-selector";
import { subjects } from "@/lib/content";
import { usePrefs } from "@/lib/store/prefs";
import { useProgress, type Profile } from "@/lib/store/progress";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { SubjectId } from "@/config/cele";

const STEPS = ["About you", "Target exam", "Study goals", "Preferences"] as const;

export function Onboarding() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const existing = useProgress((s) => s.profile);
  const setProfile = useProgress((s) => s.setProfile);
  const motionPref = usePrefs((s) => s.motion);
  const setMotion = usePrefs((s) => s.setMotion);

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [name, setName] = useState(existing?.name ?? "");
  const [experience, setExperience] = useState<Profile["experience"]>(existing?.experience ?? "graduate");
  const [targetExam, setTargetExam] = useState(existing?.targetExam ?? "");
  const [examDate, setExamDate] = useState(existing?.examDate ?? "");
  const [goal, setGoal] = useState(String(existing?.dailyGoalMinutes ?? 60));
  const [focus, setFocus] = useState<SubjectId[]>(existing?.focusSubjects ?? []);

  const canNext = step === 0 ? name.trim().length > 0 : step === 1 ? targetExam.trim().length > 0 : true;
  const next = () => {
    if (!canNext) return;
    if (step === STEPS.length - 1) {
      setProfile({
        name: name.trim(),
        experience,
        targetExam: targetExam.trim(),
        examDate: examDate || undefined,
        dailyGoalMinutes: Number(goal),
        focusSubjects: focus,
      });
      router.push("/dashboard");
      return;
    }
    setDir(1);
    setStep((s) => s + 1);
  };
  const back = () => {
    setDir(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,26rem)_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden border-r border-line bg-surface/60 p-10 lg:flex lg:flex-col">
        <div aria-hidden className="absolute inset-0 blueprint-grid opacity-70 mask-fade-edges" />
        <div aria-hidden className="absolute -bottom-32 -left-20 size-96 rounded-full bg-[radial-gradient(closest-side,var(--glow-primary),transparent)]" />
        <Link href="/" className="relative w-fit rounded-md">
          <Logo />
        </Link>
        <div className="relative mt-auto">
          <p className="font-mono text-[11px] tracking-[0.18em] text-primary-text uppercase">Review setup</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">Plan the climb before you start it.</h2>
          <ol className="mt-8 space-y-4">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-3 text-sm">
                <span
                  className={cn(
                    "grid size-7 place-items-center rounded-full border font-mono text-[11px] transition-colors",
                    i < step && "border-primary bg-primary-strong text-primary-fg",
                    i === step && "border-primary text-primary-text",
                    i > step && "border-line text-faint",
                  )}
                >
                  {i < step ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span className={i <= step ? "font-medium text-fg" : "text-muted"}>{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-xs leading-5 text-faint">
            Your plan and progress are stored in this browser only. Account sync isn&apos;t available yet.
          </p>
        </div>
      </aside>

      {/* Form */}
      <main id="main" className="flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 sm:px-8">
          <Link href="/" className="rounded-md lg:hidden">
            <Logo />
          </Link>
          <span className="hidden text-sm text-muted lg:block">
            Step {step + 1} of {STEPS.length}
          </span>
          <div className="flex items-center gap-2">
            <ThemeMenu />
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Skip for now</Link>
            </Button>
          </div>
        </div>
        <div className="px-4 sm:px-8">
          <div className="h-1 overflow-hidden rounded-full bg-subtle" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1} aria-label="Setup progress">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-iris" animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.5, ease: ease.outExpo }} />
          </div>
        </div>

        <form
          className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-10 sm:px-8"
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={step}
              custom={dir}
              initial={reduce ? false : { opacity: 0, x: 24 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -24 * dir }}
              transition={{ duration: 0.28, ease: ease.outQuart }}
            >
              {step === 0 && (
                <fieldset className="space-y-6">
                  <legend className="font-display text-display-lg font-semibold">Welcome, future engineer.</legend>
                  <p className="-mt-2 text-sm text-muted">Let&apos;s personalize CELEVATE around your review.</p>
                  <div className="space-y-2">
                    <Label htmlFor="name">What should we call you?</Label>
                    <Input id="name" autoFocus autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Andrea" maxLength={40} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[13px] font-medium" id="exp-label">
                      Where are you in your journey?
                    </p>
                    <div role="radiogroup" aria-labelledby="exp-label" className="grid gap-2 sm:grid-cols-3">
                      {(
                        [
                          ["student", "Senior student", School],
                          ["graduate", "Fresh graduate", GraduationCap],
                          ["retaker", "Retaking the exam", Repeat2],
                        ] as const
                      ).map(([v, l, Icon]) => (
                        <button
                          key={v}
                          type="button"
                          role="radio"
                          aria-checked={experience === v}
                          onClick={() => setExperience(v)}
                          className={cn(
                            "flex flex-col items-start gap-3 rounded-xl border p-4 text-left text-[13px] font-medium transition-colors",
                            experience === v ? "border-primary bg-primary-soft text-fg" : "border-line bg-card hover:border-line-strong",
                          )}
                        >
                          <Icon className={cn("size-5", experience === v ? "text-primary-text" : "text-muted")} />
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </fieldset>
              )}

              {step === 1 && (
                <fieldset className="space-y-6">
                  <legend className="font-display text-display-lg font-semibold">Which exam are you targeting?</legend>
                  <p className="-mt-2 text-sm text-muted">CELEVATE doesn&apos;t publish official schedules — check the PRC for confirmed examination dates.</p>
                  <div className="space-y-2">
                    <Label htmlFor="target">Target examination</Label>
                    <Input id="target" autoFocus value={targetExam} onChange={(e) => setTargetExam(e.target.value)} placeholder="e.g. Next CELE board exam" maxLength={60} />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {["Next CELE board exam", "CELE — first take", "CELE — retake"].map((s) => (
                        <button key={s} type="button" onClick={() => setTargetExam(s)} className="rounded-full border border-line bg-card px-3 py-1 text-xs text-muted hover:border-line-strong hover:text-fg">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Target date (optional)</Label>
                    <Input id="date" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="max-w-56" />
                    <FieldHint>Used only for your own countdown on the dashboard.</FieldHint>
                  </div>
                </fieldset>
              )}

              {step === 2 && (
                <fieldset className="space-y-6">
                  <legend className="font-display text-display-lg font-semibold">Set a sustainable pace.</legend>
                  <div className="space-y-2">
                    <p className="text-[13px] font-medium">Daily study goal</p>
                    <Segmented
                      label="Daily study goal"
                      value={goal}
                      onChange={setGoal}
                      options={[
                        { value: "30", label: "30 min" },
                        { value: "60", label: "1 hr" },
                        { value: "90", label: "1.5 hr" },
                        { value: "120", label: "2 hr" },
                      ]}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[13px] font-medium">Subjects to prioritize</p>
                    <FieldHint>Optional — choose any that need extra attention.</FieldHint>
                    <div className="grid gap-2 pt-1">
                      {subjects.map((s) => {
                        const on = focus.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            role="checkbox"
                            aria-checked={on}
                            onClick={() => setFocus((f) => (on ? f.filter((x) => x !== s.id) : [...f, s.id]))}
                            className={cn(
                              "flex items-center gap-3 rounded-xl border p-3.5 text-left transition-colors",
                              on ? "border-primary bg-primary-soft" : "border-line bg-card hover:border-line-strong",
                            )}
                          >
                            <span className={cn("grid size-5 shrink-0 place-items-center rounded-md border", on ? "border-primary bg-primary-strong text-primary-fg" : "border-line-strong")}>
                              {on && <Check className="size-3.5" />}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[13px] font-medium">{s.name}</span>
                              <span className="font-mono text-[11px] text-faint">{s.code}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </fieldset>
              )}

              {step === 3 && (
                <fieldset className="space-y-6">
                  <legend className="font-display text-display-lg font-semibold">Make it comfortable.</legend>
                  <div className="space-y-2">
                    <p className="text-[13px] font-medium">Appearance</p>
                    <ThemeSegmented />
                    <FieldHint>System follows your device setting automatically.</FieldHint>
                  </div>
                  <div className="flex items-start justify-between gap-6 rounded-xl border border-line bg-card p-4">
                    <div>
                      <Label htmlFor="rm">Reduce motion</Label>
                      <FieldHint className="mt-0.5">Minimizes parallax and animated transitions.</FieldHint>
                    </div>
                    <Switch id="rm" checked={motionPref === "reduced"} onCheckedChange={(v) => setMotion(v ? "reduced" : "system")} />
                  </div>
                </fieldset>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={back} disabled={step === 0}>
              <ArrowLeft /> Back
            </Button>
            <Button type="submit" disabled={!canNext}>
              {step === STEPS.length - 1 ? "Start reviewing" : "Continue"} <ArrowRight />
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
