"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, FlaskConical, Palette, RotateCcw, Save, ShieldAlert, Upload, UserRound } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldHint, Input, Label } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ThemeSegmented } from "@/components/theme/theme-selector";
import { subjects, type SubjectId } from "@/lib/content";
import { generateDemoState } from "@/lib/demo/generate";
import { usePrefs, type MotionPref } from "@/lib/store/prefs";
import { initialProgress, useProgress, type ProgressState } from "@/lib/store/progress";
import { useStoreReady } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

function Section({ id, icon: Icon, title, description, children }: { id: string; icon: typeof Palette; title: string; description: string; children: React.ReactNode }) {
  return (
    <Card id={id} className="scroll-mt-24">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[16rem_1fr]">
        <div>
          <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold">
            <Icon className="size-4 text-primary-text" aria-hidden /> {title}
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-muted">{description}</p>
        </div>
        <div className="min-w-0 space-y-5">{children}</div>
      </div>
    </Card>
  );
}

function Row({ label, hint, children, htmlFor }: { label: string; hint?: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div>
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint && <FieldHint className="mt-0.5">{hint}</FieldHint>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsView() {
  const ready = useStoreReady();
  // Remount when the profile is created/replaced so the form initializes from it.
  const profileKey = useProgress((s) => s.profile?.createdAt ?? "none");
  if (!ready)
    return (
      <PageContainer>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-6 h-64 rounded-xl" />
        <Skeleton className="mt-4 h-64 rounded-xl" />
      </PageContainer>
    );
  return <Settings key={profileKey} />;
}

function Settings() {
  const router = useRouter();
  const profile = useProgress((s) => s.profile);
  const dataMode = useProgress((s) => s.dataMode);
  const setProfile = useProgress((s) => s.setProfile);
  const updateProfile = useProgress((s) => s.updateProfile);
  const loadState = useProgress((s) => s.loadState);
  const resetAll = useProgress((s) => s.resetAll);
  const prefs = usePrefs();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = useState<null | "reset" | "demo">(null);

  const [name, setName] = useState(profile?.name ?? "");
  const [target, setTarget] = useState(profile?.targetExam ?? "");
  const [date, setDate] = useState(profile?.examDate ?? "");
  const [goal, setGoal] = useState(String(profile?.dailyGoalMinutes ?? 60));
  const [focus, setFocus] = useState<SubjectId[]>(profile?.focusSubjects ?? []);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: name.trim() || "Future Engineer", targetExam: target.trim() || "CELE", examDate: date || undefined, dailyGoalMinutes: Number(goal), focusSubjects: focus };
    if (profile) updateProfile(data);
    else setProfile({ ...data, experience: "graduate" });
    toast.success("Profile saved");
  };

  const exportData = () => {
    const s = useProgress.getState();
    const payload: Partial<ProgressState> & { exportedAt: string; app: string } = { app: "celevate", exportedAt: new Date().toISOString() };
    (Object.keys(initialProgress) as (keyof ProgressState)[]).forEach((k) => ((payload as Record<string, unknown>)[k] = s[k]));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `celevate-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Progress exported");
  };

  const importData = async (file: File) => {
    try {
      const json = JSON.parse(await file.text());
      if (json?.app !== "celevate" || !Array.isArray(json.attempts)) throw new Error("Not a CELEVATE export");
      const next: Partial<ProgressState> = {};
      (Object.keys(initialProgress) as (keyof ProgressState)[]).forEach((k) => {
        if (k in json) (next as Record<string, unknown>)[k] = json[k];
      });
      loadState(next);
      toast.success("Progress imported");
    } catch (err) {
      toast.error("Import failed", { description: err instanceof Error ? err.message : "Invalid file" });
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Settings" description="Manage your review profile, appearance, accessibility and local data." />
      <div className="space-y-4">
        <Section id="profile" icon={UserRound} title="Review profile" description="Personalizes greetings, goals and recommendations.">
          <form onSubmit={saveProfile} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="s-name">Display name</Label>
                <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-target">Target examination</Label>
                <Input id="s-target" value={target} onChange={(e) => setTarget(e.target.value)} maxLength={60} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-date">Target date</Label>
                <Input id="s-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <FieldHint>Confirm official dates with the PRC.</FieldHint>
              </div>
              <div className="space-y-2">
                <p className="text-[13px] font-medium">Daily goal</p>
                <Segmented size="sm" label="Daily goal" value={goal} onChange={setGoal} options={["30", "60", "90", "120"].map((v) => ({ value: v, label: `${v}m` }))} />
              </div>
            </div>
            <fieldset>
              <legend className="mb-2 text-[13px] font-medium">Focus subjects</legend>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => {
                  const on = focus.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      onClick={() => setFocus((f) => (on ? f.filter((x) => x !== s.id) : [...f, s.id]))}
                      className={cn("rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors", on ? "border-primary bg-primary-soft text-fg" : "border-line text-muted hover:border-line-strong")}
                    >
                      {s.code}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <Button type="submit">
              <Save /> Save profile
            </Button>
          </form>
        </Section>

        <Section id="appearance" icon={Palette} title="Appearance & accessibility" description="Theme, motion and reading comfort for long study sessions.">
          <Row label="Theme" hint="System follows your device setting">
            <ThemeSegmented />
          </Row>
          <Row label="Motion" hint="Reduced disables parallax and animated transitions">
            <Segmented
              size="sm"
              label="Motion preference"
              value={prefs.motion}
              onChange={(v) => prefs.setMotion(v as MotionPref)}
              options={[
                { value: "system", label: "System" },
                { value: "reduced", label: "Reduced" },
                { value: "full", label: "Full" },
              ]}
            />
          </Row>
          <Row label="Lesson text size" hint="Applies to the lesson reader">
            <Segmented
              size="sm"
              label="Lesson text size"
              value={String(Math.round(prefs.readerScale * 100))}
              onChange={(v) => prefs.setReaderScale(Number(v) / 100)}
              options={["90", "100", "110", "120"].map((v) => ({ value: v, label: `${v}%` }))}
            />
          </Row>
          <Row label="Show exam timer" hint="You can also toggle it during an exam" htmlFor="s-timer">
            <Switch id="s-timer" checked={prefs.showExamTimer} onCheckedChange={prefs.setShowExamTimer} />
          </Row>
          <Row label="Collapsed sidebar" hint="Desktop only" htmlFor="s-sidebar">
            <Switch id="s-sidebar" checked={prefs.sidebarCollapsed} onCheckedChange={() => prefs.toggleSidebar()} />
          </Row>
        </Section>

        <Section id="data" icon={ShieldAlert} title="Your data" description="Progress is stored only in this browser. Export a backup or move it to another device.">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-subtle/50 p-3 text-[13px]">
            <span className="text-muted">Current data:</span>
            {dataMode === "demo" ? (
              <Badge tone="warning">
                <FlaskConical /> Generated sample data
              </Badge>
            ) : (
              <Badge tone="success">Your personal activity</Badge>
            )}
            <span className="text-faint">· Account sync is not available yet.</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportData}>
              <Download /> Export progress
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload /> Import backup
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              aria-label="Import progress file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importData(f);
                e.target.value = "";
              }}
            />
            {dataMode === "demo" ? (
              <Button variant="danger" onClick={() => setConfirm("reset")}>
                <RotateCcw /> Clear sample data
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setConfirm("demo")}>
                  <FlaskConical /> Load sample data
                </Button>
                <Button variant="danger" onClick={() => setConfirm("reset")}>
                  <RotateCcw /> Reset all progress
                </Button>
              </>
            )}
          </div>
        </Section>

        <p className="px-1 text-xs leading-5 text-faint">
          CELEVATE is an independent review platform and is not affiliated with the Professional Regulation Commission. Readiness scores are internal learning estimates, not predictions of official results.
        </p>
      </div>

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirm === "demo" ? "Replace your data with sample data?" : dataMode === "demo" ? "Clear sample data?" : "Reset all progress?"}</DialogTitle>
            <DialogDescription>
              {confirm === "demo"
                ? "Your current progress in this browser will be replaced by generated sample activity. Export a backup first if you want to keep it."
                : "This permanently removes lessons, attempts, exams, bookmarks and notes stored in this browser. This can't be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              variant={confirm === "demo" ? "primary" : "danger"}
              onClick={() => {
                if (confirm === "demo") {
                  loadState(generateDemoState(useProgress.getState()));
                  toast.success("Sample data loaded");
                  router.push("/dashboard");
                } else {
                  resetAll();
                  toast.success(dataMode === "demo" ? "Sample data cleared" : "Progress reset");
                }
                setConfirm(null);
              }}
            >
              {confirm === "demo" ? "Load sample data" : "Yes, clear it"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
