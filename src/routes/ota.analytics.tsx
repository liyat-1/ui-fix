import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Home, Mail, Phone } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Select } from "@/components/editor/Select";
import {
  ANALYTICS_PERIODS,
  SERIES_METRICS,
  capturedKpi,
  channelRows,
  funnel,
  kpis,
  repeatDirect,
  series,
  sourceRows,
  stageRows,
  type AnalyticsPeriod,
  type SeriesMetric,
} from "@/lib/otaAnalytics";

export const Route = createFileRoute("/ota/analytics")({
  head: () => ({
    meta: [
      { title: "OTA Analytics — OTA Buster · Directful" },
      {
        name: "description",
        content:
          "See how OTA guests move from first message to direct relationship: reach, guest data captured, direct conversions, revenue and commission avoided.",
      },
      { property: "og:title", content: "OTA Analytics — Directful" },
      {
        property: "og:description",
        content:
          "Reach, capture, conversion, revenue and commission avoided for every OTA guest journey stage.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OtaAnalyticsScreen,
});

function Delta({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[12px] font-semibold tabular-nums ${
        up ? "text-emerald-600" : "text-rose-600"
      }`}
    >
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-[12.5px] text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Th({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th
      className={`px-3 py-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500 ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

const CAP_ICON = { email: Mail, phone: Phone, address: Home } as const;

function OtaAnalyticsScreen() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [compare, setCompare] = useState(true);
  const [metric, setMetric] = useState<SeriesMetric>("reached");

  const cards = kpis(period);
  const captured = capturedKpi(period);
  const steps = funnel(period);
  const repeat = repeatDirect(period);
  const points = useMemo(() => series(metric, period), [metric, period]);
  const metricLabel = SERIES_METRICS.find((m) => m.value === metric)!.label;
  const isMoney = metric === "revenue";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
            OTA Buster
          </p>
          <h1 className="mt-1 text-[24px] font-semibold tracking-tight text-slate-900">
            OTA Analytics
          </h1>
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-slate-600">
            Understand how your OTA guests move from first message to direct relationship.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
            <input
              type="checkbox"
              checked={compare}
              onChange={(e) => setCompare(e.target.checked)}
              className="size-3.5 accent-blue-600"
            />
            vs. previous period
          </label>
          <div className="w-44">
            <Select
              value={period}
              options={ANALYTICS_PERIODS.map((p) => ({ value: p.value, label: p.label }))}
              onChange={(v) => setPeriod(v)}
              size="sm"
              align="right"
              ariaLabel="Reporting period"
            />
          </div>
        </div>
      </header>

      {/* Level 1 — executive summary */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((k) => (
          <article
            key={k.key}
            className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[12.5px] font-medium text-slate-500">{k.label}</h3>
              <Delta value={k.delta} />
            </div>
            <p className="mt-3 text-[30px] font-semibold leading-none tabular-nums tracking-tight text-slate-900">
              {k.value}
            </p>
            <p className="mt-2.5 text-[11.5px] leading-snug text-slate-500">{k.meta}</p>
          </article>
        ))}

        <article className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300">
          <h3 className="text-[12.5px] font-medium text-slate-500">Guest data captured</h3>
          <ul className="mt-3 divide-y divide-slate-100">
            {captured.map((c) => {
              const Icon = CAP_ICON[c.key as keyof typeof CAP_ICON];
              return (
                <li key={c.key} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                  <span className="flex min-w-0 items-center gap-2 text-[12px] text-slate-500">
                    <Icon size={13} className="shrink-0 text-slate-400" />
                    <span className="truncate">{c.label}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2.5">
                    <span className="text-[17px] font-semibold tabular-nums tracking-tight text-slate-900">
                      {c.value}
                    </span>
                    <Delta value={c.delta} />
                  </span>
                </li>
              );
            })}
          </ul>
        </article>
      </div>

      {/* Level 2 — capture by source */}
      <Section
        title="Guest data captured by source"
        subtitle="Where the guest information in your database comes from."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <Th>Source</Th>
                <Th right>Emails</Th>
                <Th right>Phones</Th>
                <Th right>Addresses</Th>
                <Th right>Guests captured</Th>
                <Th right>Capture rate</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sourceRows(period).map((r) => (
                <tr key={r.source} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-3 py-3">
                    <p className="text-[13px] font-semibold text-slate-900">{r.source}</p>
                    <p className="mt-0.5 text-[11.5px] text-slate-500">{r.hint}</p>
                  </td>
                  {[r.emails, r.phones, r.addresses, r.guests].map((v, i) => (
                    <td
                      key={i}
                      className="px-3 py-3 text-right text-[13.5px] font-semibold tabular-nums text-slate-900"
                    >
                      {v}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-right text-[13px] font-medium tabular-nums text-slate-600">
                    {r.rate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Level 3 — conversion story */}
      <Section
        title="From OTA guest to direct guest"
        subtitle="The same guests, followed all the way through the journey."
        action={
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-medium text-slate-500">Repeat direct guests</p>
            <p className="mt-0.5 flex items-center gap-2">
              <span className="text-[16px] font-semibold tabular-nums tracking-tight text-slate-900">
                {repeat.value}
              </span>
              <Delta value={repeat.delta} />
            </p>
          </div>
        }
      >
        <ol className="flex flex-wrap items-stretch gap-2 lg:flex-nowrap">
          {steps.map((s, i) => (
            <li key={s.key} className="flex min-w-0 flex-1 items-center gap-2">
              <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-3">
                <p className="truncate text-[11.5px] font-medium text-slate-500">{s.label}</p>
                <p className="mt-1 text-[18px] font-semibold leading-none tabular-nums tracking-tight text-slate-900">
                  {s.value}
                </p>
                {s.key !== "revenue" ? (
                  <>
                    <span
                      aria-hidden
                      className="mt-2.5 block h-1 w-full overflow-hidden rounded-full bg-slate-100"
                    >
                      <span
                        className="block h-full rounded-full bg-blue-600"
                        style={{ width: `${Math.max(4, s.share)}%` }}
                      />
                    </span>
                    <p className="mt-1.5 text-[11px] text-slate-400">{s.share}% of OTA guests</p>
                  </>
                ) : (
                  <p className="mt-2.5 text-[11px] text-slate-400">Earned on direct stays</p>
                )}
              </div>
              {i < steps.length - 1 ? (
                <ArrowRight size={14} className="hidden shrink-0 text-slate-300 lg:block" />
              ) : null}
            </li>
          ))}
        </ol>
      </Section>

      {/* Level 4 — over time */}
      <Section
        title="Performance over time"
        subtitle={`${metricLabel} across the selected period.`}
        action={
          <div className="w-52">
            <Select
              value={metric}
              options={SERIES_METRICS.map((m) => ({ value: m.value, label: m.label }))}
              onChange={(v) => setMetric(v)}
              size="sm"
              align="right"
              ariaLabel="Chart metric"
            />
          </div>
        }
      >
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v: number) => (isMoney ? `$${v.toLocaleString("en-US")}` : v.toLocaleString("en-US"))}
              />
              <ChartTooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                  boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                }}
                formatter={(v: number | string, name: string) => [
                  isMoney ? `$${Number(v).toLocaleString("en-US")}` : Number(v).toLocaleString("en-US"),
                  name,
                ]}
              />
              {compare ? (
                <Line
                  type="monotone"
                  dataKey="previous"
                  name="Previous period"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              ) : null}
              <Line
                type="monotone"
                dataKey="current"
                name={metricLabel}
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* Level 5 — by stage */}
      <Section
        title="Performance by guest journey stage"
        subtitle="How each stage of the OTA Buster journey is contributing."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <Th>Stage</Th>
                <Th right>Guests reached</Th>
                <Th right>Momentum</Th>
                <Th right>Engagement</Th>
                <Th right>Emails</Th>
                <Th right>Phones</Th>
                <Th right>Addresses</Th>
                <Th right>Conversions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stageRows(period).map((r) => (
                <tr key={r.stage} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-3 py-3 text-[13px] font-semibold text-slate-900">{r.stage}</td>
                  <td className="px-3 py-3 text-right text-[13.5px] font-semibold tabular-nums text-slate-900">
                    {r.reached}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Delta value={r.momentum} />
                  </td>
                  <td className="px-3 py-3 text-right text-[13px] tabular-nums text-slate-600">
                    {r.engagement}
                  </td>
                  {[r.emails, r.phones, r.addresses, r.conversions].map((v, i) => (
                    <td
                      key={i}
                      className="px-3 py-3 text-right text-[13px] tabular-nums text-slate-700"
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Level 6 — by channel */}
      <Section
        title="Campaign performance by channel"
        subtitle="Which communication strategy earns the most direct guests."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <Th>Channel</Th>
                <Th right>Sent</Th>
                <Th right>Delivered</Th>
                <Th right>Click-through rate</Th>
                <Th right>Response rate</Th>
                <Th right>Conversions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {channelRows(period).map((r) => (
                <tr key={r.channel} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-3 py-3 text-[13px] font-semibold text-slate-900">{r.channel}</td>
                  {[r.sent, r.delivered, r.ctr, r.response].map((v, i) => (
                    <td
                      key={i}
                      className="px-3 py-3 text-right text-[13px] tabular-nums text-slate-700"
                    >
                      {v}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-right text-[13.5px] font-semibold tabular-nums text-slate-900">
                    {r.conversions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
