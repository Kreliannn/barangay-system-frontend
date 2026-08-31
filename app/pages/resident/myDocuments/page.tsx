"use client"

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import useUserStore from "@/app/store/useUserStore";
import { documentRequestInterface } from "@/app/types/documentRequest";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
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
  PhilippinePeso,
  Wallet,
  CreditCard,
  Download,
} from "lucide-react";
import { confirmAlert } from "@/app/utils/alert";
import { getDocumentPrice } from "@/app/utils/documents";
import { payMongoPayment } from "@/app/utils/payMongo";
import { generateDocumentPDF } from "@/app/utils/generateDocument";

// ─── Status config ───────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  pending: {
    label: "Pending",
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
  },
  "to claim": {
    label: "To Claim",
    icon: FileCheck,
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
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

export default function MyDocumentsPage() {
  const { user } = useUserStore();
  const [search, setSearch] = useState("");

  // ── Fetch documents for this resident ─────────────────────────
  const { data: documents, isLoading } = useQuery<documentRequestInterface[]>({
    queryKey: ["document-requests", "resident", user?._id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/document-request/resident/${user?._id}`);
      return res.data;
    },
    enabled: !!user?._id,
  });

  // ── Filter by search ──────────────────────────────────────────
  const filtered = documents?.filter((doc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = DOCUMENT_NAMES[doc.document] || doc.document;
    return (
      name.toLowerCase().includes(q) ||
      doc.status.toLowerCase().includes(q) ||
      (doc.documentNumber || "").toLowerCase().includes(q)
    );
  });



  const handlePayment = (amountInput : string, sender : string, documentId : string ) => {
    confirmAlert("you want to pay online?", "pay", () => {
      payMongoPayment(amountInput, sender, documentId)
    })
  }

  return (
    <div className="w-full min-h-dvh p-4 sm:p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="size-6 text-sky-600" />
            My Documents
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View the status of all your document requests
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 bg-sky-50 rounded-xl px-4 py-2 border border-sky-100">
          <FileText className="size-4 text-sky-500" />
          <span>
            Total:{" "}
            <strong className="text-sky-700">{documents?.length || 0}</strong>
          </span>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <Input
          placeholder="Search by document type or status..."
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
              <TableHead className="font-semibold text-gray-700">Document Type</TableHead>
              <TableHead className="font-semibold text-gray-700">Price</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden sm:table-cell">Date Requested</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
               <TableHead className="font-semibold text-gray-700">Paid</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : !documents || documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <Inbox className="size-10" />
                    <p className="text-sm font-medium">No document requests yet</p>
                    <p className="text-xs">
                      Submit a document request to see it here
                    </p>
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
                        <div className="size-7 rounded-lg bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center shrink-0">
                          <FileText className="size-3.5 text-sky-600" />
                        </div>
                        {DOCUMENT_NAMES[doc.document] || doc.document}
                      </div>
                    </TableCell>
                      <TableCell className="text-green-600 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <PhilippinePeso className="size-3.5 text-green-400 shrink-0" />
                        {getDocumentPrice(doc.document)}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 hidden sm:table-cell">
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
                            size="icon"
                            onClick={() => generateDocumentPDF(doc)}
                            className="size-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            title="Download PDF"
                          >
                            <Download className="size-4" /> ssssssss
                          </Button>


                        {doc.isPaid ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => generateDocumentPDF(doc)}
                            className="size-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            title="Download PDF"
                          >
                            <Download className="size-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePayment(
                              getDocumentPrice(doc.document).toString(),
                              doc.resident._id,
                              doc._id
                            )}
                            className="size-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            title="Pay now"
                          >
                            <CreditCard className="size-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
