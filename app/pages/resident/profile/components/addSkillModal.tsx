"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Briefcase } from "lucide-react";

const PRESET_SKILLS = [
  "Teaching",
  "Barbering",
  "Cooking",
  "Farming",
  "Caretaker",
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Tailoring",
  "Driving",
  "Welding",
  "Masonry",
  "Painting",
  "Baking",
  "Sewing",
  "Computer Repair",
  "Tutoring",
  "Photography",
  "Event Planning",
  "Nursing Assistance",
];

const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced"];

const AVAILABILITY_OPTIONS = ["available", "busy"];

interface AddSkillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (skill: {
    skill: string;
    experience: number;
    proficiency: string;
    availability: string;
    services: string[];
  }) => Promise<void>;
}

export default function AddSkillModal({
  open,
  onOpenChange,
  onAdd,
}: AddSkillModalProps) {
  const [skill, setSkill] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [experience, setExperience] = useState("");
  const [proficiency, setProficiency] = useState("");
  const [availability, setAvailability] = useState("available");
  const [services, setServices] = useState<string[]>([]);
  const [serviceInput, setServiceInput] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setSkill("");
    setCustomSkill("");
    setUseCustom(false);
    setExperience("");
    setProficiency("");
    setAvailability("available");
    setServices([]);
    setServiceInput("");
  };

  const addService = () => {
    const value = serviceInput.trim();
    if (value && !services.includes(value)) {
      setServices([...services, value]);
    }
    setServiceInput("");
  };

  const removeService = (service: string) => {
    setServices(services.filter((s) => s !== service));
  };

  const handleSubmit = async () => {
    const skillName = useCustom ? customSkill.trim() : skill;

    if (!skillName) {
      return;
    }

    const exp = Number(experience);
    if (!experience || isNaN(exp) || exp < 0) {
      return;
    }

    if (!proficiency) {
      return;
    }

    if (services.length === 0) {
      return;
    }

    setLoading(true);
    try {
      await onAdd({
        skill: skillName,
        experience: exp,
        proficiency,
        availability,
        services,
      });
      resetForm();
      onOpenChange(false);
    } catch {
      // Error is handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-0 gap-0">
        <div className="p-6 border-b border-gray-100">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center shadow-sm">
                <Briefcase className="size-5 text-sky-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Add Skill
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  Tell the community about your skills
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-5">
          {/* Skill Selection */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Skill
            </Label>
            {!useCustom ? (
              <Select value={skill} onValueChange={setSkill}>
                <SelectTrigger className="w-full h-10 border-gray-200 focus:border-sky-400">
                  <SelectValue placeholder="Select a skill..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {PRESET_SKILLS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Enter your skill..."
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                className="h-10 border-gray-200 focus:border-sky-400"
              />
            )}
            <button
              type="button"
              onClick={() => {
                setUseCustom(!useCustom);
                setSkill("");
                setCustomSkill("");
              }}
              className="text-xs text-sky-600 hover:text-sky-700 transition-colors mt-1"
            >
              {useCustom
                ? "Pick from list instead"
                : "My skill is not in the list"}
            </button>
          </div>

          {/* Years of Experience */}
          <div className="space-y-1.5">
            <Label
              htmlFor="experience"
              className="text-sm font-medium text-gray-700"
            >
              Years of Experience
            </Label>
            <Input
              id="experience"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 3"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="h-10 border-gray-200 focus:border-sky-400"
            />
          </div>

          {/* Proficiency */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Proficiency Level
            </Label>
            <Select value={proficiency} onValueChange={setProficiency}>
              <SelectTrigger className="w-full h-10 border-gray-200 focus:border-sky-400">
                <SelectValue placeholder="Select proficiency..." />
              </SelectTrigger>
              <SelectContent>
                {PROFICIENCY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Availability */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Availability
            </Label>
            <Select value={availability} onValueChange={setAvailability}>
              <SelectTrigger className="w-full h-10 border-gray-200 focus:border-sky-400">
                <SelectValue placeholder="Select availability..." />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option} className="capitalize">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Services */}
          <div className="space-y-1.5">
            <Label
              htmlFor="service-input"
              className="text-sm font-medium text-gray-700"
            >
              Services Offered
            </Label>
            <div className="flex gap-2">
              <Input
                id="service-input"
                placeholder="e.g. House repair, Fence repair"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addService();
                  }
                }}
                className="h-10 border-gray-200 focus:border-sky-400"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addService}
                disabled={!serviceInput.trim()}
                className="h-10 shrink-0 border-gray-200 text-gray-600"
              >
                Add
              </Button>
            </div>
            {services.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {services.map((service) => (
                  <span
                    key={service}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    {service}
                    <button
                      type="button"
                      onClick={() => removeService(service)}
                      className="text-emerald-500 hover:text-emerald-700 transition-colors"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Validation hints */}
          <div className="space-y-1 text-xs text-gray-400">
            {(useCustom ? !customSkill.trim() : !skill) && (
              <p>Select or enter a skill</p>
            )}
            {(!experience || isNaN(Number(experience)) || Number(experience) < 0) && (
              <p>Enter valid years of experience</p>
            )}
            {!proficiency && <p>Select your proficiency level</p>}
            {services.length === 0 && <p>Add at least one service you offer</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            className="h-9 border-gray-200 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              loading ||
              (useCustom ? !customSkill.trim() : !skill) ||
              !experience ||
              isNaN(Number(experience)) ||
              Number(experience) < 0 ||
              !proficiency ||
              services.length === 0
            }
            className="h-9 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-medium shadow-lg shadow-sky-200/50 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Add Skill
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
