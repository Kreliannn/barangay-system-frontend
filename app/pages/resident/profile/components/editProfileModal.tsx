"use client";

import { useState, useEffect } from "react";
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
import { Loader2, UserRound, MapPin, Phone, Save } from "lucide-react";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  currentAddress: string;
  currentContact: string;
  onSave: (data: { name: string; address: string; contact: string }) => Promise<void>;
}

export default function EditProfileModal({
  open,
  onOpenChange,
  currentName,
  currentAddress,
  currentContact,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentName);
  const [address, setAddress] = useState(currentAddress);
  const [contact, setContact] = useState(currentContact);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(currentName);
    setAddress(currentAddress);
    setContact(currentContact);
  }, [currentName, currentAddress, currentContact, open]);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        address: address.trim(),
        contact: contact.trim(),
      });
      onOpenChange(false);
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const hasChanges =
    name !== currentName ||
    address !== currentAddress ||
    contact !== currentContact;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-0 gap-0">
        <div className="p-6 border-b border-gray-100">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center shadow-sm">
                <UserRound className="size-5 text-sky-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Edit Profile
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  Update your personal information
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">
              Full Name
            </Label>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-10 border-gray-200 focus:border-sky-400"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-contact" className="text-sm font-medium text-gray-700">
              Contact Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                id="edit-contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="pl-10 h-10 border-gray-200 focus:border-sky-400"
                placeholder="0917 123 4567"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-address" className="text-sm font-medium text-gray-700">
              Address
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                id="edit-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="pl-10 h-10 border-gray-200 focus:border-sky-400"
                placeholder="Your address"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 border-gray-200 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !name.trim() || !hasChanges}
            className="h-9 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-medium shadow-lg shadow-sky-200/50 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
