"use client";

import { useEffect, useState } from "react";
import {
  IconUsers,
  IconMessageCircle,
  IconUserCheck,
  IconClock,
  IconArrowUpRight,
  IconArrowDownRight,
  IconCurrencyDollar,
} from "@tabler/icons-react";

interface MentorStat {
  name: string;
  slug: string;
  conversationCount: number;
  messageCount: number;
  lastConversationAt: string | null;
  monthlyEarnings?: number;
}

interface MentorOverviewStats {
  totalMentors: number;
  activeMentors: number;
  totalConversations: number;
  totalMessages: number;
  lastActiveAt: string | null;
  totalEarnings?: number;
  mentors: MentorStat[];
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
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-light text-muted">
          {icon}
        </div>
        {trend && (
          <span
            className={`mono flex items-center gap-0.5 text-[11px] tracking-[0.04em] ${
              trend.positive ? "text-accent" : "text-[#F2777A]"
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
      <p className="mono mt-4 text-[26px] leading-none text-foreground">
        {value}
      </p>
      <p className="mono mt-2 text-[11px] uppercase tracking-[0.08em] text-faint">
        {label}
      </p>
      {subValue && (
        <p className="mono mt-1 text-[10px] tracking-[0.04em] text-faint">
          {subValue}
        </p>
      )}
    </div>
  );
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function MentorsTable({
  mentors,
  isAdmin,
}: {
  mentors: MentorStat[];
  isAdmin: boolean;
}) {
  if (mentors.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-12 text-center">
        <p className="text-muted">No conversations yet.</p>
      </div>
    );
  }

  return (
    <div className="fh-scroll overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-light">
            <th className="mono px-6 py-3 text-left text-[11px] font-normal uppercase tracking-[0.08em] text-faint">
              Mentor
            </th>
            <th className="mono px-6 py-3 text-right text-[11px] font-normal uppercase tracking-[0.08em] text-faint">
              Conversations
            </th>
            <th className="mono px-6 py-3 text-right text-[11px] font-normal uppercase tracking-[0.08em] text-faint">
              Messages
            </th>
            <th className="mono px-6 py-3 text-right text-[11px] font-normal uppercase tracking-[0.08em] text-faint">
              Last Active
            </th>
          </tr>
        </thead>
        <tbody>
          {mentors.map((m) => (
            <tr
              key={m.slug}
              className="border-b border-border transition last:border-b-0 hover:bg-surface-light"
            >
              <td className="px-6 py-4 text-[16px] text-foreground">
                {m.name || m.slug}
              </td>
              <td className="mono px-6 py-4 text-right text-[13px] text-foreground">
                {m.conversationCount}
              </td>
              <td className="mono px-6 py-4 text-right text-[13px] text-foreground">
                {m.messageCount}
              </td>
              <td className="mono px-6 py-4 text-right text-[12px] text-faint">
                {formatRelativeTime(m.lastConversationAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MentorOverviewPage() {
  const [stats, setStats] = useState<MentorOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Fetch session to determine role
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setSession(data?.user || null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/mentor-overview")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-accent" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <p className="mono text-[12px] tracking-[0.04em] text-muted">
          Failed to load mentor overview.
        </p>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session as any)?.role || "admin";
  const isAdmin = role === "admin";
  const pageLabel = isAdmin ? "All Mentors" : "My Mentors";

  return (
    <div className="min-h-full bg-background p-8">
      <div className="mb-8">
        <h1 className="text-[32px] leading-none text-foreground">
          {isAdmin ? "Admin Dashboard" : "Mentor Overview"}
        </h1>
        <p className="mono mt-3 text-[12px] tracking-[0.04em] text-muted">
          {isAdmin
            ? "Overview of all mentor usage on the platform"
            : `Overview for ${stats.mentors.map((m) => m.name || m.slug).join(", ") || "your mentors"}`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Mentors"
          value={stats.totalMentors}
          icon={<IconUsers size={20} stroke={1.5} />}
        />
        <StatCard
          label="Active Mentors"
          value={stats.activeMentors}
          subValue={isAdmin ? "with conversations" : undefined}
          icon={<IconUserCheck size={20} stroke={1.5} />}
        />
        <StatCard
          label="Conversations"
          value={stats.totalConversations}
          icon={<IconMessageCircle size={20} stroke={1.5} />}
        />
        <StatCard
          label="Total Messages"
          value={stats.totalMessages}
          icon={<IconClock size={20} stroke={1.5} />}
        />
        <StatCard
          label="Monthly Earnings"
          value={`$${((stats.totalEarnings || 0) / 100).toFixed(2)}`}
          icon={<IconCurrencyDollar size={20} stroke={1.5} />}
        />
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-[24px] leading-none text-foreground">
          {pageLabel}
        </h2>
        <MentorsTable mentors={stats.mentors} isAdmin={isAdmin} />
      </div>
    </div>
  );
}