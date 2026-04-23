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
    <div className="rounded-xl border border-[#E5E2DC] bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F3F0] text-[#737373]">
          {icon}
        </div>
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium ${
              trend.positive ? "text-green-600" : "text-red-500"
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
      <p className="mt-3 text-2xl font-bold text-[#1A1A1A]">{value}</p>
      <p className="mt-1 text-sm text-[#999]">{label}</p>
      {subValue && <p className="mt-0.5 text-xs text-[#B8B8B8]">{subValue}</p>}
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
      <p className="text-sm text-[#999]">No onboardings yet</p>
    );
  }

  const segments = [
    { key: "extraction", label: "Extraction", count: phases.extraction, color: "bg-blue-400" },
    { key: "calibration", label: "Calibration", count: phases.calibration, color: "bg-amber" },
    { key: "ingestion", label: "Ingestion", count: phases.ingestion, color: "bg-purple-400" },
    { key: "complete", label: "Complete", count: phases.complete, color: "bg-green-500" },
  ];

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#F5F5F5]">
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
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
            <span className="text-[#737373]">
              {seg.label}: <span className="font-medium text-[#1A1A1A]">{seg.count}</span>
            </span>
          </div>
        ))}
      </div>
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[#999]">Failed to load metrics.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#999]">
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

      <div className="mt-8 rounded-xl border border-[#E5E2DC] bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-[#1A1A1A]">
          Onboarding Pipeline
        </h2>
        <p className="mb-4 text-sm text-[#999]">
          {metrics.onboarding.total} total onboarding sessions
        </p>
        <PipelineBar phases={metrics.onboarding.phases} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E5E2DC] bg-white p-6">
          <h3 className="mb-3 font-bold text-[#1A1A1A]">Signups</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#737373]">Last 7 days</span>
              <span className="font-medium text-[#1A1A1A]">
                {metrics.users.last7d}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#737373]">Last 30 days</span>
              <span className="font-medium text-[#1A1A1A]">
                {metrics.users.last30d}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#737373]">All time</span>
              <span className="font-medium text-[#1A1A1A]">
                {metrics.users.total}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E2DC] bg-white p-6">
          <h3 className="mb-3 font-bold text-[#1A1A1A]">Conversations</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#737373]">Paid subscribers</span>
              <span className="font-medium text-[#1A1A1A]">
                {metrics.conversations.paid}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#737373]">Free tier</span>
              <span className="font-medium text-[#1A1A1A]">
                {metrics.conversations.free}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#737373]">Messages (7d)</span>
              <span className="font-medium text-[#1A1A1A]">
                {metrics.conversations.messagesLast7d}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
