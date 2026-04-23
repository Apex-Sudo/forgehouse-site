"use client";

import { useEffect, useState } from "react";
import {
  IconUsers,
  IconMessageCircle,
  IconUserCheck,
  IconClock,
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons-react";

interface MentorStat {
  name: string;
  slug: string;
  conversationCount: number;
  messageCount: number;
  lastConversationAt: string | null;
}

interface MentorOverviewStats {
  totalMentors: number;
  activeMentors: number;
  totalConversations: number;
  totalMessages: number;
  lastActiveAt: string | null;
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
      <div className="rounded-xl border border-[#E5E2DC] bg-white p-12 text-center">
        <p className="text-[#999]">No conversations yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E5E2DC] bg-white overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E5E2DC]">
            <th className="px-6 py-3 text-left font-semibold text-[#737373]">Mentor</th>
            <th className="px-6 py-3 text-right font-semibold text-[#737373]">Conversations</th>
            <th className="px-6 py-3 text-right font-semibold text-[#737373]">Messages</th>
            <th className="px-6 py-3 text-right font-semibold text-[#737373]">Last Active</th>
          </tr>
        </thead>
        <tbody>
          {mentors.map((m) => (
            <tr key={m.slug} className="border-b border-[#F5F3F0] hover:bg-[#FAFAF8]">
              <td className="px-6 py-4 font-medium text-[#1A1A1A]">{m.name || m.slug}</td>
              <td className="px-6 py-4 text-right text-[#1A1A1A]">{m.conversationCount}</td>
              <td className="px-6 py-4 text-right text-[#1A1A1A]">{m.messageCount}</td>
              <td className="px-6 py-4 text-right text-[#999]">
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
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-amber" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[#999]">Failed to load mentor overview.</p>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session as any)?.role || "admin";
  const isAdmin = role === "admin";
  const pageLabel = isAdmin ? "All Mentors" : "My Mentors";

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          {isAdmin ? "Admin Dashboard" : "Mentor Overview"}
        </h1>
        <p className="mt-1 text-sm text-[#999]">
          {isAdmin
            ? "Overview of all mentor usage on the platform"
            : `Overview for ${stats.mentors.map((m) => m.name || m.slug).join(", ") || "your mentors"}`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-[#1A1A1A]">{pageLabel}</h2>
        <MentorsTable mentors={stats.mentors} isAdmin={isAdmin} />
      </div>
    </div>
  );
}