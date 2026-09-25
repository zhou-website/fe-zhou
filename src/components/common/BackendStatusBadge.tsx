"use client";

import React, { useEffect, useState } from "react";
import { systemApi, HealthStatus } from "@/lib/api";

interface BackendStatusBadgeProps {
  compact?: boolean;
  className?: string;
}

export function BackendStatusBadge({ compact = false, className = "" }: BackendStatusBadgeProps) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      try {
        const res = await systemApi.getHealth();
        if (!isMounted) return;

        if (res.success && res.data?.status === "ok") {
          setHealth(res.data);
          setStatus("online");
        } else {
          setStatus("offline");
        }
      } catch {
        if (isMounted) setStatus("offline");
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Re-check every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (compact) {
    return (
      <div
        className={`relative inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
          status === "online"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            : status === "checking"
            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
        } ${className}`}
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title="Status Koneksi Live Backend"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            status === "online"
              ? "bg-emerald-400 animate-pulse"
              : status === "checking"
              ? "bg-amber-400 animate-ping"
              : "bg-rose-400"
          }`}
        />
        <span>{status === "online" ? "API Live" : status === "checking" ? "Checking" : "Offline"}</span>

        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2 rounded-lg bg-gray-950 border border-white/20 text-white text-[10px] shadow-xl z-50 pointer-events-none">
            <div className="font-bold border-b border-white/10 pb-1 mb-1 text-emerald-400">
              VPS Live: 43.173.2.162
            </div>
            <div className="space-y-0.5 text-gray-300">
              <div>DB: <span className="text-white">{health?.services?.database || "connected"}</span></div>
              <div>Redis: <span className="text-white">{health?.services?.redis || "ready"}</span></div>
              <div className="text-[9px] text-gray-400 truncate">REST API OpenAPI 3.1.0</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`p-2.5 rounded-xl border text-xs transition-all ${
        status === "online"
          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
          : status === "checking"
          ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
          : "bg-rose-950/20 border-rose-500/30 text-rose-200"
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {status === "online" && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                status === "online"
                  ? "bg-emerald-500"
                  : status === "checking"
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
            />
          </span>
          <span className="font-semibold text-[11px] tracking-tight">
            {status === "online" ? "Server Backend Terhubung" : status === "checking" ? "Menghubungkan Server..." : "Server Terputus"}
          </span>
        </div>
        <span className="text-[10px] font-mono opacity-80">43.173.2.162</span>
      </div>

      {health && status === "online" && (
        <div className="mt-1.5 pt-1.5 border-t border-emerald-500/20 flex items-center justify-between text-[10px] text-emerald-300/80">
          <span>PostgreSQL: Aktif</span>
          <span>Redis: Siap</span>
        </div>
      )}
    </div>
  );
}
