"use client";

import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { publicApi } from "@/lib/api";

export function AboutSection() {
  const { t } = useLanguage();
  const [aboutProfile, setAboutProfile] = useState<{ headline?: string; content?: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    publicApi
      .getCompanyProfiles()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data)) {
          const aboutItem = res.data.find(
            (p) => p.section_key === "about_hero" || p.section_key === "vision_mission"
          );
          if (aboutItem && (aboutItem.title || aboutItem.content)) {
            setAboutProfile({
              headline: aboutItem.title,
              content: aboutItem.content,
            });
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      id="profil"
      aria-label="Profil Perusahaan"
      className="py-16 md:py-20 lg:py-24 bg-white border-b border-primary-light scroll-mt-20"
    >
      <div className="container-custom">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center animate-in fade-in duration-200">
            {/* Sisi Kiri Skeleton */}
            <div className="lg:col-span-6 space-y-4">
              <Skeleton className="h-6 sm:h-7 lg:h-8 w-11/12" />
              <Skeleton className="h-6 sm:h-7 lg:h-8 w-4/5" />
              <Skeleton className="h-6 sm:h-7 lg:h-8 w-3/5" />
              <Skeleton className="w-16 h-1 rounded-full mt-2" />
            </div>

            {/* Sisi Kanan Skeleton */}
            <div className="lg:col-span-6">
              <div className="p-6 sm:p-8 md:p-9 rounded-2xl bg-surface border border-primary-light shadow-xs space-y-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Sisi Kiri: Headline Utama */}
            <div className="lg:col-span-6 space-y-5">
              <h2 className="text-[18px] leading-[28px] sm:text-[20px] sm:leading-[32px] lg:text-[22px] lg:leading-[36px] font-medium text-primary tracking-tight text-balance">
                {aboutProfile?.headline || t.about.headline}
              </h2>

              <div className="w-16 h-1 bg-primary rounded-full" />
            </div>

            {/* Sisi Kanan: Kartu Narasi Mengapa Zhou Consulting */}
            <div className="lg:col-span-6" id="mengapa-zhou">
              <div className="p-6 sm:p-8 md:p-9 rounded-2xl bg-surface border border-primary-light shadow-xs relative overflow-hidden space-y-4">
                <div className="inline-flex items-center">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary select-none">
                    {t.about.whyBadge}
                  </span>
                </div>
                <p className="text-[14px] sm:text-[15px] leading-relaxed text-text-secondary">
                  {aboutProfile?.content || t.about.whyText}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
