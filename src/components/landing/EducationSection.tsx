"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  BookIcon,
} from "@/components/icons";
import { useLanguage } from "@/context/LanguageContext";
import { ZhouArticle } from "@/data/edukasiData";
import {
  getStoredZhouArticles,
  ZHOU_ARTICLES_EVENT,
} from "@/data/edukasiStorage";
import { publicApi, EducationItem } from "@/lib/api";

export function EducationSection() {
  const { t } = useLanguage();
  const [articles, setArticles] = useState<ZhouArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ZhouArticle | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("semua");
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setArticles(getStoredZhouArticles());

    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<ZhouArticle[]>;
      if (custom.detail) {
        setArticles(custom.detail);
      } else {
        setArticles(getStoredZhouArticles());
      }
    };

    window.addEventListener(ZHOU_ARTICLES_EVENT, handleUpdate);

    // Fetch from live backend API
    publicApi
      .getEducation()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const apiArticles: ZhouArticle[] = res.data.map((item: EducationItem) => {
            const rawBody = item.body || item.title || "";
            return {
              id: `be-${item.id}`,
              title: item.title,
              category: item.category || "Coretax DJP 2026",
              categoryKey: (item.category?.toLowerCase().includes("pph")
                ? "kepatuhan"
                : item.category?.toLowerCase().includes("akuntansi")
                ? "akuntansi"
                : "transformasi"),
              date: new Date(item.created_at || Date.now()).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              readTime: "5 menit baca",
              author: "Tim Konsultan Zhou Consulting",
              summary: rawBody.slice(0, 160) + (rawBody.length > 160 ? "..." : ""),
              takeaways: [
                "Kepatuhan regulasi perpajakan nasional dan mitigasi risiko.",
                "Penyelarasan bukti potong dan rekonsiliasi data fiskal berkala.",
              ],
              content: [rawBody],
              status: "Published",
              isFeatured: true,
            };
          });

          setArticles((prev) => {
            const titles = new Set(apiArticles.map((a) => a.title.toLowerCase()));
            const localOnly = prev.filter((p) => !titles.has(p.title.toLowerCase()));
            return [...apiArticles, ...localOnly];
          });
        }
      })
      .catch((err) => {
        console.warn("publicApi.getEducation fallback in EducationSection:", err);
      });

    return () => {
      isMounted = false;
      window.removeEventListener(ZHOU_ARTICLES_EVENT, handleUpdate);
    };
  }, []);

  const publishedArticles = articles.filter((a) => a.status !== "Draft");

  const filteredArticles =
    activeCategory === "semua"
      ? publishedArticles
      : publishedArticles.filter((a) => a.categoryKey === activeCategory);

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3500);
  };

  return (
    <section
      id="edukasi"
      aria-label="Pusat Edukasi dan Wawasan Fiskal"
      className="py-16 md:py-20 lg:py-24 bg-surface border-b border-primary-light scroll-mt-20"
    >
      <div className="container-custom space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <h2 className="text-[20px] leading-[28px] sm:text-[21px] sm:leading-[29px] lg:text-section-heading font-bold text-primary tracking-tight text-balance">
              {t.education.headline}
            </h2>
            <p className="text-[15px] leading-[24px] sm:text-body-large text-text-secondary leading-relaxed">
              {t.education.subheading}
            </p>
          </div>
        </div>

        {/* Category Filter Tabs */}
        {publishedArticles.length > 0 && (
          <div className="flex items-center justify-start overflow-x-auto pb-2">
            <Tabs
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="w-auto"
            >
              <TabsList className="bg-white">
                <TabsTrigger value="semua" className="text-xs">
                  Semua Topik ({publishedArticles.length})
                </TabsTrigger>
                <TabsTrigger value="transformasi" className="text-xs">
                  Coretax &amp; Digital
                </TabsTrigger>
                <TabsTrigger value="kepatuhan" className="text-xs">
                  Kepatuhan Pajak
                </TabsTrigger>
                <TabsTrigger value="akuntansi" className="text-xs">
                  Akuntansi Bisnis
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="flex flex-col justify-between hover:border-primary hover:shadow-md transition-all duration-200 group bg-white"
              >
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-end text-xs text-text-secondary gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary whitespace-nowrap">
                      <CalendarIcon className="text-[10px]" />
                      {article.date}
                    </span>
                  </div>

                  <CardTitle
                    onClick={() => setSelectedArticle(article)}
                    className="text-[15px] font-bold text-primary group-hover:text-primary-dark transition-colors cursor-pointer leading-snug line-clamp-2"
                  >
                    {article.title}
                  </CardTitle>

                  <CardDescription className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                    {article.summary}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="pt-3 border-t border-primary-light flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                    <ClockIcon className="text-[11px]" />
                    <span>{article.readTime}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedArticle(article)}
                    className="text-xs font-bold text-primary group-hover:text-primary-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded px-1.5 py-0.5"
                  >
                    <span>Selengkapnya</span>
                  </button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 px-6 rounded-xl bg-white border border-primary-light text-center space-y-2.5">
              <BookIcon className="mx-auto text-silver text-3xl" />
              <h3 className="text-sm font-bold text-primary">Belum Ada Artikel Edukasi</h3>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                Modul dan artikel edukasi perpajakan resmi akan tampil otomatis setelah dipublikasikan oleh tim konsultan melalui dashboard.
              </p>
            </div>
          )}
        </div>

        {/* Link to Full Education Portal */}
        {publishedArticles.length > 0 && (
          <div className="flex justify-center -mt-2">
            <Button
              variant="outline"
              size="default"
              asChild
              className="text-xs font-bold gap-2 hover:border-primary"
            >
              <Link href="/edukasi">
                <span>Semua Artikel</span>
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Article Detail Reading Dialog */}
      <Dialog
        open={Boolean(selectedArticle)}
        onOpenChange={(open) => !open && setSelectedArticle(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader className="space-y-3 border-b border-primary-light pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" size="sm">
                    {selectedArticle.category}
                  </Badge>
                  <span className="text-xs text-text-secondary flex items-center gap-1">
                    <CalendarIcon className="text-[11px]" />
                    {selectedArticle.date}
                  </span>
                  <span className="text-xs text-text-secondary flex items-center gap-1">
                    <ClockIcon className="text-[11px]" />
                    {selectedArticle.readTime}
                  </span>
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-primary leading-snug">
                  {selectedArticle.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-text-secondary font-medium">
                  Disusun oleh {selectedArticle.author || "Tim Konsultan Zhou Consulting"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4 text-xs sm:text-sm text-text leading-relaxed">
                {selectedArticle.takeaways && selectedArticle.takeaways.length > 0 && (
                  <div className="p-4 rounded-lg bg-surface border border-primary-light space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Poin Kunci Pembahasan
                    </h4>
                    <ul className="space-y-2 text-xs">
                      {selectedArticle.takeaways.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-4">
                  {selectedArticle.content?.map((paragraph, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {downloadSuccess && (
                  <div className="p-3 bg-success text-white text-xs font-medium rounded-lg text-center">
                    Modul bacaan &quot;{selectedArticle.title}&quot; berhasil diunduh.
                  </div>
                )}
              </div>

              <DialogFooter className="border-t border-primary-light pt-4 flex flex-row items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="text-xs gap-1.5"
                >
                  Unduh Salinan PDF
                </Button>
                <DialogClose asChild>
                  <Button variant="primary" size="sm" className="text-xs">
                    Tutup Bacaan
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
