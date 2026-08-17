import { ArrowDownRight, ArrowUpRight, Home, Mail, Phone } from "lucide-react";
import {
  CAPTURE_KINDS,
  CAPTURE_LABEL_LONG,
  captureBySource,
  captureMomentum,
  feedbackOutcomes,
  messageCapture,
  retainOutcomes,
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

/** Three full-width tiles: one per data type captured. */
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

/** Compact matrix: one row per source, one column per data type. */
function SourceMatrix({ period }: { period: Period }) {
  const rows = captureBySource(period);
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <th className="px-3.5 py-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Source
            </th>
            {CAPTURE_KINDS.map((k) => (
              <th
                key={k}
                className="px-3 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500"
              >
                {CAPTURE_LABEL_LONG[k]}
              </th>
            ))}
            <th className="px-3.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Guests
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((s) => (
            <tr key={s.key} className="transition-colors hover:bg-slate-50/70">
              <td className="px-3.5 py-2.5">
                <p className="text-[12.5px] font-semibold text-slate-900">{s.label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{s.hint}</p>
              </td>
              {CAPTURE_KINDS.map((k) => (
                <td
                  key={k}
                  className="px-3 py-2.5 text-right text-[13px] font-semibold tabular-nums text-slate-900"
                >
                  {s.counts[k]}
                </td>
              ))}
              <td className="px-3.5 py-2.5 text-right">
                <p className="text-[13px] font-semibold tabular-nums text-slate-900">{s.guests}</p>
                <span className="mt-0.5 inline-flex items-center gap-1.5">
                  <Delta value={s.momentum} />
                  <span className="text-[11px] text-slate-400">{s.rate}% rate</span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeedbackOutcomes({ period }: { period: Period }) {
  const outcomes = feedbackOutcomes(period);
  const bar = {
    good: "bg-emerald-500",
    warn: "bg-amber-500",
    neutral: "bg-slate-300",
  } as const;
  const dot = {
    good: "bg-emerald-500",
    warn: "bg-amber-500",
    neutral: "bg-slate-400",
  } as const;
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {outcomes.map((o) => (
        <div key={o.key} className="rounded-lg border border-slate-200 bg-white px-3.5 py-3">
          <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
            <span aria-hidden className={`size-1.5 rounded-full ${dot[o.tone]}`} />
            {o.label}
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-[20px] font-semibold leading-none tabular-nums tracking-tight text-slate-900">
              {o.value}
            </span>
            <span className="text-[11.5px] font-semibold tabular-nums text-slate-500">
              {o.share}%
            </span>
          </p>
          <span
            aria-hidden
            className="mt-2.5 block h-1 w-full overflow-hidden rounded-full bg-slate-100"
          >
            <span className={`block h-full rounded-full ${bar[o.tone]}`} style={{ width: `${o.share}%` }} />
          </span>
          <p className="mt-2 text-[11px] leading-snug text-slate-500">{o.hint}</p>
        </div>
      ))}
    </div>
  );
}

function RetainOutcomes({ period }: { period: Period }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {retainOutcomes(period).map((k) => (
        <div key={k.key} className="rounded-lg border border-slate-200 bg-white px-3.5 py-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11.5px] font-medium text-slate-500">{k.label}</p>
            <Delta value={k.momentum} />
          </div>
          <p className="mt-1 text-[20px] font-semibold leading-none tabular-nums tracking-tight text-slate-900">
            {k.value}
          </p>
          <p className="mt-2 text-[11px] leading-snug text-slate-500">{k.hint}</p>
        </div>
      ))}
    </div>
  );
}

/** Stage-level guest-data block shown inside every journey stage card. */
export function StageGuestData({ stageId, period }: { stageId: StageId; period: Period }) {
  const rows = stageCapture(stageId, period);

  return (
    <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-4">
      <Eyebrow>Guest data captured</Eyebrow>
      <div className="mt-2.5">
        <CaptureTiles rows={rows} stageId={stageId} />
      </div>

      {stageId === "during_stay" ? (
        <div className="mt-4">
          <Eyebrow>By capture source</Eyebrow>
          <div className="mt-2">
            <SourceMatrix period={period} />
          </div>
        </div>
      ) : null}

      {stageId === "post_checkout" ? (
        <div className="mt-4">
          <Eyebrow>Feedback outcomes</Eyebrow>
          <div className="mt-2">
            <FeedbackOutcomes period={period} />
          </div>
        </div>
      ) : null}

      {stageId === "retain" ? (
        <div className="mt-4">
          <Eyebrow>Direct relationship</Eyebrow>
          <div className="mt-2">
            <RetainOutcomes period={period} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Per-message capture strip used inside sequence cards — fills the card width. */
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
    <div className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-3">
      <Eyebrow>Guest data captured</Eyebrow>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {rows.map((r) => {
          const Icon = ICON[r.key];
          return (
            <div
              key={r.key}
              className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2"
            >
              <span className="flex min-w-0 items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
                <Icon size={12} className="shrink-0 text-slate-400" />
                <span className="truncate">{CAPTURE_LABEL_LONG[r.key]}</span>
              </span>
              <span className="text-[15px] font-semibold tabular-nums tracking-tight text-slate-900">
                {r.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
