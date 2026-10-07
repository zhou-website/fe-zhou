"use client";

import React, { useState, useEffect } from "react";
import { clientApi, ConsultationItem } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { isDummyTicket } from "@/context/AuthContext";
import {
  CheckCircleIcon,
  DocumentIcon,
  CloseIcon,
  SearchIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons";

interface Milestone {
  step: string;
  title: string;
  status: "completed" | "in_progress" | "pending";
  date: string;
  description: string;
}

interface Deliverable {
  name: string;
  size: string;
  format: "XLSX" | "PDF";
  date: string;
}

interface Correspondence {
  id: string;
  sender: string;
  role: "Konsultan" | "Klien";
  date: string;
  message: string;
}

interface Ticket {
  id: string;
  title: string;
  category: "Tax Service Core" | "Accounting Service" | "Legal" | "Business Consulting";
  consultant: string;
  status: "In Progress" | "Completed";
  progress: number;
  createdAt: string;
  estimatedCompletion: string;
  milestones: Milestone[];
  deliverables: Deliverable[];
  correspondences: Correspondence[];
}

export default function ClientTicketMonitoringPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sync consultations, filtering out any backend dummy seed projects
  useEffect(() => {
    // 1. Cek tiket yang dibuat oleh klien secara lokal
    try {
      const saved = localStorage.getItem("zhou_client_custom_tickets");
      if (saved) {
        const parsed = JSON.parse(saved) as Ticket[];
        const filteredSaved = parsed.filter((t) => !isDummyTicket(t));
        if (filteredSaved.length > 0) {
          setTickets(filteredSaved);
        }
      }
    } catch {}

    // 2. Muat tiket backend dan filter keluar tiket dummy (PRJ-TAX-2026-001 / Maju Sukses)
    async function loadBackendTickets() {
      try {
        const res = await clientApi.getConsultations();
        if (res.success && Array.isArray(res.data)) {
          const validConsultations = res.data.filter((c: ConsultationItem) => !isDummyTicket(c));
          if (validConsultations.length > 0) {
            const mapped: Ticket[] = validConsultations.map((c: ConsultationItem) => ({
              id: c.project_code || `TK-${c.id}`,
              title: c.title,
              category: "Tax Service Core",
              consultant: "Tim Konsultan Zhou",
              status: c.status === "COMPLETED" ? "Completed" : "In Progress",
              progress: c.progress_percent || (c.status === "COMPLETED" ? 100 : 40),
              createdAt: new Date(c.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              estimatedCompletion: "Sesuai Jadwal SLA",
              milestones: [
                {
                  step: "01",
                  title: "Intake & Verifikasi Berkas Awal",
                  status: "completed",
                  date: "Hari ke-1",
                  description: "Permohonan konsultasi diterima sistem operasional dan diverifikasi.",
                },
                {
                  step: "02",
                  title: "Analisis & Pengerjaan Lembar Kerja",
                  status: c.status === "COMPLETED" ? "completed" : "in_progress",
                  date: "Proses",
                  description: "Peninjauan dokumen pendukung dan penyusunan kertas kerja.",
                },
                {
                  step: "03",
                  title: "Finalisasi & Penyampaian Hasil",
                  status: c.status === "COMPLETED" ? "completed" : "pending",
                  date: "Final",
                  description: "Penerbitan dokumen deliverable resmi.",
                },
              ],
              deliverables: c.status === "COMPLETED" ? [
                {
                  name: "Laporan_Resmi_Konsultasi_Zhou.pdf",
                  size: "1.8 MB",
                  format: "PDF",
                  date: "Selesai",
                }
              ] : [],
              correspondences: [
                {
                  id: `msg-${c.id}`,
                  sender: "Tim Konsultan Zhou (Sistem Penugasan)",
                  role: "Konsultan",
                  date: "Terbaru",
                  message: c.description || "Perikatan konsultasi sedang dalam proses penanganan oleh konsultan kami.",
                },
              ],
            }));
            setTickets((prev) => {
              const combined = [...prev, ...mapped.filter((m) => !prev.some((p) => p.id === m.id))];
              return combined;
            });
          }
        }
      } catch (err) {
        console.warn("Backend tickets load fallback:", err);
      }
    }
    loadBackendTickets();
  }, []);

  // Modal State for New Ticket
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Ticket["category"]>("Tax Service Core");
  const [newUrgency, setNewUrgency] = useState("Normal");
  const [newDescription, setNewDescription] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const activeCount = tickets.filter((t) => t.status === "In Progress").length;
  const completedCount = tickets.filter((t) => t.status === "Completed").length;
  const totalDeliverablesCount = tickets.reduce((acc, t) => acc + (t.deliverables?.length || 0), 0);

  // Filtering Logic
  const filteredTickets = tickets.filter((ticket) => {
    // Category Filter
    if (categoryFilter !== "all" && ticket.category !== categoryFilter) return false;

    // Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchId = ticket.id.toLowerCase().includes(q);
      const matchTitle = ticket.title.toLowerCase().includes(q);
      const matchConsultant = ticket.consultant.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchConsultant) return false;
    }

    return true;
  });

  // Handle New Ticket Submit
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      showToast("Mohon lengkapi judul dan deskripsi permohonan konsultasi.");
      return;
    }

    try {
      await clientApi.escalateChatbot({
        message: `[${newCategory}] [Urgensi: ${newUrgency}] ${newTitle}: ${newDescription}`,
        category: newCategory,
      });
    } catch (err) {
      console.warn("Backend ticket creation notice:", err);
    }

    const newId = `TK-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newTicketItem: Ticket = {
      id: newId,
      title: newTitle,
      category: newCategory,
      consultant: "Tim Konsultan Senior Zhou (Dalam Penugasan)",
      status: "In Progress",
      progress: 25,
      createdAt: "Hari ini",
      estimatedCompletion: "Dalam Proses",
      milestones: [
        {
          step: "01",
          title: "Intake & Verifikasi Berkas Awal",
          status: "in_progress",
          date: "Hari ini",
          description: "Permohonan konsultasi diterima sistem operasional dan sedang dialokasikan ke lead konsultan terkait.",
        },
        {
          step: "02",
          title: "Analisis & Pengerjaan Lembar Kerja",
          status: "pending",
          date: "Estimasi 3 hari",
          description: "Peninjauan dokumen pendukung dan penyusunan kertas kerja.",
        },
        {
          step: "03",
          title: "Finalisasi & Penyampaian Hasil",
          status: "pending",
          date: "Estimasi 7 hari",
          description: "Penerbitan dokumen deliverable resmi.",
        },
      ],
      deliverables: [],
      correspondences: [
        {
          id: `msg-${Date.now()}`,
          sender: "Tim Konsultan Zhou (Sistem Penugasan)",
          role: "Konsultan",
          date: "Hari ini &bull; Baru saja",
          message: `Permohonan konsultasi telah diterima: "${newDescription}". Konsultan pendamping sedang menelaah berkas pendukung.`,
        },
      ],
    };

    setTickets((prev) => {
      const updated = [newTicketItem, ...prev];
      try {
        localStorage.setItem("zhou_client_custom_tickets", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setIsNewTicketModalOpen(false);
    setNewTitle("");
    setNewDescription("");
    showToast(`Permohonan konsultasi berhasil dibuat dengan nomor referensi ${newId}.`);
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white text-xs font-semibold py-3 px-5 rounded-xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircleIcon className="text-success text-base" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-silver hover:text-white ml-2 cursor-pointer p-1"
            aria-label="Tutup notifikasi"
          >
            <CloseIcon className="text-xs" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="pb-6 border-b border-primary-light">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
          Monitoring Konsultasi &amp; Lembar Kerja
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
          Pantau alur tahapan penugasan akuntansi, kepatuhan pajak Coretax DJP, dan unduh berkas deliverable resmi secara terpusat.
        </p>
      </div>

      {/* Row 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1 */}
        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Konsultasi Aktif Berjalan
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono flex items-baseline gap-1.5">
            <span>{activeCount < 10 ? `0${activeCount}` : activeCount}</span>
            <span className="text-xs text-text-secondary font-sans font-normal">Tiket</span>
          </div>
          <div className="mt-3 w-full bg-surface h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${tickets.length > 0 ? Math.round((activeCount / tickets.length) * 100) : 0}%` }} />
          </div>
        </Card>

        {/* Card 2 */}
        <Card className="p-4 sm:p-5 rounded-2xl border-emerald-200 bg-emerald-50/40 shadow-xs">
          <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider block">
            Laporan Selesai &amp; Rilis
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-800 font-mono flex items-baseline gap-1.5">
            <span>{completedCount < 10 ? `0${completedCount}` : completedCount}</span>
            <span className="text-xs text-emerald-700 font-sans font-normal">Selesai</span>
          </div>
          <div className="mt-3 w-full bg-surface h-1.5 rounded-full overflow-hidden">
            <div className="bg-success h-full rounded-full" style={{ width: `${tickets.length > 0 ? Math.round((completedCount / tickets.length) * 100) : 0}%` }} />
          </div>
        </Card>

        {/* Card 3 */}
        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Total Dokumen Layanan
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono flex items-baseline gap-1.5">
            <span>{totalDeliverablesCount < 10 ? `0${totalDeliverablesCount}` : totalDeliverablesCount}</span>
            <span className="text-xs text-text-secondary font-sans font-normal">Berkas</span>
          </div>
          <div className="mt-3 w-full bg-surface h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: "100%" }} />
          </div>
        </Card>
      </div>

      {/* MASTER PANEL: TABEL DAFTAR KONSULTASI */}
      <Card className="rounded-2xl border-primary-light bg-white shadow-sm overflow-hidden">
        <CardHeader className="p-5 sm:p-6 border-b border-primary-light space-y-4">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg font-bold text-primary">
              Daftar Seluruh Konsultasi
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Klik baris konsultasi untuk membuka lembar kerja di panel bawah.
            </CardDescription>
          </div>

          {/* Search + Filter Kategori + Button Buat Konsultasi Baru Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-2.5 text-text-muted text-xs pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Cari ID konsultasi, judul kebutuhan, atau nama konsultan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-9 bg-surface border-primary-light w-full"
                />
              </div>
              <div className="w-full sm:w-60 shrink-0">
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs h-9 bg-surface border-primary-light w-full"
                >
                  <option value="all">Semua Kategori Layanan</option>
                  <option value="Tax Service Core">Tax Service Core</option>
                  <option value="Accounting Service">Accounting Service</option>
                  <option value="Business Consulting">Business Consulting</option>
                  <option value="Legal">Legal Compliance</option>
                </Select>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => setIsNewTicketModalOpen(true)}
              className="font-semibold text-xs py-2 px-4 shadow-sm shrink-0 whitespace-nowrap self-stretch sm:self-auto"
            >
              <span>Buat Konsultasi Baru</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/80 text-text-secondary font-bold uppercase tracking-wider text-[10px] border-b border-primary-light">
                <tr>
                  <th className="py-3.5 px-4">ID Konsultasi</th>
                  <th className="py-3.5 px-4">Subjek / Kebutuhan</th>
                  <th className="py-3.5 px-4">Divisi</th>
                  <th className="py-3.5 px-4">Konsultan Lead</th>
                  <th className="py-3.5 px-4">Progres</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-light">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-text-muted">
                      <div className="space-y-1">
                        <p className="font-semibold text-primary">Tidak Ada Tiket Konsultasi</p>
                        <p className="text-[11px] text-text-secondary">
                          Belum ada permohonan konsultasi. Klik tombol &quot;Buat Konsultasi Baru&quot; di atas untuk memulai konsultasi.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-surface/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-primary">
                        {ticket.id}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-primary line-clamp-1 font-bold">
                          {ticket.title}
                        </div>
                        <div className="text-[11px] text-text-muted mt-0.5">
                          Dibuat: {ticket.createdAt}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] text-text-secondary">
                          {ticket.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-text-primary">
                          <UserIcon className="text-[10px] text-text-muted" />
                          <span>{ticket.consultant}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-surface border border-primary-light h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                ticket.progress === 100 ? "bg-success" : "bg-primary"
                              }`}
                              style={{ width: `${ticket.progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-primary">
                            {ticket.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 font-semibold ${
                            ticket.status === "Completed"
                              ? "bg-success/15 text-success border-success/30"
                              : "bg-primary/10 text-primary border-primary/20"
                          }`}
                        >
                          {ticket.status === "Completed" ? "Selesai" : "Dalam Proses"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-primary-light bg-surface/40 flex items-center justify-between text-xs text-text-muted">
            <span>
              Menampilkan {filteredTickets.length} dari {tickets.length} total konsultasi
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="w-7 h-7 p-0 flex items-center justify-center text-xs border-primary-light text-text-muted hover:text-primary disabled:opacity-40"
                disabled
                aria-label="Halaman Sebelumnya"
              >
                <ChevronLeftIcon className="text-xs" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-7 h-7 p-0 flex items-center justify-center text-xs bg-primary/10 text-primary border-primary/30 font-bold"
              >
                1
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-7 h-7 p-0 flex items-center justify-center text-xs border-primary-light text-text-muted hover:text-primary disabled:opacity-40"
                disabled
                aria-label="Halaman Selanjutnya"
              >
                <ChevronRightIcon className="text-xs" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* MODAL: BUAT TIKET KONSULTASI BARU */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-primary-light shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-primary-light flex items-center justify-between bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-bold">
                  <DocumentIcon />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary">Buat Konsultasi Baru</h3>
                  <p className="text-[11px] text-text-muted">Layanan Konsultasi Klien Zhou</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTicketModalOpen(false)}
                className="text-text-muted hover:text-primary p-1 rounded cursor-pointer transition-colors"
                aria-label="Tutup modal"
              >
                <CloseIcon className="text-base" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="font-bold text-primary">
                  Judul Kebutuhan / Permasalahan
                </Label>
                <Input
                  id="title"
                  placeholder="Subjek permohonan / kebutuhan konsultasi"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="font-bold text-primary">
                    Divisi Layanan
                  </Label>
                  <Select
                    id="category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Ticket["category"])}
                    className="text-xs h-9"
                  >
                    <option value="Tax Service Core">Tax Service Core</option>
                    <option value="Accounting Service">Accounting Service</option>
                    <option value="Business Consulting">Business Consulting</option>
                    <option value="Legal">Legal Compliance</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="urgency" className="font-bold text-primary">
                    Prioritas Penanganan
                  </Label>
                  <Select
                    id="urgency"
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value)}
                    className="text-xs h-9"
                  >
                    <option value="Normal">Normal (SLA 1x24 Jam)</option>
                    <option value="Tinggi">Tinggi / Urgent (SP2DK Deadline)</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="font-bold text-primary">
                  Uraian Detail Masalah / Pertanyaan
                </Label>
                <Textarea
                  id="description"
                  placeholder="Jelaskan secara ringkas latar belakang persoalan atau ruang lingkup yang ingin dikonsultasikan..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={4}
                  className="text-xs"
                  required
                />
              </div>

              <div className="p-3 bg-surface border border-dashed border-primary-light rounded-xl text-center">
                <DocumentIcon className="mx-auto text-primary text-lg mb-1" />
                <span className="text-[11px] text-text-secondary block">
                  Unggah berkas lampiran pendukung (PDF / XLSX maks. 10MB)
                </span>
                <span className="text-[10px] text-text-muted block mt-0.5">
                  Otomatis terenkripsi dan terikat perjanjian kerahasiaan NDA
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-primary-light">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewTicketModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Kirim Permohonan Konsultasi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
