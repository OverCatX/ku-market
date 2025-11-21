"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Flag,
  RefreshCcw,
  Filter,
  ExternalLink,
  User as UserIcon,
} from "lucide-react";

import {
  getAdminReports,
  updateReportStatus,
  AdminReportFilters,
} from "@/config/reports";
import { ReportStatus, ReportSummary } from "@/types/report";

const STATUS_OPTIONS: { value: ReportStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_review", label: "In review" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

const TYPE_OPTIONS: { value: "general" | "item" | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "general", label: "General" },
  { value: "item", label: "Item" },
];

const statusBadgeClasses: Record<ReportStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_review: "bg-[#69773D]/10 text-[#69773D] border-transparent",
  resolved: "bg-[#69773D]/10 text-[#69773D] border-transparent",
  dismissed: "bg-gray-100 text-gray-800 border-gray-200",
};

const formatDateTime = (value?: string | Date | null): string => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

interface ReportCardProps {
  report: ReportSummary;
  onUpdate: (payload: { status: ReportStatus; notes?: string }) => Promise<void>;
  updating: boolean;
}

function ReportCard({ report, onUpdate, updating }: ReportCardProps) {
  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [notes, setNotes] = useState(report.adminNotes || "");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setStatus(report.status);
    setNotes(report.adminNotes || "");
  }, [report.id, report.status, report.adminNotes]);

  const handleSubmit = async () => {
    if (status === report.status && notes.trim() === (report.adminNotes || "")) {
      toast("No changes to update", { icon: "ℹ️" });
      return;
    }

    await onUpdate({ status, notes: notes.trim() || undefined });
  };

  return (
    <article className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-full bg-[#780606] text-[#F6F2E5] p-2">
            <Flag className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-[#4A5130]">
                {report.itemTitle || report.category || "General Report"}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                {report.type === "item" ? "Item" : "General"}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadgeClasses[report.status]}`}
              >
                {report.status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {report.details}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-sm font-medium text-[#69773D] hover:text-[#5a6530]"
        >
          {expanded ? "Hide details" : "View details"}
        </button>
      </header>

      {expanded && (
        <div className="px-5 py-4 space-y-4 border-b border-gray-100 bg-gray-50/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Report ID</p>
              <p className="font-medium text-gray-800 break-all">{report.id}</p>
            </div>
            <div>
              <p className="text-gray-500">Created at</p>
              <p className="font-medium text-gray-800">{formatDateTime(report.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-500">Last updated</p>
              <p className="font-medium text-gray-800">{formatDateTime(report.updatedAt)}</p>
            </div>
            {report.reviewedAt && (
              <div>
                <p className="text-gray-500">Reviewed at</p>
                <p className="font-medium text-gray-800">{formatDateTime(report.reviewedAt)}</p>
              </div>
            )}
          </div>

          {report.itemId && (
            <div className="text-sm text-gray-700">
              <p className="text-gray-500">Item</p>
              <p className="font-medium break-all">{report.itemId}</p>
            </div>
          )}

          {report.user && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <UserIcon className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{report.user.name || "User"}</span>
              {report.user.email && (
                <span className="text-gray-500">({report.user.email})</span>
              )}
            </div>
          )}

          {report.attachments && report.attachments.length > 0 && (
            <div className="text-sm">
              <p className="text-gray-500 mb-1">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {report.attachments.map((attachment, index) => (
                  <a
                    key={attachment}
                    href={attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Attachment {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <footer className="px-5 py-4 bg-white space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <label className="text-sm font-medium text-[#4A5130]" htmlFor={`status-${report.id}`}>
            Update status
          </label>
          <select
            id={`status-${report.id}`}
            value={status}
            onChange={(e) => setStatus(e.target.value as ReportStatus)}
            className="w-full md:w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#69773D]"
          >
            {STATUS_OPTIONS.filter((option) => option.value !== "all").map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-[#4A5130]" htmlFor={`notes-${report.id}`}>
            Admin notes (optional)
          </label>
          <textarea
            id={`notes-${report.id}`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-[#F6F2E5]/30 focus:outline-none focus:ring-2 focus:ring-[#69773D]"
            placeholder="Add context or next steps for the reporter"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setStatus(report.status);
              setNotes(report.adminNotes || "");
            }}
            className="text-sm font-medium text-[#4A5130] hover:text-[#69773D]"
            disabled={updating}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#69773D] hover:bg-[#5a6530] transition disabled:opacity-60"
            disabled={updating}
          >
            {updating ? "Updating..." : "Save changes"}
          </button>
        </div>
      </footer>
    </article>
  );
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminReportFilters>({});

  const loadReports = async (options: AdminReportFilters = filters) => {
    setLoading(true);
    try {
      const data = await getAdminReports(options);
      setReports(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load reports";
      toast.error(message);
      if (message.toLowerCase().includes("login")) {
        router.replace("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = async (
    key: keyof AdminReportFilters,
    value: string
  ) => {
    const nextFilters: AdminReportFilters = {
      ...filters,
      [key]: value === "all" ? undefined : (value as AdminReportFilters[keyof AdminReportFilters]),
    };
    setFilters(nextFilters);
    await loadReports(nextFilters);
  };

  const handleRefresh = async () => {
    await loadReports(filters);
    toast.success("Reports refreshed");
  };

  const handleUpdate = async (
    reportId: string,
    payload: { status: ReportStatus; notes?: string }
  ) => {
    setUpdatingId(reportId);
    try {
      const updated = await updateReportStatus(reportId, payload.status, payload.notes);
      setReports((prev) =>
        prev.map((report) => (report.id === reportId ? { ...report, ...updated } : report))
      );
      toast.success("Report updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update report";
      toast.error(message);
      if (message.toLowerCase().includes("login")) {
        router.replace("/admin/login");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6" style={{ backgroundColor: '#F6F2E5', minHeight: '100vh', padding: '2rem' }}>
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#4A5130]">
            Reports
          </h1>
          <p className="text-sm md:text-base text-[#69773D] mt-1">
            Review reports submitted by users and keep the marketplace safe.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#F6F2E5] text-[#4A5130] rounded-lg hover:bg-[#69773D]/10 hover:text-[#4A5130] disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-5 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-2 text-[#4A5130]">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <select
              value={filters.status ?? "all"}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#69773D]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filters.type ?? "all"}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#69773D]"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-[#4A5130]">
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <Flag className="w-10 h-10 mx-auto mb-3 text-[#69773D]" />
          <p className="text-lg font-semibold text-[#4A5130]">No reports found</p>
          <p className="text-sm text-[#69773D]">Try adjusting the filters or check back later.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              updating={updatingId === report.id}
              onUpdate={(payload) => handleUpdate(report.id, payload)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
