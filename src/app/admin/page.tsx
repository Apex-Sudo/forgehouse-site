"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconUsers,
  IconCreditCard,
  IconMessageCircle,
  IconUserCheck,
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons-react";

interface Metrics {
  users: { total: number; last7d: number; last30d: number };
  subscriptions: { active: number };
  conversations: {
    total: number;
    paid: number;
    free: number;
    messagesLast7d: number;
  };
  mentors: { total: number; active: number; inactive: number };
  onboarding: {
    total: number;
    phases: {
      extraction: number;
      calibration: number;
      ingestion: number;
      complete: number;
    };
  };
}

function StatCard({
  label,
  value,
  subValue,
  icon,
  trend,
}: {
  label: string;
  value: number | string;
  subValue?: string;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-light text-muted">
          {icon}
        </div>
        {trend && (
          <span
            className={`mono flex items-center gap-0.5 rounded-sm px-2 py-0.5 text-[10px] tracking-[0.06em] ${
              trend.positive
                ? "bg-accent/15 text-accent"
                : "bg-[#F2777A]/15 text-[#F2777A]"
            }`}
          >
            {trend.positive ? (
              <IconArrowUpRight size={14} stroke={2} />
            ) : (
              <IconArrowDownRight size={14} stroke={2} />
            )}
            {trend.value}
          </span>
        )}
      </div>
      <p className="mono mt-4 text-[26px] leading-none text-foreground">{value}</p>
      <p className="mono mt-2.5 text-[11px] uppercase tracking-[0.08em] text-faint">
        {label}
      </p>
      {subValue && <p className="mono mt-1.5 text-[11px] text-muted">{subValue}</p>}
    </div>
  );
}

function PipelineBar({
  phases,
}: {
  phases: Metrics["onboarding"]["phases"];
}) {
  const total =
    phases.extraction + phases.calibration + phases.ingestion + phases.complete;
  if (total === 0) {
    return (
      <p className="mono text-[12px] text-muted">No onboardings yet</p>
    );
  }

  const segments = [
    { key: "extraction", label: "Extraction", count: phases.extraction, color: "bg-white/25" },
    { key: "calibration", label: "Calibration", count: phases.calibration, color: "bg-tan" },
    { key: "ingestion", label: "Ingestion", count: phases.ingestion, color: "bg-[#E3B341]" },
    { key: "complete", label: "Complete", count: phases.complete, color: "bg-accent" },
  ];

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/10">
        {segments.map((seg) =>
          seg.count > 0 ? (
            <div
              key={seg.key}
              className={`${seg.color} transition-all duration-500`}
              style={{ width: `${(seg.count / total) * 100}%` }}
            />
          ) : null
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${seg.color}`} />
            <span className="mono text-[11px] uppercase tracking-[0.08em] text-faint">
              {seg.label}: <span className="text-foreground">{seg.count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-b-0">
      <span className="mono text-[11px] uppercase tracking-[0.06em] text-faint">
        {label}
      </span>
      <span className="mono text-[13px] text-foreground">{value}</span>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/session").then((r) => r.json()),
      fetch("/api/admin/metrics").then((r) => r.json()),
    ]).then(([sessionData, metricsData]) => {
      if (sessionData?.user?.role === "mentor") {
        router.replace("/admin/mentor-overview");
        return;
      }
      setMetrics(metricsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="mono text-[12px] text-muted">Failed to load metrics.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[32px] leading-none text-foreground">Dashboard</h1>
        <p className="mono mt-2.5 text-[12px] text-muted">
          Overview of ForgeHouse platform metrics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={metrics.users.total}
          subValue={`+${metrics.users.last7d} this week`}
          icon={<IconUsers size={20} stroke={1.5} />}
          trend={
            metrics.users.last7d > 0
              ? { value: `${metrics.users.last7d} / 7d`, positive: true }
              : undefined
          }
        />
        <StatCard
          label="Active Subscribers"
          value={metrics.subscriptions.active}
          icon={<IconCreditCard size={20} stroke={1.5} />}
        />
        <StatCard
          label="Conversations"
          value={metrics.conversations.total}
          subValue={`${metrics.conversations.messagesLast7d} messages this week`}
          icon={<IconMessageCircle size={20} stroke={1.5} />}
        />
        <StatCard
          label="Active Mentors"
          value={`${metrics.mentors.active} / ${metrics.mentors.total}`}
          subValue={`${metrics.mentors.inactive} inactive`}
          icon={<IconUserCheck size={20} stroke={1.5} />}
        />
      </div>

      <div className="mt-8 rounded-md border border-border bg-surface p-6">
        <h2 className="mb-2 text-[24px] leading-none text-foreground">
          Onboarding Pipeline
        </h2>
        <p className="mono mb-6 text-[11px] uppercase tracking-[0.08em] text-faint">
          {metrics.onboarding.total} total onboarding sessions
        </p>
        <PipelineBar phases={metrics.onboarding.phases} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-surface p-6">
          <h3 className="mb-4 text-[20px] leading-none text-foreground">Signups</h3>
          <div>
            <MetricRow label="Last 7 days" value={metrics.users.last7d} />
            <MetricRow label="Last 30 days" value={metrics.users.last30d} />
            <MetricRow label="All time" value={metrics.users.total} />
          </div>
        </div>

        <div className="rounded-md border border-border bg-surface p-6">
          <h3 className="mb-4 text-[20px] leading-none text-foreground">
            Conversations
          </h3>
          <div>
            <MetricRow label="Paid subscribers" value={metrics.conversations.paid} />
            <MetricRow label="Free tier" value={metrics.conversations.free} />
            <MetricRow
              label="Messages (7d)"
              value={metrics.conversations.messagesLast7d}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
