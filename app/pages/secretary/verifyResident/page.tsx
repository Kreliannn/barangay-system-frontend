"use client"

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { successAlert, errorAlert } from "@/app/utils/alert";
import {
  Eye,
  CheckCircle2,
  XCircle,
  Search,
  Users,
  Clock,
  Loader2,
  IdCard,
  Camera,
  UserRound,
  Mail,
  MapPin,
  ShieldCheck,
  ShieldX,
  X,
} from "lucide-react";

interface IdImg {
  idFront: string;
  idBack: string;
  idSelfie: string;
}

interface Account {
  _id: string;
  name: string;
  address: string;
  email: string;
  status: string;
  idImg: IdImg;
}

export default function VerifyResidentPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch pending residents
  const { data: accounts, isLoading } = useQuery<Account[]>({
    queryKey: ["accounts", "pending"],
    queryFn: async () => {
      const res = await axiosInstance.get("/account", {
        params: { status: "pending" },
      });
      return res.data;
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.patch(`/account/${id}/status`, {
        status: "approved",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      successAlert("Resident approved successfully");
      setModalOpen(false);
    },
    onError: (err: any) => {
      const message =
        err?.response?.data || err?.message || "Failed to approve";
      errorAlert(typeof message === "string" ? message : "Failed to approve");
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.patch(`/account/${id}/status`, {
        status: "rejected",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      successAlert("Resident rejected");
      setModalOpen(false);
    },
    onError: (err: any) => {
      const message =
        err?.response?.data || err?.message || "Failed to reject";
      errorAlert(typeof message === "string" ? message : "Failed to reject");
    },
  });

  const filteredAccounts = accounts?.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="w-full min-h-dvh p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="size-6 text-sky-600" />
            Verify Residents
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and approve or reject resident registration requests
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 bg-sky-50 rounded-xl px-4 py-2 border border-sky-100">
          <Clock className="size-4 text-sky-500" />
          <span>
            Pending:{" "}
            <strong className="text-sky-700">{accounts?.length || 0}</strong>
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 border-gray-200 focus:border-sky-400 focus:ring-sky-400/20"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="font-semibold text-gray-700">
                Name
              </TableHead>
              <TableHead className="font-semibold text-gray-700 hidden sm:table-cell">
                Email
              </TableHead>
              <TableHead className="font-semibold text-gray-700 hidden md:table-cell">
                Address
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Status
              </TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filteredAccounts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Users className="size-8" />
                    <p className="text-sm font-medium">No pending residents</p>
                    <p className="text-xs">
                      {search
                        ? "No results match your search"
                        : "All registration requests have been reviewed"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts?.map((account) => (
                <TableRow
                  key={account._id}
                  className="hover:bg-sky-50/50 transition-colors"
                >
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-full bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center">
                        <UserRound className="size-3.5 text-sky-600" />
                      </div>
                      {account.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 hidden sm:table-cell">
                    {account.email}
                  </TableCell>
                  <TableCell className="text-gray-600 hidden md:table-cell max-w-[200px] truncate">
                    {account.address}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="size-3" />
                      Pending
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedAccount(account);
                        setModalOpen(true);
                      }}
                      className="text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                    >
                      <Eye className="size-3.5" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-0 gap-0">
          <div className="p-6 pb-4 border-b border-gray-100">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center shadow-sm">
                    <UserRound className="size-5 text-sky-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      {selectedAccount?.name}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                      Resident verification details
                    </DialogDescription>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="size-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </DialogHeader>
          </div>

          {selectedAccount && (
            <div className="p-6 space-y-6">
              {/* Resident Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <Mail className="size-4 text-sky-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Email
                    </p>
                    <p className="text-sm text-gray-800 truncate">
                      {selectedAccount.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 sm:col-span-2">
                  <MapPin className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Address
                    </p>
                    <p className="text-sm text-gray-800">
                      {selectedAccount.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* ID Images */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <IdCard className="size-4 text-sky-500" />
                  Submitted ID Images
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ImageCard
                    label="Front of ID"
                    src={selectedAccount.idImg.idFront}
                    icon={IdCard}
                  />
                  <ImageCard
                    label="Back of ID"
                    src={selectedAccount.idImg.idBack}
                    icon={IdCard}
                  />
                  <ImageCard
                    label="Selfie with ID"
                    src={selectedAccount.idImg.idSelfie}
                    icon={Camera}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <Button
                  onClick={() => rejectMutation.mutate(selectedAccount._id)}
                  disabled={isMutating}
                  variant="outline"
                  className="flex-1 h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all"
                >
                  {rejectMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ShieldX className="size-4" />
                  )}
                  Reject
                </Button>
                <Button
                  onClick={() => approveMutation.mutate(selectedAccount._id)}
                  disabled={isMutating}
                  className="flex-1 h-10 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-medium shadow-lg shadow-sky-200/50 hover:shadow-emerald-200/50 transition-all"
                >
                  {approveMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="size-4" />
                  )}
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Image card sub-component
function ImageCard({
  label,
  src,
  icon: Icon,
}: {
  label: string;
  src: string;
  icon: React.ElementType;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 group">
      <div className="relative h-44 bg-gray-100">
        {src && !error ? (
          <>
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="size-5 text-gray-300 animate-spin" />
              </div>
            )}
            <img
              src={src}
              alt={label}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-2">
            <Icon className="size-8" />
            <span className="text-xs">{error ? "Failed to load" : "No image"}</span>
          </div>
        )}
      </div>
      <div className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border-t border-gray-100 truncate">
        {label}
      </div>
    </div>
  );
}
