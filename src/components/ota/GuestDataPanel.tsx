import { ArrowDownRight, ArrowUpRight, Home, Mail, Phone, Users } from "lucide-react";
import {
  CAPTURE_KINDS,
  CAPTURE_LABEL_LONG,
  captureBySource,
  captureMomentum,
  feedbackOutcomes,
  messageCapture,
  stageCapture,
  type CaptureKind,
  type CaptureRow,
} from "@/lib/guestData";
import type { Period, StageId } from "@/lib/otaJourney";

const ICON: Record<CaptureKind, typeof Mail> = {
  email: Mail,
  phone: Phone,
  address: Home,
};

const SOURCE_ICON = {
  campaign: Mail,
  staff: Users,
  id_scan: Home,
} as const;

function Delta({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums ${
        up ? "text-emerald-600" : "text-rose-600"
      }`}
    >
      {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
      {children}
    </p>
  );
}

/** Icon + number, no sentence. The icon carries the meaning. */
function KindStat({ kind, value }: { kind: CaptureKind; value: string }) {
  const Icon = ICON[kind];
  return (
    <span
      className="flex items-center gap-1.5"
      title={CAPTURE_LABEL_LONG[kind]}
      aria-label={`${CAPTURE_LABEL_LONG[kind]}: ${value}`}
    >
      <Icon size={13} className="shrink-0 text-slate-400" aria-hidden />
      <span className="text-[13.5px] font-semibold tabular-nums tracking-tight text-slate-900">
        {value}
      </span>
    </span>
  );
}

/** Three tiles: one per data type captured. */
function CaptureTiles({ rows, stageId }: { rows: CaptureRow[]; stageId: StageId }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {rows.map((r) => {
        const Icon = ICON[r.key];
        return (
          <div
            key={r.key}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
                <Icon size={12} className="shrink-0 text-slate-400" />
                <span className="truncate">{CAPTURE_LABEL_LONG[r.key]}</span>
              </p>
              <p className="mt-1 text-[20px] font-semibold leading-none tabular-nums tracking-tight text-slate-900">
                {r.value}
              </p>
            </div>
            <Delta value={captureMomentum(stageId, r.key)} />
          </div>
        );
      })}
    </div>
  );
}

/** Three horizontal source cards — replaces the old wide table. */
function SourceCards({ period }: { period: Period }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {captureBySource(period).map((s) => {
        const Icon = SOURCE_ICON[s.key];
        return (
          <div key={s.key} className="rounded-lg border border-slate-200 bg-white px-3.5 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="flex min-w-0 items-center gap-1.5 text-[12.5px] font-semibold text-slate-900">
                <Icon size={13} className="shrink-0 text-slate-400" aria-hidden />
                <span className="truncate">{s.label}</span>
              </p>
              <Delta value={s.momentum} />
            </div>
            <div className="mt-2.5 flex items-center justify-between gap-2">
              {CAPTURE_KINDS.map((k) => (
                <KindStat key={k} kind={k} value={s.counts[k]} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Positive / negative / no response — value and share only. */
function FeedbackOutcomes({ period }: { period: Period }) {
  const dot = {
    good: "bg-emerald-500",
    warn: "bg-amber-500",
    neutral: "bg-slate-400",
  } as const;
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {feedbackOutcomes(period).map((o) => (
        <div
          key={o.key}
          className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3"
        >
          <p className="flex min-w-0 items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
            <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${dot[o.tone]}`} />
            <span className="truncate">{o.label}</span>
          </p>
          <p className="flex shrink-0 items-baseline gap-2">
            <span className="text-[18px] font-semibold leading-none tabular-nums tracking-tight text-slate-900">
              {o.value}
            </span>
            <span className="text-[11.5px] font-semibold tabular-nums text-slate-500">
              {o.share}%
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}

/** Stage-level guest-data block shown inside journey stage cards. */
export function StageGuestData({ stageId, period }: { stageId: StageId; period: Period }) {
  // During Stay reports capture by source instead of the generic totals.
  if (stageId === "during_stay") {
    return (
      <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-4">
        <Eyebrow>Guest data captured by source</Eyebrow>
        <div className="mt-2.5">
          <SourceCards period={period} />
        </div>
      </div>
    );
  }

  if (stageId === "post_checkout") {
    return (
      <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-4">
        <Eyebrow>Feedback outcomes</Eyebrow>
        <div className="mt-2.5">
          <FeedbackOutcomes period={period} />
        </div>
      </div>
    );
  }

  if (stageId === "retain") return null;

  return (
    <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-4">
      <Eyebrow>Guest data captured</Eyebrow>
      <div className="mt-2.5">
        <CaptureTiles rows={stageCapture(stageId, period)} stageId={stageId} />
      </div>
    </div>
  );
}

/** Per-message capture strip — icons only, one compact line. */
export function MessageGuestData({
  stageId,
  msgId,
  period = "30d",
}: {
  stageId: StageId;
  msgId: string;
  period?: Period;
}) {
  const rows = messageCapture(stageId, msgId, period);
  return (
    <div className="mt-2.5 inline-flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        Captured
      </span>
      {rows.map((r) => (
        <KindStat key={r.key} kind={r.key} value={r.value} />
      ))}
    </div>
  );
}
