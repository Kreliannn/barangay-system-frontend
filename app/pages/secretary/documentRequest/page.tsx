"use client"

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { documentRequestInterface } from "@/app/types/documentRequest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import UpdateStatusModal from "./components/updateStatusModal";
import PaymentModal from "./components/paymentModal";
import ViewDetailsModal from "./components/viewDetailsModal";
import { generateDocumentPDF } from "@/app/utils/generateDocument";
import {
  Search,
  FileText,
  Clock,
  Loader2,
  CheckCircle2,
  FileCheck,
  ClipboardList,
  CalendarDays,
  Inbox,
  UserRound,
  Wallet,
  ArrowUpRight,
  Receipt,
  Eye,
  Download,
} from "lucide-react";

// ─── Status config ───────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  pending:    { label: "Pending",    icon: Clock,        bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200" },
  processing: { label: "Processing", icon: Loader2,      bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200" },
  "to claim": { label: "To Claim",   icon: FileCheck,    bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200" },
  completed:  { label: "Completed",  icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

// ─── Document display names ──────────────────────────────────────
const DOCUMENT_NAMES: Record<string, string> = {
  barangayCertificate: "Barangay Certificate",
  barangayClearance: "Barangay Clearance",
  certificateOfResidency: "Certificate of Residency",
  certificateOfIndigency: "Certificate of Indigency",
  certificateOfGoodMoralCharacter: "Certificate of Good Moral Character",
  certificateOfUnemployment: "Certificate of Unemployment",
  barangayBusinessClearance: "Barangay Business Clearance",
};

// ─── Format date ─────────────────────────────────────────────────
function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function SecretaryDocumentRequestsPage() {
  const [search, setSearch] = useState("");
  const [statusDoc, setStatusDoc] = useState<documentRequestInterface | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [paymentDoc, setPaymentDoc] = useState<documentRequestInterface | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<documentRequestInterface | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // ── Fetch all document requests except completed ──────────────
  const { data: documents, isLoading } = useQuery<documentRequestInterface[]>({
    queryKey: ["document-requests", "secretary", "active"],
    queryFn: async () => {
      const res = await axiosInstance.get("/document-request", {
        params: { statusNot: "completed" },
      });
      return res.data;
    },
  });

  // ── Filter by search ──────────────────────────────────────────
  const filtered = documents?.filter((doc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const docName = DOCUMENT_NAMES[doc.document] || doc.document;
    const residentName = doc.resident?.name?.toLowerCase() || "";
    return (
      docName.toLowerCase().includes(q) ||
      residentName.includes(q) ||
      doc.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full min-h-dvh p-4 sm:p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="size-6 text-sky-600" />
            Document Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and process resident document requests
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 bg-sky-50 rounded-xl px-4 py-2 border border-sky-100">
          <FileText className="size-4 text-sky-500" />
          <span>
            Active:{" "}
            <strong className="text-sky-700">{documents?.length || 0}</strong>
          </span>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <Input
          placeholder="Search by document type, resident, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 border-gray-200 focus:border-sky-400 focus:ring-sky-400/20"
        />
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="font-semibold text-gray-700">Resident</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden sm:table-cell">Document Type</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Date Requested</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Payment</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : !documents || documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <Inbox className="size-10" />
                    <p className="text-sm font-medium">No active document requests</p>
                    <p className="text-xs">All requests have been completed</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Search className="size-8" />
                    <p className="text-sm font-medium">No results match your search</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered?.map((doc) => {
                const statusCfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
                const StatusIcon = statusCfg.icon;

                return (
                  <TableRow
                    key={doc._id}
                    className="hover:bg-sky-50/50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center shrink-0">
                          <UserRound className="size-3.5 text-sky-600" />
                        </div>
                        <span className="truncate max-w-[140px]">
                          {doc.resident?.name || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <FileText className="size-3.5 text-gray-400 shrink-0" />
                        {DOCUMENT_NAMES[doc.document] || doc.document}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5 text-gray-400 shrink-0" />
                        {doc.dateIssued}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} border`}
                      >
                        <StatusIcon
                          className={`size-3 ${doc.status === "processing" ? "animate-spin" : ""}`}
                        />
                        {statusCfg.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          doc.isPaid
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        <Wallet className="size-3" />
                        {doc.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setViewDoc(doc);
                            setViewModalOpen(true);
                          }}
                          className="h-7 text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <Eye className="size-3" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generateDocumentPDF(doc)}
                          className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        >
                          <Download className="size-3" />
                          PDF
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setStatusDoc(doc);
                            setStatusModalOpen(true);
                          }}
                          className="h-7 text-xs text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                        >
                          <ArrowUpRight className="size-3" />
                          Status
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPaymentDoc(doc);
                            setPaymentModalOpen(true);
                          }}
                          className="h-7 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        >
                          <Receipt className="size-3" />
                          Payment
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Modals ── */}
      <ViewDetailsModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        document={viewDoc}
      />
      <UpdateStatusModal
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        document={statusDoc}
      />
      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        document={paymentDoc}
      />
    </div>
  );
}
