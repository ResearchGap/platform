import { Badge } from "@platform/ui/components/badge";
import { buttonVariants } from "@platform/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@platform/ui/components/card";
import { ExternalLink } from "lucide-react";

import type { LearningSession } from "@/lib/api/mentee-types";
import { formatDateTime, readableLabel, safeExternalUrl } from "@/lib/public-format";

const resources = [
  ["Module", "moduleUrl"],
  ["Pre-test", "preTestUrl"],
  ["Post-test", "postTestUrl"],
  ["Feedback", "feedbackUrl"],
  ["Recording", "recordingUrl"],
] as const;

export function LearningSessionCard({ session }: { session: LearningSession }) {
  const meetingUrl = safeExternalUrl(session.venue);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Session {session.sortOrder}</Badge>
          <Badge variant="outline">{readableLabel(session.sessionType)}</Badge>
        </div>
        <CardTitle>{session.title}</CardTitle>
        <CardDescription>
          {formatDateTime(session.scheduledAt)}
          {session.speakerName ? ` · ${session.speakerName}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {session.description ? (
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {session.description}
          </p>
        ) : null}

        {session.venue ? (
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium">Venue / meeting information</p>
            {meetingUrl ? (
              <a
                href={meetingUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3" })}
              >
                Open meeting
                <ExternalLink data-icon="inline-end" aria-hidden="true" />
              </a>
            ) : (
              <p className="mt-1 text-muted-foreground">{session.venue}</p>
            )}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {resources.map(([label, key]) => {
            const url = safeExternalUrl(session[key]);
            return url ? (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                {label}
                <ExternalLink data-icon="inline-end" aria-hidden="true" />
              </a>
            ) : null;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
