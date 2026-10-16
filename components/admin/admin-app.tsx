"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Database, FileInput, Flag, KeyRound, LayoutDashboard, ListChecks, LogOut, ShieldAlert } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { ThemeMenu } from "@/components/theme/theme-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, FieldHint } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi, type Staff } from "@/lib/admin/api";
import { cn } from "@/lib/utils";
import { AdminOverview } from "./overview";
import { QuestionList } from "./question-list";
import { QuestionEditor } from "./question-editor";
import { ImportExport } from "./import-export";
import { ReportsPanel } from "./reports";

export type AdminTab = "overview" | "questions" | "import" | "reports";
const TABS: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "questions", label: "Questions", icon: ListChecks },
  { id: "import", label: "Import / export", icon: FileInput },
  { id: "reports", label: "Error reports", icon: Flag },
];

interface SessionInfo {
  configured: boolean;
  staff: Staff | null;
  storage: string;
  writable: boolean;
}

export function AdminApp() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(() => {
    adminApi
      .session()
      .then(setSession)
      .catch((e: Error) => setError(e.message));
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  if (error) return <Centered>{error}</Centered>;
  if (!session)
    return (
      <div className="mx-auto max-w-6xl p-6" role="status" aria-label="Loading">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-6 h-72 rounded-2xl" />
      </div>
    );
  if (!session.configured) return <NotConfigured />;
  if (!session.staff) return <Login onDone={refresh} />;
  return <Console staff={session.staff} storage={session.storage} writable={session.writable} onSignOut={refresh} />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="grid min-h-dvh place-items-center p-6">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}

function NotConfigured() {
  return (
    <Centered>
      <Card className="p-6">
        <ShieldAlert className="size-6 text-warning" aria-hidden />
        <h1 className="mt-3 font-display text-lg font-semibold">Admin access isn&apos;t configured</h1>
        <p className="mt-2 text-[13px] leading-6 text-muted">
          Set <code className="font-mono text-[12px]">CELEVATE_STAFF</code> (for example <code className="font-mono text-[12px]">Ana Reyes:admin:&lt;token&gt;;Ben Cruz:reviewer:&lt;token&gt;</code>) and{" "}
          <code className="font-mono text-[12px]">CELEVATE_SIGNING_SECRET</code> on the server, then reload. Tokens must be at least 24 characters.
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/">Back to CELEVATE</Link>
        </Button>
      </Card>
    </Centered>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <Centered>
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <LogoMark className="size-7" />
          <span className="font-display font-semibold">CELEVATE · Question bank</span>
        </div>
        <h1 className="mt-5 font-display text-xl font-semibold">Staff sign-in</h1>
        <p className="mt-1 text-[13px] text-muted">For authors, technical reviewers and administrators.</p>
        <form
          className="mt-5 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError(null);
            try {
              await adminApi.login(token.trim());
              onDone();
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Label htmlFor="staff-token">Access token</Label>
          <Input id="staff-token" type="password" autoComplete="current-password" value={token} onChange={(e) => setToken(e.target.value)} required aria-invalid={!!error} />
          {error && (
            <p role="alert" className="text-[13px] text-danger">
              {error}
            </p>
          )}
          <FieldHint>Sessions last 12 hours. Repeated failures are rate-limited.</FieldHint>
          <Button type="submit" className="w-full" loading={busy} disabled={!token.trim()}>
            <KeyRound /> Sign in
          </Button>
        </form>
      </Card>
    </Centered>
  );
}

function Console({ staff, storage, writable, onSignOut }: { staff: Staff; storage: string; writable: boolean; onSignOut: () => void }) {
  const params = useSearchParams();
  const router = useRouter();
  const editId = params.get("edit");
  const tab = (TABS.find((t) => t.id === params.get("tab"))?.id ?? "overview") as AdminTab;
  const go = useCallback(
    (next: { tab?: AdminTab; edit?: string | null }) => {
      const qs = new URLSearchParams();
      if (next.edit) qs.set("edit", next.edit);
      else qs.set("tab", next.tab ?? tab);
      router.push(`/admin?${qs}`);
    },
    [router, tab],
  );

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <LogoMark className="size-7" />
            <span className="hidden font-display text-[14px] font-semibold sm:inline">Question bank admin</span>
          </Link>
          <Badge tone={writable ? "success" : "warning"} className="ml-1">
            <Database /> {storage === "postgres" ? "Postgres" : "File store"}
            {writable ? "" : " · read-only"}
          </Badge>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-right text-[12px] leading-4 sm:block">
              <span className="block font-medium">{staff.name}</span>
              <span className="block capitalize text-muted">{staff.role}</span>
            </span>
            <ThemeMenu />
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await adminApi.logout().catch(() => {});
                toast("Signed out");
                onSignOut();
              }}
            >
              <LogOut /> <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
        {!editId && (
          <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 sm:px-5" aria-label="Admin sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => go({ tab: t.id })}
                aria-current={tab === t.id ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors",
                  tab === t.id ? "border-primary text-fg" : "border-transparent text-muted hover:text-fg",
                )}
              >
                <t.icon className="size-4" aria-hidden /> {t.label}
              </button>
            ))}
          </nav>
        )}
      </header>
      <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {!writable && (
          <p className="mb-4 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-[13px]">
            This deployment serves the bank read-only. Edit locally with the file store (or set <code className="font-mono text-[12px]">DATABASE_URL</code>) to make changes.
          </p>
        )}
        {editId ? (
          <QuestionEditor key={editId} id={editId === "new" ? null : editId} staff={staff} writable={writable} storage={storage} onClose={() => go({ tab: "questions" })} onOpen={(id) => go({ edit: id })} />
        ) : tab === "overview" ? (
          <AdminOverview onOpen={(id) => go({ edit: id })} writable={writable} storage={storage} staff={staff} />
        ) : tab === "questions" ? (
          <QuestionList onOpen={(id) => go({ edit: id })} staff={staff} writable={writable} />
        ) : tab === "import" ? (
          <ImportExport staff={staff} writable={writable} />
        ) : (
          <ReportsPanel staff={staff} onOpen={(id) => go({ edit: id })} />
        )}
      </main>
    </div>
  );
}
