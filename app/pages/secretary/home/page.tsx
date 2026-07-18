"use client"

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { accountInterface } from "@/app/types/account.type";
import { businessInterface } from "@/app/types/business.type";
import { documentRequestInterface } from "@/app/types/documentRequest";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  Building2,
  FileText,
  PhilippinePeso,
  Loader2,
  TrendingUp,
  UserRound,
  Heart,
  MapPin,
  Vote,
  BarChart3,
  Wallet,
  FileCheck,
} from "lucide-react";
import { documentTypes } from "@/app/utils/documents";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Colors ──────────────────────────────────────────────────────
const CHART_COLORS = [
  "#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
  "#06b6d4", "#d946ef", "#eab308", "#22c55e", "#3b82f6",
  "#a855f7", "#e11d48", "#0d9488", "#ca8a04", "#dc2626",
];

const GENDER_COLORS: Record<string, string> = {
  Male: "#0ea5e9",
  Female: "#ec4899",
  Other: "#8b5cf6",
};

const CIVIL_STATUS_COLORS: Record<string, string> = {
  Single: "#0ea5e9",
  Married: "#10b981",
  Widowed: "#8b5cf6",
  Separated: "#f59e0b",
  Divorced: "#ef4444",
};

const VOTER_COLORS: Record<string, string> = {
  Registered: "#10b981",
  "Not Registered": "#ef4444",
};

// ─── Helpers ─────────────────────────────────────────────────────
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-md px-3 py-2 text-sm">
        <p className="font-semibold text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// ─── Stat Card ────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sublabel?: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {sublabel && (
            <p className="text-xs text-gray-400">{sublabel}</p>
          )}
        </div>
        <div className={`size-10 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="size-5 text-white" />
        </div>
      </div>
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <Skeleton className="h-5 w-40 mb-4" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

// ─── Chart Card Wrapper ──────────────────────────────────────────
function ChartCard({
  icon: Icon,
  title,
  subtitle,
  iconBg,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  iconBg: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className={`size-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className="size-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Main Dashboard Page ─────────────────────────────────────────
export default function SecretaryDashboard() {
  const [timeRange, setTimeRange] = useState<"7" | "30" | "all">("30");

  // ── Fetch all accounts ────────────────────────────────────────
  const { data: accounts, isLoading: accountsLoading } = useQuery<accountInterface[]>({
    queryKey: ["accounts", "all"],
    queryFn: async () => {
      const res = await axiosInstance.get("/account");
      return res.data;
    },
  });

  // ── Fetch all businesses ──────────────────────────────────────
  const { data: businesses, isLoading: businessesLoading } = useQuery<businessInterface[]>({
    queryKey: ["businesses", "all"],
    queryFn: async () => {
      const res = await axiosInstance.get("/business");
      return res.data;
    },
  });

  // ── Fetch all document requests ───────────────────────────────
  const { data: documents, isLoading: documentsLoading } = useQuery<documentRequestInterface[]>({
    queryKey: ["document-requests", "all"],
    queryFn: async () => {
      const res = await axiosInstance.get("/document-request");
      return res.data;
    },
  });

  const isLoading = accountsLoading || businessesLoading || documentsLoading;

  // ════════════════════════════════════════════════════════════════
  //  RESIDENT DEMOGRAPHICS
  // ════════════════════════════════════════════════════════════════

  // ── Gender Distribution ────────────────────────────────────────
  const genderDistribution = useMemo(() => {
    if (!accounts) return [];
    const counts: Record<string, number> = {};
    accounts.forEach((a) => {
      const key = a.gender || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [accounts]);

  // ── Civil Status Distribution ──────────────────────────────────
  const civilStatusDistribution = useMemo(() => {
    if (!accounts) return [];
    const counts: Record<string, number> = {};
    accounts.forEach((a) => {
      const key = a.civilStatus || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [accounts]);

  // ── Purok Distribution ─────────────────────────────────────────
  const purokDistribution = useMemo(() => {
    if (!accounts) return [];
    const counts: Record<string, number> = {};
    accounts.forEach((a) => {
      const key = a.purok || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [accounts]);

  // ── Voter Status Distribution ──────────────────────────────────
  const voterDistribution = useMemo(() => {
    if (!accounts) return [];
    const counts: Record<string, number> = {};
    accounts.forEach((a) => {
      const key = a.voterStatus || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [accounts]);

  // ════════════════════════════════════════════════════════════════
  //  FINANCIAL / DOCUMENT ANALYTICS
  // ════════════════════════════════════════════════════════════════

  // ── Total revenue from paid documents ─────────────────────────
  const totalRevenue = useMemo(() => {
    if (!documents) return 0;
    return documents
      .filter((d) => d.isPaid)
      .reduce((sum, d) => sum + (d.price || 0), 0);
  }, [documents]);

  // ── Daily earnings from paid documents ────────────────────────
  const dailyEarnings = useMemo(() => {
    if (!documents) return [];

    const paidDocs = documents.filter((d) => d.isPaid && d.dateIssued);

    // Group by date
    const daily: Record<string, number> = {};
    paidDocs.forEach((d) => {
      const date = d.dateIssued!.split("T")[0];
      daily[date] = (daily[date] || 0) + (d.price || 0);
    });

    // Get date range for filter
    const dates = Object.keys(daily).sort();
    if (dates.length === 0) return [];

    let filteredDates = dates;
    if (timeRange !== "all") {
      const days = parseInt(timeRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().split("T")[0];
      filteredDates = dates.filter((d) => d >= cutoffStr);
    }

    return filteredDates.map((date) => ({
      date,
      earnings: daily[date],
      count: paidDocs.filter((d) => d.dateIssued!.split("T")[0] === date).length,
    }));
  }, [documents, timeRange]);

  // ── Most requested documents ──────────────────────────────────
  const documentRequestDistribution = useMemo(() => {
    if (!documents) return [];

    const counts: Record<string, number> = {};
    documents.forEach((d) => {
      counts[d.document] = (counts[d.document] || 0) + 1;
    });

    const DOCUMENT_NAMES: Record<string, string> = {
      barangayCertificate: "Barangay Certificate",
      barangayClearance: "Barangay Clearance",
      certificateOfResidency: "Certificate of Residency",
      certificateOfIndigency: "Certificate of Indigency",
      certificateOfGoodMoralCharacter: "Good Moral Character",
      certificateOfUnemployment: "Unemployment Cert.",
      barangayBusinessClearance: "Business Clearance",
    };

    return Object.entries(counts)
      .map(([key, value]) => ({
        name: DOCUMENT_NAMES[key] || key,
        key,
        count: value,
        revenue: documents
          .filter((d) => d.document === key && d.isPaid)
          .reduce((s, d) => s + (d.price || 0), 0),
      }))
      .sort((a, b) => b.count - a.count);
  }, [documents]);

  // ── Summary stats ─────────────────────────────────────────────
  const stats = useMemo(() => {
    return {
      totalAccounts: accounts?.length || 0,
      approvedAccounts: accounts?.filter((a) => a.status === "approved").length || 0,
      pendingAccounts: accounts?.filter((a) => a.status === "pending").length || 0,
      totalBusinesses: businesses?.length || 0,
      approvedBusinesses: businesses?.filter((b) => b.status === "approved").length || 0,
      pendingBusinesses: businesses?.filter((b) => b.status === "pending").length || 0,
      totalDocuments: documents?.length || 0,
      paidDocuments: documents?.filter((d) => d.isPaid).length || 0,
      pendingDocuments: documents?.filter((d) => d.status === "pending").length || 0,
    };
  }, [accounts, businesses, documents]);

  if (isLoading) {
    return (
      <div className="w-full min-h-dvh p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm">Loading dashboard data...</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ChartSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-dvh p-4 sm:p-6 space-y-6">
      {/* ══════════════════════════════════════════════════════════
          HEADER
          ══════════════════════════════════════════════════════════ */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="size-6 text-sky-600" />
          Barangay Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of residents, businesses, document requests, and financial performance
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SUMMARY STATS CARDS
          ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          label="Total Residents"
          value={stats.totalAccounts}
          sublabel={`${stats.approvedAccounts} approved · ${stats.pendingAccounts} pending`}
          accent="bg-gradient-to-br from-sky-500 to-sky-600"
        />
        <StatCard
          icon={Building2}
          label="Total Businesses"
          value={stats.totalBusinesses}
          sublabel={`${stats.approvedBusinesses} approved · ${stats.pendingBusinesses} pending`}
          accent="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatCard
          icon={FileText}
          label="Document Requests"
          value={stats.totalDocuments}
          sublabel={`${stats.paidDocuments} paid · ${stats.pendingDocuments} pending`}
          accent="bg-gradient-to-br from-violet-500 to-violet-600"
        />
        <StatCard
          icon={PhilippinePeso}
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          sublabel={`From ${stats.paidDocuments} paid document${stats.paidDocuments !== 1 ? "s" : ""}`}
          accent="bg-gradient-to-br from-amber-500 to-amber-600"
        />
      </div>

      {/* ══════════════════════════════════════════════════════════
          RESIDENT DEMOGRAPHICS SECTION
          ══════════════════════════════════════════════════════════ */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Users className="size-5 text-sky-600" />
          Resident Demographics
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ── Gender Pie ── */}
          <ChartCard
            icon={UserRound}
            title="Gender Distribution"
            iconBg="bg-gradient-to-br from-sky-500 to-cyan-500"
          >
            {genderDistribution.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {genderDistribution.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={GENDER_COLORS[entry.name] || "#9ca3af"}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value: string) => (
                        <span className="text-xs text-gray-600">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                No demographic data available
              </div>
            )}
          </ChartCard>

          {/* ── Civil Status Pie ── */}
          <ChartCard
            icon={Heart}
            title="Civil Status Distribution"
            iconBg="bg-gradient-to-br from-rose-500 to-pink-500"
          >
            {civilStatusDistribution.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={civilStatusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {civilStatusDistribution.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={CIVIL_STATUS_COLORS[entry.name] || "#9ca3af"}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value: string) => (
                        <span className="text-xs text-gray-600">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                No demographic data available
              </div>
            )}
          </ChartCard>

          {/* ── Purok Bar Chart ── */}
          <ChartCard
            icon={MapPin}
            title="Purok Distribution"
            iconBg="bg-gradient-to-br from-emerald-500 to-teal-500"
          >
            {purokDistribution.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={purokDistribution}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      width={90}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="value" name="Residents" radius={[0, 4, 4, 0]}>
                      {purokDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                No purok data available
              </div>
            )}
          </ChartCard>

          {/* ── Voter Status Pie ── */}
          <ChartCard
            icon={Vote}
            title="Voter Status"
            iconBg="bg-gradient-to-br from-violet-500 to-purple-500"
          >
            {voterDistribution.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={voterDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {voterDistribution.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={VOTER_COLORS[entry.name] || "#9ca3af"}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value: string) => (
                        <span className="text-xs text-gray-600">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                No voter data available
              </div>
            )}
          </ChartCard>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          FINANCIAL & DOCUMENT ANALYTICS
          ══════════════════════════════════════════════════════════ */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <TrendingUp className="size-5 text-sky-600" />
          Financial & Document Analytics
        </h2>

        {/* ── Revenue Summary Mini Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200 p-4">
            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Total Revenue</p>
            <p className="text-xl font-bold text-emerald-800 mt-1">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-gradient-to-br from-sky-50 to-sky-100/50 rounded-xl border border-sky-200 p-4">
            <p className="text-xs font-medium text-sky-700 uppercase tracking-wider">Paid Documents</p>
            <p className="text-xl font-bold text-sky-800 mt-1">{stats.paidDocuments}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200 p-4">
            <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">Avg. per Document</p>
            <p className="text-xl font-bold text-amber-800 mt-1">
              {stats.paidDocuments > 0 ? formatCurrency(Math.round(totalRevenue / stats.paidDocuments)) : "₱0"}
            </p>
          </div>
          <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl border border-violet-200 p-4">
            <p className="text-xs font-medium text-violet-700 uppercase tracking-wider">Doc Types</p>
            <p className="text-xl font-bold text-violet-800 mt-1">{documentTypes.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ── Daily Earnings Chart ── */}
          <ChartCard
            icon={Wallet}
            title="Daily Earnings"
            subtitle={`From paid document requests (${timeRange === "all" ? "all time" : `last ${timeRange} days`})`}
            iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
          >
            {/* Time range selector */}
            <div className="flex items-center gap-2 mb-3">
              {(["7", "30", "all"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    timeRange === range
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {range === "all" ? "All" : `${range}d`}
                </button>
              ))}
            </div>

            {dailyEarnings.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyEarnings} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={false}
                      tickFormatter={(val: string) => {
                        const d = new Date(val);
                        return d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
                      }}
                      interval={Math.max(0, Math.floor(dailyEarnings.length / 10) - 1)}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val: number) => `₱${val}`}
                    />
                    <Tooltip
                      content={({ active, payload, label }: any) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white rounded-lg border border-gray-200 shadow-md px-3 py-2 text-sm">
                              <p className="font-semibold text-gray-900">
                                {new Date(label).toLocaleDateString("en-PH", {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                              <p style={{ color: "#10b981" }} className="font-medium">
                                Earnings: {formatCurrency(data.earnings)}
                              </p>
                              <p className="text-gray-500 text-xs">
                                {data.count} document{data.count !== 1 ? "s" : ""}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      name="Earnings"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#earningsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                No paid document data available
              </div>
            )}
          </ChartCard>

          {/* ── Most Requested Documents ── */}
          <ChartCard
            icon={FileCheck}
            title="Most Requested Documents"
            subtitle="By number of requests"
            iconBg="bg-gradient-to-br from-sky-500 to-sky-600"
          >
            {documentRequestDistribution.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={documentRequestDistribution}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      width={130}
                    />
                    <Tooltip
                      content={({ active, payload, label }: any) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white rounded-lg border border-gray-200 shadow-md px-3 py-2 text-sm">
                              <p className="font-semibold text-gray-900">{label}</p>
                              <p style={{ color: "#0ea5e9" }} className="font-medium">
                                Requests: {data.count}
                              </p>
                              <p className="text-gray-500 text-xs">
                                Revenue: {formatCurrency(data.revenue)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" name="Requests" radius={[0, 4, 4, 0]}>
                      {documentRequestDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                No document request data available
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
