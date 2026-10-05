"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingWhatsAppCTA } from "@/components/landing/FloatingWhatsAppCTA";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BriefcaseIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@/components/icons";
import {
  StoredServiceItem,
  getStoredServiceByCategory,
  SERVICES_EVENT,
} from "@/data/layananStorage";

export default function KonsultasiBisnisPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [service, setService] = useState<StoredServiceItem | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setService(getStoredServiceByCategory("bisnis"));
    setLoaded(true);

    const handleUpdate = () => {
      setService(getStoredServiceByCategory("bisnis"));
    };

    window.addEventListener(SERVICES_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(SERVICES_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const serviceScopes = service?.pillars || [];
  const workflowSteps = service?.workflow || [];
  const deliverables = service?.deliverables || [];
  const faqs = service?.faqs || [];

  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb Section */}
        <section className="py-6 bg-surface border-b border-primary-light">
          <div className="container-custom">
            <nav className="flex items-center gap-2 text-xs text-text-secondary font-medium">
              <Link href="/" className="hover:text-primary transition-colors">
                Beranda
              </Link>
              <span>/</span>
              <Link href="/layanan" className="hover:text-primary transition-colors">
                Layanan
              </Link>
              <span>/</span>
              <span className="text-primary font-semibold">Business &amp; Financial Services</span>
            </nav>
          </div>
        </section>

        {!service && loaded ? (
          /* Empty State when no data entered by admin */
          <section className="py-20 bg-white">
            <div className="container-custom max-w-2xl text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-primary-light/50 text-primary mx-auto flex items-center justify-center text-3xl shadow-xs">
                <BriefcaseIcon />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-primary tracking-tight">
                  Informasi Layanan Belum Tersedia
                </h1>
                <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
                  Rincian modul, studi kelayakan, dan alur advisori finansial bisnis sedang dalam proses pembaruan oleh administrator.
                </p>
              </div>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <Button variant="primary" size="default" asChild className="text-xs font-semibold shadow-xs">
                  <Link href="/konsultasi">Konsultasi dengan Kami</Link>
                </Button>
                <Button variant="outline" size="default" asChild className="text-xs font-semibold border-primary-light">
                  <Link href="/layanan">Kembali ke Katalog Layanan</Link>
                </Button>
              </div>
            </div>
          </section>
        ) : (
          /* Dynamic Service Details */
          <>
            <section className="py-14 md:py-20 bg-surface border-b border-primary-light">
              <div className="container-custom space-y-10">
                <div className="max-w-3xl space-y-3">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
                    {service?.name || "Cakupan Layanan Konsultasi Finansial Bisnis"}
                  </h1>
                  <p className="text-body-regular text-text-secondary leading-relaxed">
                    {service?.subtitle || "Pendekatan kuantitatif berbasis data nyata untuk memandu keputusan strategis penganggaran modal."}
                  </p>
                </div>

                {serviceScopes.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {serviceScopes.map((scope, idx) => (
                      <Card
                        key={idx}
                        className="rounded-xl border-primary-light bg-white hover:shadow-md hover:border-silver transition-all duration-200 flex flex-col justify-between"
                      >
                        <CardHeader className="space-y-3 pb-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center text-base">
                            <BriefcaseIcon />
                          </div>
                          <div>
                            <CardTitle className="text-card-heading font-semibold text-primary">
                              {scope.title}
                            </CardTitle>
                            <CardDescription className="text-xs text-text-secondary mt-1 leading-relaxed">
                              {scope.description}
                            </CardDescription>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Workflow Steps if available */}
            {workflowSteps.length > 0 && (
              <section className="py-16 md:py-20 bg-white border-b border-primary-light">
                <div className="container-custom space-y-12">
                  <div className="text-center max-w-2xl mx-auto space-y-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                      Tahapan Sistematis Pelaksanaan Layanan
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {workflowSteps.map((wf, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-xl bg-surface border border-primary-light space-y-3 flex flex-col justify-between"
                      >
                        <span className="text-2xl font-bold text-primary/30 tracking-tight">
                          0{idx + 1}
                        </span>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {wf}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Deliverables if available */}
            {deliverables.length > 0 && (
              <section className="py-16 md:py-20 bg-surface border-b border-primary-light">
                <div className="container-custom space-y-10">
                  <div className="max-w-2xl space-y-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                      Luaran Nyata yang Diterima Klien
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-white border border-primary-light flex items-start gap-3 shadow-sm"
                      >
                        <div className="w-7 h-7 rounded-md bg-success/10 text-success flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckIcon className="text-xs" />
                        </div>
                        <span className="text-xs font-semibold text-primary leading-relaxed">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* FAQ Section if available */}
            {faqs.length > 0 && (
              <section className="py-16 md:py-20 bg-surface border-b border-primary-light">
                <div className="container-custom max-w-3xl space-y-10">
                  <div className="text-center space-y-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                      Tanya Jawab Layanan
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg bg-white border border-primary-light overflow-hidden transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(idx)}
                          className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-primary hover:bg-surface/50 transition-colors"
                          aria-expanded={openFaq === idx}
                        >
                          <span>{faq.q}</span>
                          <ChevronDownIcon
                            className={`text-[10px] text-silver transition-transform duration-200 ${
                              openFaq === idx ? "rotate-180 text-primary" : ""
                            }`}
                          />
                        </button>
                        {openFaq === idx && (
                          <div className="px-4 pb-4 pt-1 text-xs text-text-secondary leading-relaxed border-t border-primary-light/50">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
      <FloatingWhatsAppCTA />
    </div>
  );
}
