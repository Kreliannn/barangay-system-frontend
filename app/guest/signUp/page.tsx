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
} from "lucide-react";

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

  // File uploads
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [idSelfie, setIdSelfie] = useState<File | null>(null);

  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [idSelfiePreview, setIdSelfiePreview] = useState<string | null>(null);

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !address || !email || !password) {
      errorAlert("Please fill in all fields");
      return;
    }

    if (!idFront || !idBack || !idSelfie) {
      errorAlert("Please upload all 3 ID images (front, back, selfie)");
      return;
    }

    if (password.length < 6) {
      errorAlert("Password must be at least 6 characters");
      return;
    }


    if (contact.length != 11) {
      errorAlert("Contact Number invalid");
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
  }: {
    label: string;
    icon: React.ElementType;
    file: File | null;
    preview: string | null;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onSelect: (file: File) => void;
    onRemove: () => void;
    accentColor: string;
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-sky-100 to-emerald-100 mb-4 shadow-sm">
            <UserRound className="size-8 text-sky-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Create Your Account
          </h1>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            Register as a resident of Barangay Maligaya. Upload your valid ID
            and start accessing community services.
          </p>
        </div>

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
                      placeholder="juan@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-10 border-gray-200 focus:border-sky-400 focus:ring-sky-400/20 transition-all"
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
                            : "border-gray-200 focus:border-sky-400 focus:ring-sky-400/20"
                        }`}
                        required
                        />
                    </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
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
                      className="pl-10 h-10 border-gray-200 focus:border-sky-400 focus:ring-sky-400/20 transition-all"
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
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-10 border-gray-200 focus:border-sky-400 focus:ring-sky-400/20 transition-all"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
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
                  onSelect={(f) => handleFileSelect(f, setIdFront, setIdFrontPreview)}
                  onRemove={() => removeImage(setIdFront, setIdFrontPreview, frontRef)}
                  accentColor="border-sky-300 hover:border-sky-400 hover:bg-sky-50/50"
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
