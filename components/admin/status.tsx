import { Badge } from "@/components/ui/badge";
import type { Question } from "@/lib/qbank/schema";

const VALIDATION_TONE = { draft: "neutral", technical_review: "info", verified: "success", needs_review: "warning", rejected: "danger" } as const;
const PUBLICATION_TONE = { unpublished: "outline", published: "primary", archived: "neutral" } as const;
const SME_TONE = { pending: "outline", approved: "iris", changes_requested: "warning" } as const;

export const label = (s: string) => s.replace(/_/g, " ");

export function StatusBadges({ status, verification }: { status: Question["status"]; verification?: string }) {
  return (
    <div className="flex flex-wrap gap-1">
      <Badge tone={VALIDATION_TONE[status.validation]} className="capitalize">
        {label(status.validation)}
      </Badge>
      <Badge tone={PUBLICATION_TONE[status.publication]} className="capitalize">
        {status.publication}
      </Badge>
      <Badge tone={SME_TONE[status.smeReview]}>SME {label(status.smeReview)}</Badge>
      {verification && verification !== "passed" && (
        <Badge tone={verification === "failed" ? "danger" : "outline"}>check {verification}</Badge>
      )}
    </div>
  );
}
