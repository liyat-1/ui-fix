/**
 * OTA Analytics — the reporting model behind the OTA Buster analytics page.
 *
 * Every number here is derived from one authoritative base set so the page can
 * never contradict itself: KPIs, funnel, stage table and channel table all read
 * from the same values, scaled by the selected period.
 *
 * Deterministic sample data for the prototype.
 */

export type AnalyticsPeriod = "7d" | "15d" | "30d" | "90d" | "custom";

export const ANALYTICS_PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "15d", label: "Last 15 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "custom", label: "Custom range" },
];

const FACTOR: Record<AnalyticsPeriod, number> = {
  "7d": 0.24,
  "15d": 0.5,
  "30d": 1,
  "90d": 2.65,
  custom: 1.62,
};

const scale = (n: number, p: AnalyticsPeriod) => Math.round(n * FACTOR[p]);
export const fmt = (n: number) => n.toLocaleString("en-US");
export const money = (n: number) => `$${n.toLocaleString("en-US")}`;

/* ------------------------------ base values ----------------------------- */

const BASE = {
  otaGuests: 12483,
  reached: 8240,
  engaged: 3131,
  captured: 3126,
  conversions: 642,
  revenue: 84200,
  commission: 14310,
  repeat: 214,
  emails: 6420,
  phones: 5180,
  addresses: 3940,
};

export type Kpi = {
  key: string;
  label: string;
  value: string;
  delta: number;
  meta?: string;
};

export function kpis(period: AnalyticsPeriod): Kpi[] {
  const otaGuests = scale(BASE.otaGuests, period);
  const reached = scale(BASE.reached, period);
  const conversions = scale(BASE.conversions, period);
  const revenue = scale(BASE.revenue, period);
  const commission = scale(BASE.commission, period);
  const avg = conversions ? Math.round(revenue / conversions) : 0;

  return [
    { key: "ota", label: "OTA guests", value: fmt(otaGuests), delta: 4.1, meta: "Reservations from Booking.com, Expedia and Airbnb" },
    {
      key: "reached",
      label: "Guests reached",
      value: fmt(reached),
      delta: 6.2,
      meta: `${Math.round((reached / otaGuests) * 100)}% reach rate`,
    },
    {
      key: "conversions",
      label: "Direct conversions",
      value: fmt(conversions),
      delta: 18.2,
      meta: `${((conversions / otaGuests) * 100).toFixed(1)}% conversion rate`,
    },
    {
      key: "revenue",
      label: "Direct revenue",
      value: money(revenue),
      delta: 18.2,
      meta: `${money(avg)} avg. revenue / conversion`,
    },
    {
      key: "commission",
      label: "Commission avoided",
      value: money(commission),
      delta: 16.8,
      meta: "OTA commission saved on direct stays",
    },
  ];
}

export type CapturedKpi = { key: string; label: string; value: string; delta: number };

export function capturedKpi(period: AnalyticsPeriod): CapturedKpi[] {
  return [
    { key: "email", label: "Emails captured", value: fmt(scale(BASE.emails, period)), delta: 8.4 },
    { key: "phone", label: "Phone numbers captured", value: fmt(scale(BASE.phones, period)), delta: 6.1 },
    { key: "address", label: "Addresses captured", value: fmt(scale(BASE.addresses, period)), delta: 4.2 },
  ];
}

export function repeatDirect(period: AnalyticsPeriod) {
  return { value: fmt(scale(BASE.repeat, period)), delta: 15.7 };
}

/* -------------------------------- funnel -------------------------------- */

export type FunnelStep = { key: string; label: string; value: string; share: number };

export function funnel(period: AnalyticsPeriod): FunnelStep[] {
  const steps = [
    { key: "ota", label: "OTA guests", n: BASE.otaGuests },
    { key: "reached", label: "Guests reached", n: BASE.reached },
    { key: "engaged", label: "Engaged guests", n: BASE.engaged },
    { key: "captured", label: "Guest data captured", n: BASE.captured },
    { key: "conversions", label: "Direct conversions", n: BASE.conversions },
  ];
  const out: FunnelStep[] = steps.map((s) => ({
    key: s.key,
    label: s.label,
    value: fmt(scale(s.n, period)),
    share: Math.round((s.n / BASE.otaGuests) * 100),
  }));
  out.push({
    key: "revenue",
    label: "Direct revenue",
    value: money(scale(BASE.revenue, period)),
    share: 100,
  });
  return out;
}

/* ------------------------- capture-by-source table ---------------------- */

export type SourceRow = {
  source: string;
  hint: string;
  emails: string;
  phones: string;
  addresses: string;
  guests: string;
  rate: string;
};

const SOURCES = [
  {
    source: "Automated campaign",
    hint: "Directful capture experiences",
    emails: 2840,
    phones: 1920,
    addresses: 1140,
    guests: 3126,
    rate: 49,
  },
  {
    source: "Staff collected",
    hint: "Entered by hotel staff",
    emails: 1420,
    phones: 980,
    addresses: 460,
    guests: 1840,
    rate: 28,
  },
  {
    source: "ID scanned",
    hint: "Read from guest ID at check-in",
    emails: 2160,
    phones: 1580,
    addresses: 1280,
    guests: 3180,
    rate: 53,
  },
];

export function sourceRows(period: AnalyticsPeriod): SourceRow[] {
  return SOURCES.map((s) => ({
    source: s.source,
    hint: s.hint,
    emails: fmt(scale(s.emails, period)),
    phones: fmt(scale(s.phones, period)),
    addresses: fmt(scale(s.addresses, period)),
    guests: fmt(scale(s.guests, period)),
    rate: `${s.rate}%`,
  }));
}

/* ---------------------------- stage performance ------------------------- */

export type StageRow = {
  stage: string;
  reached: string;
  momentum: number;
  engagement: string;
  emails: string;
  phones: string;
  addresses: string;
  conversions: string;
};

const STAGE_ROWS = [
  { stage: "Just Booked", reached: 8240, momentum: 8.4, engagement: "14.5%", emails: 2420, phones: 1920, addresses: 1140, conversions: null },
  { stage: "Pre-Check-In", reached: 6480, momentum: 6.1, engagement: "15.8%", emails: 1920, phones: 1420, addresses: 840, conversions: null },
  { stage: "During Stay", reached: 6120, momentum: 9.3, engagement: "14.2%", emails: 2840, phones: 2160, addresses: 1280, conversions: null },
  { stage: "Post-Checkout", reached: 5940, momentum: 7.6, engagement: "13.9%", emails: 1740, phones: 1420, addresses: 980, conversions: 380 },
  { stage: "Winback / Retain", reached: 4210, momentum: 5.2, engagement: "12.8%", emails: 1220, phones: 940, addresses: 640, conversions: 262 },
];

export function stageRows(period: AnalyticsPeriod): StageRow[] {
  return STAGE_ROWS.map((r) => ({
    stage: r.stage,
    reached: fmt(scale(r.reached, period)),
    momentum: r.momentum,
    engagement: r.engagement,
    emails: fmt(scale(r.emails, period)),
    phones: fmt(scale(r.phones, period)),
    addresses: fmt(scale(r.addresses, period)),
    conversions: r.conversions === null ? "—" : fmt(scale(r.conversions, period)),
  }));
}

/* --------------------------- channel performance ------------------------ */

export type ChannelRow = {
  channel: string;
  sent: string;
  delivered: string;
  ctr: string;
  response: string;
  conversions: string;
};

const CHANNELS = [
  { channel: "Email", sent: 824, delivered: 792, ctr: "36%", response: "12%", conversions: 412 },
  { channel: "Text", sent: 460, delivered: 449, ctr: "29%", response: "18%", conversions: 142 },
  { channel: "Email + Text", sent: null, delivered: null, ctr: "41%", response: "22%", conversions: 88 },
];

export function channelRows(period: AnalyticsPeriod): ChannelRow[] {
  return CHANNELS.map((c) => ({
    channel: c.channel,
    sent: c.sent === null ? "—" : fmt(scale(c.sent, period)),
    delivered: c.delivered === null ? "—" : fmt(scale(c.delivered, period)),
    ctr: c.ctr,
    response: c.response,
    conversions: fmt(scale(c.conversions, period)),
  }));
}

/* ------------------------------ time series ----------------------------- */

export type SeriesMetric = "ota" | "reached" | "captured" | "conversions" | "revenue";

export const SERIES_METRICS: { value: SeriesMetric; label: string }[] = [
  { value: "ota", label: "OTA guests" },
  { value: "reached", label: "Guests reached" },
  { value: "captured", label: "Guest data captured" },
  { value: "conversions", label: "Direct conversions" },
  { value: "revenue", label: "Direct revenue" },
];

const DAILY: Record<SeriesMetric, number> = {
  ota: BASE.otaGuests / 30,
  reached: BASE.reached / 30,
  captured: BASE.captured / 30,
  conversions: BASE.conversions / 30,
  revenue: BASE.revenue / 30,
};

const DAYS: Record<AnalyticsPeriod, number> = {
  "7d": 7,
  "15d": 15,
  "30d": 30,
  "90d": 90,
  custom: 45,
};

/** Stable pseudo-random wobble so the chart reads like real traffic. */
function wobble(i: number, seed: number) {
  const x = Math.sin((i + 1) * (12.9898 + seed)) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * 0.34;
}

export type SeriesPoint = { date: string; current: number; previous: number };

export function series(metric: SeriesMetric, period: AnalyticsPeriod): SeriesPoint[] {
  const days = DAYS[period];
  const step = days > 45 ? 3 : 1;
  const base = DAILY[metric] * step;
  const seed = metric.length;
  const points: SeriesPoint[] = [];
  const end = new Date(Date.UTC(2026, 7, 17));

  for (let i = days - 1; i >= 0; i -= step) {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - i);
    const trend = 1 + ((days - i) / days) * 0.22;
    const current = Math.max(0, Math.round(base * trend * (1 + wobble(i, seed))));
    const previous = Math.max(0, Math.round(base * 0.9 * (1 + wobble(i + 40, seed))));
    points.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      current,
      previous,
    });
  }
  return points;
}
