"use client";

import React, { useState, useEffect } from "react";
import { GoogleColorIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

export interface GoogleAuthAccount {
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  company?: string;
  avatarText?: string;
  avatarUrl?: string;
}

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (account: GoogleAuthAccount) => void;
  targetRole?: "user" | "admin" | "superadmin";
}

const PRESET_ACCOUNTS: GoogleAuthAccount[] = [
  {
    name: "Budi Santoso, S.E.",
    email: "budi.santoso@majumakmur.co.id",
    role: "user",
    company: "PT Maju Makmur Sentosa",
    avatarText: "BS",
  },
  {
    name: "Citra Kirana, SE.",
    email: "citra.kirana@gmail.com",
    role: "user",
    company: "CV Surya Kencana",
    avatarText: "CK",
  },
  {
    name: "Staff Internal Zhou",
    email: "admin.internal@zhouconsulting.id",
    role: "admin",
    company: "Zhou Consulting Internal",
    avatarText: "AD",
  },
];

export function GoogleAuthModal({
  isOpen,
  onClose,
  onSuccess,
  targetRole = "user",
}: GoogleAuthModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customError, setCustomError] = useState("");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
      setSelectedEmail(null);
      setIsCustomMode(false);
      setCustomName("");
      setCustomEmail("");
      setCustomError("");
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  const handleSelectAccount = (account: GoogleAuthAccount) => {
    setIsProcessing(true);
    setSelectedEmail(account.email);

    setTimeout(() => {
      setIsProcessing(false);
      onSuccess({
        ...account,
        // If the user picked a role beforehand, use it, otherwise use account role
        role: targetRole || account.role,
      });
      onClose();
    }, 650);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      setCustomError("Mohon masukkan nama akun Google Anda.");
      return;
    }
    if (!customEmail.trim() || !customEmail.includes("@")) {
      setCustomError("Mohon masukkan alamat email Google yang valid (misal: user@gmail.com).");
      return;
    }

    setCustomError("");
    setIsProcessing(true);
    setSelectedEmail(customEmail);

    const nameParts = customName.trim().split(" ");
    const avatarText =
      nameParts.length > 1
        ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
        : customName.trim().substring(0, 2).toUpperCase();

    setTimeout(() => {
      setIsProcessing(false);
      onSuccess({
        name: customName.trim(),
        email: customEmail.trim(),
        role: targetRole || "user",
        company: "Klien Mandiri",
        avatarText,
      });
      onClose();
    }, 650);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => {
        if (!isProcessing) onClose();
      }}
    >
      <div
        className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative animate-in zoom-in-95 duration-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Google Progress Loading Bar */}
        {isProcessing && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 overflow-hidden z-20">
            <div className="h-full bg-[#4285F4] animate-pulse w-full" />
          </div>
        )}

        {/* Modal Header */}
        <div className="p-6 pb-4 text-center relative border-b border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Tutup"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex justify-center mb-3">
            <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-gray-100 flex items-center justify-center">
              <GoogleColorIcon className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
            Pilih akun Google
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            untuk melanjutkan ke <span className="font-semibold text-gray-700">Zhou Consulting</span>
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-2 max-h-[380px] overflow-y-auto">
          {isProcessing ? (
            <div className="py-10 text-center space-y-3">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-[#4285F4] border-t-transparent" />
              <p className="text-xs font-semibold text-gray-700">
                Menghubungkan akun Google...
              </p>
              <p className="text-[11px] text-gray-400">
                {selectedEmail || "Memvalidasi kredensial OAuth"}
              </p>
            </div>
          ) : isCustomMode ? (
            <form onSubmit={handleCustomSubmit} className="space-y-3.5 p-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Contoh: Andi Pratama"
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  Email Akun Google (Gmail/Workspace)
                </label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="nama@gmail.com"
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]"
                />
              </div>

              {customError && (
                <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
                  {customError}
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="w-1/2 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Lanjutkan
                </button>
              </div>
            </form>
          ) : (
            <>
              {PRESET_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleSelectAccount(account)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-light text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {account.avatarText}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 group-hover:text-primary truncate">
                        {account.name}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {account.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant="silver" className="text-[10px] shrink-0 capitalize">
                    {account.role === "admin" ? "Staff Admin" : "Klien"}
                  </Badge>
                </button>
              ))}

              {/* Gunakan Akun Lain Button */}
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-left text-gray-700 hover:text-primary cursor-pointer mt-1"
              >
                <div className="w-10 h-10 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold">Gunakan akun Google lain</p>
                  <p className="text-[11px] text-gray-400">Masukkan akun Gmail atau Google Workspace Anda</p>
                </div>
              </button>
            </>
          )}
        </div>

        {/* Modal Footer Disclaimer */}
        <div className="p-4 bg-gray-50/80 border-t border-gray-100 text-center">
          <p className="text-[10.5px] text-gray-500 leading-relaxed">
            Untuk melanjutkan, Google akan membagikan nama, email, dan preferensi bahasa Anda kepada{" "}
            <span className="font-semibold text-gray-700">Zhou Consulting</span> secara terenkripsi SSL.
          </p>
        </div>
      </div>
    </div>
  );
}
