"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import useUserStore from "@/app/store/useUserStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { successAlert, errorAlert } from "@/app/utils/alert";
import AddReviewModal from "@/components/ui/addReviewModal";
import ViewReviewsModal from "@/components/ui/viewReviewsModal";
import {
  Users,
  Search,
  Briefcase,
  Star,
  Clock,
  BadgeCheck,
  Mail,
  Phone,
  MapPin,
  MessageSquareText,
  SlidersHorizontal,
  X,
  UserRound,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────
interface Skill {
  _id: string;
  skill: string;
  experience: number;
  proficiency: string;
}

interface Review {
  _id?: string;
  user: string;
  userProfile: string;
  star: number;
  skill: string;
  message: string;
}

interface Resident {
  _id: string;
  name: string;
  address: string;
  email: string;
  contact: string;
  profile: string;
  status: string;
  skills: Skill[];
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced"];

// ─── Star Rating Display ──────────────────────────────────────────
function StarRatingDisplay({ rating, total }: { rating: number; total: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="size-3.5 fill-amber-400 text-amber-400" />
        ))}
        {hasHalf && (
          <div className="relative size-3.5">
            <Star className="absolute inset-0 size-3.5 fill-gray-200 text-gray-200" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className="size-3.5 fill-gray-200 text-gray-200" />
        ))}
      </div>
      <span className="text-xs font-medium text-gray-600">
        {rating > 0 ? rating.toFixed(1) : "—"}
      </span>
      <span className="text-xs text-gray-400">
        ({total} {total === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}

// ─── Proficiency Badge ────────────────────────────────────────────
function ProficiencyBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Intermediate: "bg-sky-50 text-sky-700 border-sky-200",
    Advanced: "bg-violet-50 text-violet-700 border-violet-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
        colors[level] || "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {level}
    </span>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────
function ResidentCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function ResidentSkillsPage() {
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [proficiencyFilter, setProficiencyFilter] = useState("");
  const [minExperience, setMinExperience] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Add review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  // View reviews modal
  const [viewReviewsOpen, setViewReviewsOpen] = useState(false);
  const [viewReviewsResident, setViewReviewsResident] = useState<Resident | null>(null);

  // Fetch residents with skills
  const { data: residents, isLoading } = useQuery<Resident[]>({
    queryKey: ["residents", "skills"],
    queryFn: async () => {
      const res = await axiosInstance.get("/account/residents/skills");
      return res.data;
    },
  });

  // Add review mutation
  const addReviewMutation = useMutation({
    mutationFn: async (review: { star: number; skill: string; message: string }) => {
      await axiosInstance.post(`/account/${selectedResident?._id}/reviews`, review);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      successAlert("Review submitted successfully!");
    },
    onError: (err: any) => {
      const message = err?.response?.data || err?.message || "Failed to submit review";
      errorAlert(typeof message === "string" ? message : "Failed to submit review");
      throw err;
    },
  });

  // Extract unique skill names from all residents for the filter dropdown
  const allSkillNames = useMemo(() => {
    const names = new Set<string>();
    residents?.forEach((r) => r.skills?.forEach((s) => names.add(s.skill)));
    return Array.from(names).sort();
  }, [residents]);

  // Filtered residents
  const filteredResidents = useMemo(() => {
    if (!residents) return [];

    return residents.filter((resident) => {
      // Text search across name, email, contact
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          resident.name.toLowerCase().includes(q) ||
          resident.email.toLowerCase().includes(q) ||
          (resident.contact || "").toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Skill filter — resident must have the selected skill
      if (skillFilter && skillFilter !== "all") {
        const hasSkill = resident.skills?.some((s) => s.skill === skillFilter);
        if (!hasSkill) return false;
      }

      // Proficiency filter — resident must have at least one skill with this proficiency
      if (proficiencyFilter && proficiencyFilter !== "all") {
        const hasProficiency = resident.skills?.some(
          (s) => s.proficiency === proficiencyFilter
        );
        if (!hasProficiency) return false;
      }

      // Min experience filter — resident must have at least one skill with >= min experience
      if (minExperience) {
        const minExp = Number(minExperience);
        if (!isNaN(minExp) && minExp > 0) {
          const hasExp = resident.skills?.some((s) => s.experience >= minExp);
          if (!hasExp) return false;
        }
      }

      return true;
    });
  }, [residents, searchQuery, skillFilter, proficiencyFilter, minExperience]);

  const openReviewModal = (resident: Resident) => {
    setSelectedResident(resident);
    setReviewModalOpen(true);
  };

  const openViewReviews = (resident: Resident) => {
    setViewReviewsResident(resident);
    setViewReviewsOpen(true);
  };

  return (
    <div className="w-full min-h-dvh p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="size-6 text-sky-600" />
          Resident Skills Directory
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse residents and their skills. Leave feedback on work you&apos;ve received.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 border-gray-200 focus:border-sky-400 focus:ring-sky-400/20"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-10 border-gray-200 transition-all ${
              showFilters
                ? "bg-sky-50 border-sky-200 text-sky-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {(skillFilter || proficiencyFilter || minExperience) && (
              <span className="size-2 rounded-full bg-sky-500" />
            )}
          </Button>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Skill filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Briefcase className="size-3" />
                Skill
              </label>
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="w-full h-9 border-gray-200 bg-white">
                  <SelectValue placeholder="All skills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All skills</SelectItem>
                  {allSkillNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Proficiency filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <BadgeCheck className="size-3" />
                Proficiency
              </label>
              <Select
                value={proficiencyFilter}
                onValueChange={setProficiencyFilter}
              >
                <SelectTrigger className="w-full h-9 border-gray-200 bg-white">
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  {PROFICIENCY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min experience filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Clock className="size-3" />
                Min. Years of Exp.
              </label>
              <Input
                type="number"
                min="0"
                placeholder="e.g. 2"
                value={minExperience}
                onChange={(e) => setMinExperience(e.target.value)}
                className="h-9 border-gray-200 bg-white"
              />
            </div>

            {/* Clear filters */}
            {(skillFilter || proficiencyFilter || minExperience) && (
              <div className="sm:col-span-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSkillFilter("");
                    setProficiencyFilter("");
                    setMinExperience("");
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  <X className="size-3" />
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-3 animate-spin" />
              Loading residents...
            </span>
          ) : (
            <>
              Showing{" "}
              <strong className="text-gray-700">
                {filteredResidents.length}
              </strong>{" "}
              {filteredResidents.length === 1 ? "resident" : "residents"}
            </>
          )}
        </p>
      </div>

      {/* Resident Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ResidentCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredResidents.length === 0 ? (
        <div className="text-center py-16">
          <div className="size-16 rounded-full bg-gray-50 mx-auto flex items-center justify-center mb-4">
            <Users className="size-8 text-gray-300" />
          </div>
          <p className="text-lg font-medium text-gray-500">
            {searchQuery || skillFilter || proficiencyFilter || minExperience
              ? "No residents match your filters"
              : "No residents found"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery || skillFilter || proficiencyFilter || minExperience
              ? "Try adjusting your search or filter criteria"
              : "Residents with skills will appear here once they register"}
          </p>
          {(searchQuery || skillFilter || proficiencyFilter || minExperience) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSkillFilter("");
                setProficiencyFilter("");
                setMinExperience("");
              }}
              className="mt-4 border-gray-200 text-gray-600"
            >
              <X className="size-3.5" />
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredResidents.map((resident) => (
            <ResidentCard
              key={resident._id}
              resident={resident}
              onReview={() => openReviewModal(resident)}
              onViewReviews={() => openViewReviews(resident)}
              isOwnProfile={user?._id === resident._id}
            />
          ))}
        </div>
      )}

      {/* Add Review Modal */}
      {selectedResident && (
        <AddReviewModal
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          residentName={selectedResident.name}
          residentSkills={selectedResident.skills || []}
          onAdd={async (review) => {
            await addReviewMutation.mutateAsync(review);
          }}
        />
      )}

      {/* View Reviews Modal */}
      {viewReviewsResident && (
        <ViewReviewsModal
          open={viewReviewsOpen}
          onOpenChange={setViewReviewsOpen}
          residentName={viewReviewsResident.name}
          reviews={viewReviewsResident.reviews || []}
          averageRating={viewReviewsResident.averageRating || 0}
          totalReviews={viewReviewsResident.totalReviews || 0}
        />
      )}
    </div>
  );
}

// ─── Resident Card ────────────────────────────────────────────────
function ResidentCard({
  resident,
  onReview,
  onViewReviews,
  isOwnProfile,
}: {
  resident: Resident;
  onReview: () => void;
  onViewReviews: () => void;
  isOwnProfile: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const displaySkills = expanded
    ? resident.skills
    : resident.skills?.slice(0, 2);
  const hasMoreSkills = (resident.skills?.length || 0) > 2;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-sky-200 transition-all duration-200 group">
      {/* Resident Info Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="size-12 rounded-full overflow-hidden bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
            {resident.profile ? (
              <img
                src={resident.profile}
                alt={resident.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserRound className="size-6 text-sky-600" />
            )}
          </div>

          {/* Name & Rating */}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {resident.name}
              {isOwnProfile && (
                <span className="ml-1.5 text-[10px] text-sky-600 font-medium">
                  (you)
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <StarRatingDisplay
                rating={resident.averageRating || 0}
                total={resident.totalReviews || 0}
              />
              {(resident.totalReviews || 0) > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewReviews();
                  }}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium hover:underline transition-colors shrink-0"
                >
                  View all
                </button>
              )}
            </div>
          </div>

          {/* Review button */}
          {!isOwnProfile && (
            <Button
              size="sm"
              onClick={onReview}
              className="shrink-0 h-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-medium shadow-sm shadow-amber-200/50 opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <MessageSquareText className="size-3.5" />
              Review
            </Button>
          )}
        </div>

        {/* Contact Info */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Mail className="size-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{resident.email}</span>
          </div>
          {resident.contact && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Phone className="size-3.5 text-gray-400 shrink-0" />
              <span>{resident.contact}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="size-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{resident.address}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-gray-100" />

      {/* Skills Section */}
      <div className="p-5 pt-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Briefcase className="size-3.5 text-sky-500" />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Skills
          </span>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
            {resident.skills?.length || 0}
          </span>
        </div>

        {resident.skills && resident.skills.length > 0 ? (
          <div className="space-y-2">
            {displaySkills.map((skill) => (
              <div
                key={skill._id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100 hover:border-sky-100 hover:bg-sky-50/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {skill.skill}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="size-3 text-gray-400" />
                    <span className="text-[11px] text-gray-500">
                      {skill.experience}{" "}
                      {skill.experience === 1 ? "yr" : "yrs"}
                    </span>
                  </div>
                </div>
                <ProficiencyBadge level={skill.proficiency} />
              </div>
            ))}

            {hasMoreSkills && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full text-xs text-sky-600 hover:text-sky-700 font-medium py-1.5 transition-colors"
              >
                {expanded
                  ? "Show less"
                  : `+${resident.skills.length - 2} more skills`}
              </button>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No skills listed</p>
        )}

        {/* Review button (visible when not hovered) */}
        {!isOwnProfile && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReview}
            className="w-full mt-3 h-8 text-xs border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 group-hover:hidden transition-all"
          >
            <MessageSquareText className="size-3.5" />
            Leave a Review
          </Button>
        )}
      </div>
    </div>
  );
}
