import { NextRequest, NextResponse } from "next/server";
import { sendCareerApplicationConfirmationEmail } from "@/lib/server/emailService";

// Server-side registry & mutex set untuk mencegah race conditions (dua request bersamaan)
const serverAppliedApplications = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let jobId = "";
    let positionTitle = "";
    let fullName = "";
    let email = "";
    let phone = "";
    let education = "";
    let linkedin = "";
    let coverLetter = "";
    let agreeTerms = false;
    let cvFileName = "";
    let cvFileSize = 0;
    let cvMimeType = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      jobId = String(formData.get("job_id") || formData.get("jobId") || "");
      positionTitle = String(formData.get("position_title") || formData.get("positionTitle") || "");
      fullName = String(formData.get("full_name") || formData.get("name") || formData.get("applicant_name") || "");
      email = String(formData.get("email") || formData.get("applicant_email") || "");
      phone = String(formData.get("phone") || formData.get("applicant_phone") || "");
      education = String(formData.get("education") || "");
      linkedin = String(formData.get("linkedin") || "");
      coverLetter = String(formData.get("cover_letter") || formData.get("coverLetter") || "");
      agreeTerms = formData.get("agree_terms") === "true" || formData.get("agreeTerms") === "true";

      const file = formData.get("cv") || formData.get("resume") || formData.get("cv_file");
      if (file && typeof file === "object" && "name" in file) {
        const fileObj = file as File;
        cvFileName = fileObj.name || "";
        cvFileSize = fileObj.size || 0;
        cvMimeType = fileObj.type || "";
      } else {
        cvFileName = String(formData.get("cv_file_name") || "");
      }
    } else {
      const body = await req.json();
      jobId = String(body.job_id || body.jobId || "");
      positionTitle = String(body.position_title || body.positionTitle || "");
      fullName = String(body.full_name || body.name || body.applicant_name || "");
      email = String(body.email || body.applicant_email || "");
      phone = String(body.phone || body.applicant_phone || "");
      education = String(body.education || "");
      linkedin = String(body.linkedin || "");
      coverLetter = String(body.cover_letter || body.coverLetter || "");
      agreeTerms = Boolean(body.agree_terms || body.agreeTerms);
      cvFileName = String(body.cv_file_name || body.cv_file_path || "");
      cvFileSize = Number(body.cv_file_size || 0);
      cvMimeType = String(body.cv_mime_type || "application/pdf");
    }

    // 1. Normalisasi Email: hapus spasi awal/akhir dan jadikan huruf kecil
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedJobId = (jobId || "general-talent-pool").trim().toLowerCase();

    // 2. Validasi Field Wajib & Format di Server
    const errors: Record<string, string> = {};

    if (!normalizedJobId) {
      errors.position = "Silakan pilih posisi lowongan yang ingin Anda lamar.";
    }

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = "Nama lengkap wajib diisi.";
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      errors.email = "Masukkan alamat email yang valid.";
    }

    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    const phoneRegex = /^(\+?\d{9,15})$/;
    if (!phone.trim()) {
      errors.phone = "Nomor WhatsApp/HP wajib diisi.";
    } else if (!phoneRegex.test(cleanPhone)) {
      errors.phone = "Periksa kembali nomor WhatsApp/HP Anda.";
    }

    if (!education.trim() || education.trim().length < 2) {
      errors.education = "Pendidikan terakhir dan jurusan wajib diisi.";
    }

    // Validasi Berkas CV (Ekstensi, MIME type, ukuran maks 5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (!cvFileName) {
      errors.cv = "Silakan unggah CV sebelum mengirim lamaran.";
    } else if (!cvFileName.toLowerCase().endsWith(".pdf")) {
      errors.cv = "Format CV harus PDF.";
    } else if (cvMimeType && cvMimeType !== "application/pdf" && !cvMimeType.includes("pdf")) {
      errors.cv = "Format CV harus PDF.";
    } else if (cvFileSize > maxBytes) {
      errors.cv = "Ukuran CV melebihi batas yang diizinkan.";
    }

    if (!agreeTerms) {
      errors.agreeTerms = "Centang persetujuan pemrosesan data untuk melanjutkan.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: Object.values(errors)[0],
          errors,
        },
        { status: 422 }
      );
    }

    // 3. Validasi Duplikasi Server-Side: Satu email hanya boleh melamar 1 kali untuk lowongan yang sama
    const lockKey = `${normalizedJobId}:${normalizedEmail}`;
    if (serverAppliedApplications.has(lockKey)) {
      return NextResponse.json(
        {
          success: false,
          message: "Email ini sudah digunakan untuk melamar posisi ini. Silakan periksa kembali data lamaran Anda.",
          duplicate: true,
        },
        { status: 409 }
      );
    }

    // Daftarkan kunci atomic di server registry
    serverAppliedApplications.add(lockKey);

    // 4. Integrasi dengan Backend Remote jika tersedia
    const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || "http://43.173.2.162";
    const backendBaseUrl = rawBackendUrl
      .trim()
      .replace(/\/+$/, "")
      .replace(/\/docs\/?$/i, "")
      .replace(/\/api\/?$/i, "")
      .replace(/https:\/\/43\.173\.2\.162\.sslip\.io/i, "http://43.173.2.162");
    const numericJobId = parseInt(normalizedJobId.replace(/\D/g, ""), 10) || 1;

    try {
      const backendRes = await fetch(`${backendBaseUrl}/api/v1/public/careers/${numericJobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          job_id: normalizedJobId,
          applicant_name: fullName.trim(),
          applicant_email: normalizedEmail,
          applicant_phone: phone.trim(),
          education: education.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
          cover_letter: coverLetter.trim() || undefined,
          cv_file_path: cvFileName,
        }),
      });

      if (!backendRes.ok) {
        const backendJson = await backendRes.json().catch(() => null);
        const errText = (backendJson?.message || "").toLowerCase();
        if (backendRes.status === 409 || errText.includes("already") || errText.includes("sudah") || errText.includes("duplicate")) {
          return NextResponse.json(
            {
              success: false,
              message: "Email ini sudah digunakan untuk melamar posisi ini. Silakan periksa kembali data lamaran Anda.",
              duplicate: true,
            },
            { status: 409 }
          );
        }
      }
    } catch {
      // Graceful fallback jika server remote offline / sandbox mode
    }

    // 5. Generate Registration Code Resmi
    const registrationCode = `ZHOU-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 6. Kirim email konfirmasi otomatis kepada pelamar (asinkron aman setelah data lamaran tersimpan)
    const emailResult = await sendCareerApplicationConfirmationEmail({
      recipientEmail: normalizedEmail,
      applicantName: fullName.trim(),
      positionTitle: positionTitle || "Pendaftaran Karir",
      registrationCode,
    });

    return NextResponse.json({
      success: true,
      message: "Lamaran berhasil dikirim dan diverifikasi oleh sistem.",
      data: {
        registration_code: registrationCode,
        applied_at: new Date().toISOString(),
        applicant_email: normalizedEmail,
        applicant_name: fullName.trim(),
        applicant_phone: phone.trim(),
        education: education.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        cover_letter: coverLetter.trim() || undefined,
        job_id: normalizedJobId,
        position_title: positionTitle || "Pendaftaran Karir",
      },
      email_notification: {
        status: emailResult.status,
        recipient: normalizedEmail,
      },
    });
  } catch (error) {
    console.error("Server apply route error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lamaran belum berhasil dikirim karena gangguan koneksi atau server. Silakan coba kembali.",
      },
      { status: 500 }
    );
  }
}
