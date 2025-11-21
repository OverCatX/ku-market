"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Flag, RefreshCcw, ArrowLeft } from "lucide-react";

import { getMyReports } from "@/config/reports";
import { ReportSummary, ReportStatus } from "@/types/report";
import { Pagination } from "@/components/admin/Pagination";

const statusBadgeClasses: Record<ReportStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_review: "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  dismissed: "bg-gray-100 text-gray-700 border-gray-200",
};

const formatDate = (value?: string | Date | null): string => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

export default function MyReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyReports(currentPage, itemsPerPage);
      setReports(data.reports);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.total);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load reports";
      toast.error(message);
      if (message.toLowerCase().includes("login")) {
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, router]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadReports();
      toast.success("Reports updated");
    } finally {
      setRefreshing(false);
    }
  }, [loadReports]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);


  return (
    <div style={{ backgroundColor: '#F6F2E5', minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>
      </div>

      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#4A5130]">My Reports</h1>
          <p className="text-sm md:text-base text-gray-600">
            Track the status of reports you have submitted to the KU Market admin team.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[#4A5130] hover:bg-[#4A5130]/60 hover:text-[#F6F2E5] transition disabled:opacity-60 group"
        >
          <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""} text-[#4A5130] group-hover:text-[#F6F2E5]`} />
          Refresh
        </button>
      </header>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
          <Flag className="w-10 h-10 mx-auto mb-3 text-[#69773D]" />
          <p className="text-lg font-semibold text-[#4A5130]">No reports yet</p>
          <p className="text-sm text-[#69773D]">
            If you encounter an issue, you can submit a report from the report center.
          </p>
          <Link
            href="/report"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[#F6F2E5] bg-[#69773D] shadow hover:shadow-lg hover:bg-[#5a6530] transition"
          >
            Go to Report Center
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reports.map((report) => (
            <article
              key={report.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
            >
              <header className="px-5 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-[#780606] text-white p-2 mt-1">
                    <Flag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {report.itemTitle || report.category || "General Report"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Submitted on {formatDate(report.createdAt)}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusBadgeClasses[report.status]}`}
                >
                  {report.status.replace("_", " ")}
                </span>
              </header>

              <div className="px-5 py-4 space-y-4 text-sm text-gray-700">
                <div>
                  <p className="text-gray-500 mb-1">Details</p>
                  <p className="leading-relaxed whitespace-pre-line">{report.details}</p>
                </div>

                {report.adminNotes && (
                  <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-1">
                      Admin notes
                    </p>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {report.adminNotes}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div>
                    <p className="text-gray-500">Last updated</p>
                    <p className="font-medium text-gray-800">{formatDate(report.updatedAt)}</p>
                  </div>
                  {report.reviewedAt && (
                    <div>
                      <p className="text-gray-500">Reviewed at</p>
                      <p className="font-medium text-gray-800">{formatDate(report.reviewedAt)}</p>
                    </div>
                  )}
                </div>

                {report.attachments && report.attachments.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-1">Attachments</p>
                    <div className="flex flex-wrap gap-2">
                      {report.attachments.map((file, idx) => (
                        <a
                          key={file}
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 transition"
                        >
                          <span>Attachment {idx + 1}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
            ))}
          </div>
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
        </>
      )}
      </div>
    </div>
  );
}
