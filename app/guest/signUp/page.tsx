"use client";

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert } from "@/app/utils/alert";
import { createWorker } from "tesseract.js";
import {
  Upload,
  Camera,
  IdCard,
  UserRound,
  Mail,
  Lock,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  CalendarDays,
  Users,
  Hash,
  Heart,
  Vote,
  XCircle,
  
} from "lucide-react";



const idKeywords = [
  // Common personal information
  "name",
  "full name",
  "surname",
  "first name",
  "middle name",
  "given name",
  "date of birth",
  "birth date",
  "dob",
  "place of birth",
  "sex",
  "gender",
  "address",
  "residence",
  "nationality",

  // Identification numbers
  "id number",
  "identification number",
  "id no",
  "id no.",
  "card number",
  "document number",
  "license number",
  "license no",
  "license no.",
  "registration number",
  "registration no",

  // Philippine-specific
  "philippine",
  "republic of the philippines",
  "pilipinas",
  "philid",
  "national id",
  "philsys",
  "psa",

  // Driver's License
  "driver's license",
  "drivers license",
  "driver license",
  "lto",
  "land transportation office",
  "non-professional",
  "professional",

  // Passport
  "passport",
  "passport no",
  "passport number",
  "date of issue",
  "date of expiry",
  "place of issue",

  // SSS
  "sss",
  "social security system",
  "crn",
  "common reference number",

  // UMID
  "umid",
  "unified multipurpose identification",
  "crn",

  // PhilHealth
  "philhealth",
  "philhealth identification",
  "pin",
  "personal identification number",

  // TIN
  "tin",
  "tax identification number",
  "bureau of internal revenue",
  "bir",

  // PRC
  "prc",
  "professional regulation commission",
  "professional identification card",
  "license",

  // Postal ID
  "postal id",
  "phlpost",
  "philippine postal corporation",

  // Voter's ID / COMELEC
  "comelec",
  "commission on elections",
  "voter",
  "voter's",
  "voter's registration",

  // Senior Citizen ID
  "senior citizen",
  "senior citizen identification",

  // Other common fields
  "date issued",
  "date of issue",
  "date of expiry",
  "expiration date",
  "expiry date",
  "valid until",
  "issued",
  "expires",
  "signature",
  "blood type",
  "height",
  "weight",
  "civil status"
];

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // New profile fields
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const [purok, setPurok] = useState("");
  const [voterStatus, setVoterStatus] = useState("");
  const [houseHoldNumber, setHouseHoldNumber] = useState("");

  // File uploads
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [idSelfie, setIdSelfie] = useState<File | null>(null);

  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [idSelfiePreview, setIdSelfiePreview] = useState<string | null>(null);

  // OCR verification for front of ID
  const [ocrStatus, setOcrStatus] = useState<
    "idle" | "scanning" | "accepted" | "rejected"
  >("idle");

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const emailValid = /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (pw.length < 8 || score <= 2) return { label: "Weak", level: 1 };
    if (score <= 4) return { label: "Strong", level: 2 };
    return { label: "Very Strong", level: 3 };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleFileSelect = (
    file: File,
    setFile: (f: File) => void,
    setPreview: (url: string) => void
  ) => {
    if (!file.type.startsWith("image/")) {
      errorAlert("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      errorAlert("Image must be less than 5MB");
      return;
    }
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = (
    setFile: (f: null) => void,
    setPreview: (url: null) => void,
    ref: React.RefObject<HTMLInputElement | null>
  ) => {
    setFile(null);
    setPreview(null);
    if (ref.current) ref.current.value = "";
  };

  const handleFrontIdSelect = async (file: File) => {
    handleFileSelect(file, setIdFront, setIdFrontPreview);
    setOcrStatus("scanning");
    try {
      const worker = await createWorker("eng");
      const { data } = await worker.recognize(file);
      await worker.terminate();

      const text = (data.text || "").toLowerCase().replace(/\s+/g, " ");
      const matched =
        text.length > 0 && idKeywords.some((keyword) => text.includes(keyword));
      setOcrStatus(matched ? "accepted" : "rejected");
    } catch {
      setOcrStatus("rejected");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !address || !email || !password || !gender || !dateOfBirth || !civilStatus || !purok || !voterStatus || !houseHoldNumber) {
      errorAlert("Please fill in all fields");
      return;
    }

    if (!idFront || !idBack || !idSelfie) {
      errorAlert("Please upload all 3 ID images (front, back, selfie)");
      return;
    }

    if (!emailValid) {
      errorAlert("Please enter a valid email address (@gmail.com)");
      return;
    }

    if (contact.length !== 11) {
      errorAlert("Contact Number invalid");
      return;
    }

    if (passwordStrength.level === 1) {
      errorAlert(
        "Password is too weak. Use at least 8 characters with uppercase, lowercase, numbers, and special characters."
      );
      return;
    }

    if (ocrStatus !== "accepted") {
      errorAlert(
        ocrStatus === "scanning"
          ? "Please wait while we verify your ID."
          : "ID verification failed. No valid ID text was detected. Please upload a clearer photo of a valid government-issued ID."
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("address", address);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("status", "pending");
      formData.append("contact", contact);
      formData.append("gender", gender);
      formData.append("dateOfBirth", dateOfBirth);
      formData.append("civilStatus", civilStatus);
      formData.append("purok", purok);
      formData.append("voterStatus", voterStatus);
      formData.append("houseHoldNumber", houseHoldNumber);
      formData.append("profile", "/assets/profile.jpg");
      formData.append("idFront", idFront);
      formData.append("idBack", idBack);
      formData.append("idSelfie", idSelfie);

  

    
      await axiosInstance.post("/account", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      successAlert("Registration successful! Please sign in.");
      
      setTimeout(() => router.push("/guest/signIn"), 1500);
      
    } catch (err: any) {
      const message =
        err?.response?.data || err?.message || "Registration failed";
      errorAlert(typeof message === "string" ? message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Upload box component for reuse
  const UploadBox = ({
    label,
    icon: Icon,
    file,
    preview,
    inputRef,
    onSelect,
    onRemove,
    accentColor,
    badge,
  }: {
    label: string;
    icon: React.ElementType;
    file: File | null;
    preview: string | null;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onSelect: (file: File) => void;
    onRemove: () => void;
    accentColor: string;
    badge?: React.ReactNode;
  }) => (
    <div className="relative">
      <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
        {label}
      </Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onSelect(f);
        }}
      />
      {preview && file ? (
        <div className="relative group rounded-xl overflow-hidden border-2 border-sky-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
          <img
            src={preview}
            alt={label}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
            <button
              type="button"
              onClick={onRemove}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-lg hover:shadow-red-500/25"
            >
              Remove
            </button>
          </div>
          <div className="absolute top-2 right-2">
            <CheckCircle2 className="size-5 text-green-500 drop-shadow-sm" />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full h-48 rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-2 bg-white hover:shadow-lg group ${accentColor}`}
        >
          <div className="size-12 rounded-full flex items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50 group-hover:scale-110 transition-transform duration-300">
            <Icon className="size-6 text-sky-500" />
          </div>
          <span className="text-sm font-medium text-gray-600">
            Click to upload
          </span>
          <span className="text-xs text-gray-400">
            PNG, JPG or WEBP (max 5MB)
          </span>
        </button>
      )}
      {badge}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-sky-600 transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/assets/logo.jpg"
                alt="Barangay Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-sm font-semibold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                Barangay Maligaya
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
    
        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-sky-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="size-2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="name"
                      placeholder="Juan Dela Cruz"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-10 border-gray-200 focus:border-sky-400 focus:ring-sky-400/20 transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="juandelacruz@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 h-10 transition-all ${
                        email
                          ? emailValid
                            ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                            : "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-sky-400 focus:ring-sky-400/20"
                      }`}
                      required
                    />
                  </div>
                </div>

               

                 <div className="space-y-1.5">
                    <Label htmlFor="contact" className="text-sm font-medium text-gray-700">
                        Contact
                    </Label>

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />

                        <Input
                        id="contact"
                        type="text"
                        placeholder="0909989785"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        className={`pl-10 h-10 transition-all ${
                            contact.length === 11
                            ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                            : contact.length > 0
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-gray-200 focus:border-sky-400 focus:ring-sky-400/20"
                        }`}
                        required
                        />
                    </div>
                </div>


                <div className="space-y-1.5 ">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                    Address
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="address"
                      placeholder="123 Barangay St., Maligaya"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-10 h-10 border-gray-200 focus:border-sky-400 focus:ring-sky-400/20 transition-all "
                      required
                    />
                  </div>
                </div>

              
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 z-10" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-10 pr-10 h-10 transition-all ${
                        password
                          ? passwordStrength.level === 1
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : passwordStrength.level === 2
                            ? "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20"
                            : "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                          : "border-gray-200 focus:border-sky-400 focus:ring-sky-400/20"
                      }`}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                              passwordStrength.level >= i
                                ? passwordStrength.level === 1
                                  ? "bg-red-500"
                                  : passwordStrength.level === 2
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p
                        className={`text-xs font-medium ${
                          passwordStrength.level === 1
                            ? "text-red-500"
                            : passwordStrength.level === 2
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        Password strength: {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Profile Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="size-2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" />
                Profile Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gender */}
                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                    Gender
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full h-10 pl-10 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                    Date of Birth
                  </Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full h-10 pl-10 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Civil Status */}
                <div className="space-y-1.5">
                  <Label htmlFor="civilStatus" className="text-sm font-medium text-gray-700">
                    Civil Status
                  </Label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                    <select
                      id="civilStatus"
                      value={civilStatus}
                      onChange={(e) => setCivilStatus(e.target.value)}
                      className="w-full h-10 pl-10 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>Select civil status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                  </div>
                </div>

                {/* Purok */}
                <div className="space-y-1.5">
                  <Label htmlFor="purok" className="text-sm font-medium text-gray-700">
                    Purok
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                    <select
                      id="purok"
                      value={purok}
                      onChange={(e) => setPurok(e.target.value)}
                      className="w-full h-10 pl-10 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>Select purok</option>
                      <option value="Purok 1">Purok 1</option>
                      <option value="Purok 2">Purok 2</option>
                      <option value="Purok 3">Purok 3</option>
                      <option value="Purok 4">Purok 4</option>
                    </select>
                  </div>
                </div>

                {/* Voter Status */}
                <div className="space-y-1.5">
                  <Label htmlFor="voterStatus" className="text-sm font-medium text-gray-700">
                    Voter Status
                  </Label>
                  <div className="relative">
                    <Vote className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                    <select
                      id="voterStatus"
                      value={voterStatus}
                      onChange={(e) => setVoterStatus(e.target.value)}
                      className="w-full h-10 pl-10 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>Select voter status</option>
                      <option value="Registered">Registered</option>
                      <option value="Not Registered">Not Registered</option>
                    </select>
                  </div>
                </div>

                {/* Household Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="houseHoldNumber" className="text-sm font-medium text-gray-700">
                    Household Number
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      id="houseHoldNumber"
                      type="text"
                      placeholder="e.g. HH-001"
                      value={houseHoldNumber}
                      onChange={(e) => setHouseHoldNumber(e.target.value)}
                      className="w-full h-10 pl-10 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ID Upload Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <div className="size-2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" />
                ID Image Upload
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Upload a clear photo of your valid government-issued ID for
                verification.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <UploadBox
                  label="Front of ID"
                  icon={IdCard}
                  file={idFront}
                  preview={idFrontPreview}
                  inputRef={frontRef}
                  onSelect={(f) => handleFrontIdSelect(f)}
                  onRemove={() => {
                    removeImage(setIdFront, setIdFrontPreview, frontRef);
                    setOcrStatus("idle");
                  }}
                  accentColor="border-sky-300 hover:border-sky-400 hover:bg-sky-50/50"
                  badge={
                    ocrStatus === "scanning" ? (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-sky-600">
                        <Loader2 className="size-3.5 animate-spin" />
                        Verifying ID...
                      </div>
                    ) : ocrStatus === "accepted" ? (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-green-600">
                        <CheckCircle2 className="size-3.5" />
                        ID Accepted
                      </div>
                    ) : ocrStatus === "rejected" ? (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500">
                        <XCircle className="size-3.5" />
                        ID Rejected - no valid ID text detected
                      </div>
                    ) : null
                  }
                />
                <UploadBox
                  label="Back of ID"
                  icon={IdCard}
                  file={idBack}
                  preview={idBackPreview}
                  inputRef={backRef}
                  onSelect={(f) => handleFileSelect(f, setIdBack, setIdBackPreview)}
                  onRemove={() => removeImage(setIdBack, setIdBackPreview, backRef)}
                  accentColor="border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50/50"
                />
                <UploadBox
                  label="Selfie with ID"
                  icon={Camera}
                  file={idSelfie}
                  preview={idSelfiePreview}
                  inputRef={selfieRef}
                  onSelect={(f) => handleFileSelect(f, setIdSelfie, setIdSelfiePreview)}
                  onRemove={() => removeImage(setIdSelfie, setIdSelfiePreview, selfieRef)}
                  accentColor="border-sky-300 hover:border-sky-400 hover:bg-sky-50/50"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="space-y-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-sky-200/50 hover:shadow-emerald-200/50 transition-all duration-300 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    Create Account
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/guest/signIn"
                  className="font-medium text-sky-600 hover:text-sky-700 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          By registering, you agree to the terms and privacy policy of Barangay
          Maligaya.
        </p>
      </div>
    </div>
  );
}
