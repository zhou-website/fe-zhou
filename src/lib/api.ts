/**
 * Zhou Consulting - RESTful API Client Integration
 * Connected to live backend at http://43.173.2.162 (OpenAPI Docs: http://43.173.2.162/docs)
 * Handles JWT authentication, automatic token injection, error handling, and type-safe endpoints.
 */

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
}

export const API_BASE_URL = getApiBaseUrl();

export const TOKEN_STORAGE_KEY = "zhou_auth_token";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: unknown;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export const USER_ROLE_COOKIE_KEY = "zhou_user_role";

export function getCurrentUserRole(): "user" | "admin" | "superadmin" | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("zhou_auth_user");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.role) {
        const lower = String(parsed.role).toLowerCase().trim();
        if (lower.includes("super")) return "superadmin";
        if (lower.includes("admin")) return "admin";
        return "user";
      }
    }
    const cookieMatch = document.cookie.match(new RegExp(`(?:^|;\\s*)${USER_ROLE_COOKIE_KEY}=([^;]+)`));
    if (cookieMatch) {
      const val = decodeURIComponent(cookieMatch[1]).toLowerCase().trim();
      if (val.includes("super")) return "superadmin";
      if (val.includes("admin")) return "admin";
      return "user";
    }
  } catch {
    // fallback
  }
  return null;
}

export function setAuthToken(token: string, role?: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    document.cookie = `${TOKEN_STORAGE_KEY}=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
    if (role) {
      document.cookie = `${USER_ROLE_COOKIE_KEY}=${encodeURIComponent(role)}; path=/; max-age=604800; SameSite=Lax`;
    }
  } catch (err) {
    console.error("Gagal menyimpan token ke localStorage/cookie:", err);
  }
}

export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    document.cookie = `${TOKEN_STORAGE_KEY}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${USER_ROLE_COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
  } catch (err) {
    console.error("Gagal menghapus token dari localStorage/cookie:", err);
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
  retries?: number;
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, skipAuth = false, headers = {}, retries, ...rest } = options;

  const baseUrl = getApiBaseUrl();
  let url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes("?") ? "&" : "?") + qs;
    }
  }

  const reqHeaders: Record<string, string> = {
    Accept: "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    ...(headers as Record<string, string>),
  };

  if (!(rest.body instanceof FormData)) {
    reqHeaders["Content-Type"] = "application/json";
  }

  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      reqHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  // Tentukan jumlah retry (default 2 kali untuk request GET yang aman/idempotent)
  const isGetMethod = !rest.method || rest.method.toUpperCase() === "GET";
  const maxRetries = retries !== undefined ? retries : (isGetMethod ? 2 : 0);

  let attempt = 0;
  while (true) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        ...rest,
        headers: reqHeaders,
      });

      const isJson = response.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await response.json() : null;

      if (!response.ok) {
        return {
          success: false,
          message: data?.message || data?.error || `Permintaan gagal dengan status ${response.status}`,
          error: data?.error || response.statusText,
          errors: data?.errors,
          data: data?.data,
        };
      }

      return (
        data || {
          success: true,
          message: "Operasi berhasil",
        }
      );
    } catch (err: unknown) {
      attempt++;
      if (attempt <= maxRetries) {
        // Tunggu sebentar (backoff) jika jaringan sempat putus atau berubah (ERR_NETWORK_CHANGED)
        await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
        continue;
      }

      const message = err instanceof Error ? err.message : "Gagal terhubung ke server backend";
      console.error(`API Error on [${url}] after ${attempt} attempt(s):`, err);
      return {
        success: false,
        message,
        error: "NETWORK_ERROR",
      };
    }
  }
}

// ----------------------------------------------------
// Modul Autentikasi (Auth)
// ----------------------------------------------------
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company_name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
  phone?: string;
  company_name?: string;
  avatar_url?: string | null;
  created_at?: string;
}

export interface LoginResponseData {
  token: string;
  user: UserProfileResponse;
}

export interface GoogleAuthResponseData {
  token: string;
  user?: UserProfileResponse;
}

export interface GoogleAuthPayload {
  credential: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiFetch<UserProfileResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    }),

  login: (payload: LoginPayload) =>
    apiFetch<LoginResponseData>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    }),

  google: (payload: GoogleAuthPayload | { credential: string } | string) => {
    const credential = typeof payload === "string" ? payload : payload.credential;
    return apiFetch<GoogleAuthResponseData>("/api/v1/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
      skipAuth: true,
    });
  },

  forgotPassword: (email: string) =>
    apiFetch("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    }),

  resetPassword: (payload: { token: string; new_password: string }) =>
    apiFetch("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    }),

  logout: () =>
    apiFetch("/api/v1/auth/logout", {
      method: "POST",
    }),
};

// ----------------------------------------------------
// Modul Profil Pengguna (User)
// ----------------------------------------------------
export const userApi = {
  getProfile: () => apiFetch<UserProfileResponse>("/api/v1/user/profile"),

  updateProfile: (payload: Partial<UserProfileResponse>) =>
    apiFetch<UserProfileResponse>("/api/v1/user/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

// ----------------------------------------------------
// Modul Portal Klien (Client)
// ----------------------------------------------------
export interface ConsultationItem {
  id: number;
  project_code: string;
  client_id: number;
  service_id?: number;
  title: string;
  description?: string;
  status: "IN_PROGRESS" | "COMPLETED" | "PENDING";
  progress_percent?: number;
  created_at: string;
  updated_at?: string;
  client?: {
    id: number;
    name: string;
    email: string;
    company_name?: string;
  };
  service?: {
    service_name: string;
    category: string;
  };
  assigned_admin?: {
    id: number;
    name: string;
    email?: string;
  } | null;
  assigned_to?: number;
  tasks?: AdminTaskItem[];
  documents?: ClientDocumentItem[];
}

export interface ClientDocumentItem {
  id: number;
  project_id: number;
  file_name: string;
  file_path: string;
  file_size?: string;
  file_type?: string;
  sha_hash?: string;
  download_url?: string;
  project?: {
    id?: number;
    project_code?: string;
    title?: string;
    client?: {
      id?: number;
      name?: string;
      company_name?: string;
    };
  };
  uploader?: {
    id?: number;
    name?: string;
  };
  uploaded_by?: number;
  created_at: string;
}

export const clientApi = {
  getDashboardOverview: () => apiFetch("/api/v1/client/dashboard/overview"),

  getConsultations: (status?: string) =>
    apiFetch<ConsultationItem[]>("/api/v1/client/consultations", {
      params: { status },
    }),

  getConsultationById: (id: number | string) =>
    apiFetch<ConsultationItem>(`/api/v1/client/consultations/${id}`),

  getDocuments: () => apiFetch<ClientDocumentItem[]>("/api/v1/client/documents"),

  getDownloadUrl: (docId: number | string) =>
    apiFetch<{ download_url: string }>(`/api/v1/client/documents/${docId}/download`),

  getChatbotTree: () => apiFetch("/api/v1/client/chatbot/tree"),

  createConsultation: async (payload: {
    title: string;
    description: string;
    category?: string;
    priority?: string;
    service_id?: number;
  }) => {
    // Map category name to valid backend service_id if not explicitly passed
    let srvId = payload.service_id;
    if (!srvId && payload.category) {
      const cat = payload.category.toLowerCase();
      if (cat.includes("tax") || cat.includes("pajak")) srvId = 1;
      else if (cat.includes("account") || cat.includes("akuntansi")) srvId = 9;
      else if (cat.includes("business") || cat.includes("bisnis") || cat.includes("financial")) srvId = 10;
      else if (cat.includes("legal") || cat.includes("hukum")) srvId = 11;
      else srvId = 1;
    }

    // 1. Try standard POST /api/v1/client/consultations
    try {
      const directRes = await apiFetch<ConsultationItem>("/api/v1/client/consultations", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          service_id: srvId,
        }),
      });
      if (directRes.success && directRes.data) {
        return directRes;
      }
    } catch { }

    // 2. Official backend escalation endpoint for creating client consultations
    return apiFetch<ConsultationItem>("/api/v1/client/chatbot/escalate", {
      method: "POST",
      body: JSON.stringify({
        title: payload.title,
        last_message: payload.description,
        category: payload.category || "Tax Service Core",
        service_id: srvId || 1,
        answered_node: "Permohonan Konsultasi Baru",
      }),
    });
  },

  escalateChatbot: (payload: {
    message: string;
    contact_phone?: string;
    category?: string;
  }) =>
    apiFetch("/api/v1/client/chatbot/escalate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  uploadConsultationDocument: (
    consultationId: number | string,
    formData: FormData
  ) =>
    apiFetch<{
      id: number;
      project_id: number;
      file_name: string;
      file_path: string;
      file_size?: string;
      file_type?: string;
      created_at: string;
    }>(`/api/v1/client/consultations/${consultationId}/documents`, {
      method: "POST",
      body: formData,
    }),

  deleteConsultation: (id: number | string) =>
    apiFetch(`/api/v1/client/consultations/${id}`, {
      method: "DELETE",
    }),
};

// ----------------------------------------------------
// Modul Operasional Admin (Admin)
// ----------------------------------------------------
export interface AdminTaskItem {
  id: number;
  project_id: number;
  task_name: string;
  is_completed: boolean;
  updated_at?: string;
}

export interface AdminDashboardOverviewData {
  total_consultations: number;
  active_consultations: number;
  completed_consultations: number;
  total_clients: number;
  total_documents: number;
}

export const adminApi = {
  getDashboardOverview: () =>
    apiFetch<AdminDashboardOverviewData>("/api/v1/admin/dashboard/overview"),

  getConsultations: () => apiFetch<ConsultationItem[]>("/api/v1/admin/consultations"),

  createConsultation: (payload: {
    client_id: number;
    service_id?: number;
    title: string;
    description?: string;
  }) =>
    apiFetch<ConsultationItem>("/api/v1/admin/consultations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateConsultation: (
    id: number | string,
    payload: {
      status?: string;
      progress_percent?: number;
      assigned_admin_id?: number;
      description?: string;
      title?: string;
    }
  ) =>
    apiFetch<ConsultationItem>(`/api/v1/admin/consultations/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  updateConsultationStatus: (id: number | string, status: string) =>
    apiFetch(`/api/v1/admin/consultations/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  assignConsultation: (id: number | string, assigned_admin_id: number | string) =>
    apiFetch(`/api/v1/admin/consultations/${id}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ assigned_admin_id: Number(assigned_admin_id) }),
    }),

  getTasks: (consultationId: number | string) =>
    apiFetch<AdminTaskItem[]>(`/api/v1/admin/consultations/${consultationId}/tasks`),

  createTask: (consultationId: number | string, task_name: string) =>
    apiFetch<AdminTaskItem>(`/api/v1/admin/consultations/${consultationId}/tasks`, {
      method: "POST",
      body: JSON.stringify({ task_name }),
    }),

  updateTask: (
    consultationId: number | string,
    taskId: number | string,
    is_completed: boolean
  ) =>
    apiFetch<AdminTaskItem>(
      `/api/v1/admin/consultations/${consultationId}/tasks/${taskId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ is_completed }),
      }
    ),

  getDocuments: (consultationId: number | string) =>
    apiFetch<ClientDocumentItem[]>(
      `/api/v1/admin/consultations/${consultationId}/documents`
    ),

  uploadDocument: (consultationId: number | string, formData: FormData) => {
    return apiFetch<ClientDocumentItem>(
      `/api/v1/admin/consultations/${consultationId}/documents`,
      {
        method: "POST",
        body: formData,
      }
    );
  },

  getAllDocuments: () => apiFetch<ClientDocumentItem[]>("/api/v1/admin/documents"),

  deleteDocument: (id: number | string) =>
    apiFetch(`/api/v1/admin/documents/${id}`, {
      method: "DELETE",
    }),

  deleteConsultation: (id: number | string) =>
    apiFetch(`/api/v1/admin/consultations/${id}`, {
      method: "DELETE",
    }),

  archiveConsultation: (id: number | string, is_archived: boolean) =>
    apiFetch(`/api/v1/admin/consultations/${id}/archive`, {
      method: "PATCH",
      body: JSON.stringify({ is_archived }),
    }),

  updateConsultationPriority: (id: number | string, priority: string) =>
    apiFetch(`/api/v1/admin/consultations/${id}/priority`, {
      method: "PATCH",
      body: JSON.stringify({ priority }),
    }),
};

// ----------------------------------------------------
// Modul CMS Admin (Admin CMS)
// ----------------------------------------------------
export interface CreateRegulationPayload {
  title: string;
  regulation_type: string;
  file_path?: string;
  file_size?: string;
  category?: string;
  description?: string;
  legal_status?: string;
  replacement_ref?: string;
}

export interface CreateEducationPayload {
  title: string;
  category: string;
  body: string;
  content_type?: "ARTICLE" | "GUIDE" | string;
  file_path?: string;
  image?: string;
  image_url?: string;
  author?: string;
  excerpt?: string;
}

export interface CreateServicePayload {
  service_code: string;
  service_name: string;
  category: string;
  description?: string;
  card_explanation?: string;
  features?: string[];
  is_active?: boolean;
}

export interface CreateCareerPayload {
  position_code: string;
  position_title: string;
  level: string;
  location: string;
  description?: string;
  is_active?: boolean;
}

function assertSuperadminCmsPermission<T = unknown>(): ApiResponse<T> | null {
  const role = getCurrentUserRole();
  if (role && role !== "superadmin") {
    return {
      success: false,
      error: "FORBIDDEN",
      message: "Akses ditolak: Operasi CMS dan lamaran masuk hanya diizinkan untuk peran Superadmin.",
    };
  }
  return null;
}

export const adminCmsApi = {
  updateCompanyProfile: (payload: {
    section_key: string;
    title: string;
    content: string;
  }) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    return apiFetch("/api/v1/admin/cms/company-profiles", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  createService: (payload: CreateServicePayload) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    return apiFetch("/api/v1/admin/cms/services", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateService: (id: number | string, payload: Partial<CreateServicePayload>) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    return apiFetch(`/api/v1/admin/cms/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteService: (id: number | string) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    return apiFetch(`/api/v1/admin/cms/services/${id}`, {
      method: "DELETE",
    });
  },

  createTaxRate: (payload: {
    currency_code: string;
    rate_value: number;
    effective_start_date: string;
    effective_end_date: string;
  }) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    return apiFetch("/api/v1/admin/cms/tax-rates", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  createRegulation: (payload: CreateRegulationPayload | FormData) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    const body = payload instanceof FormData ? payload : JSON.stringify(payload);
    return apiFetch("/api/v1/admin/cms/regulations", {
      method: "POST",
      body,
    });
  },

  updateRegulation: (id: number | string, payload: Partial<CreateRegulationPayload> | FormData) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    const body = payload instanceof FormData ? payload : JSON.stringify(payload);
    return apiFetch(`/api/v1/admin/cms/regulations/${id}`, {
      method: "PUT",
      body,
    });
  },

  deleteRegulation: (id: number | string) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    return apiFetch(`/api/v1/admin/cms/regulations/${id}`, {
      method: "DELETE",
    });
  },

  createEducation: (payload: CreateEducationPayload | FormData) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    const body = payload instanceof FormData ? payload : JSON.stringify(payload);
    return apiFetch("/api/v1/admin/cms/education", {
      method: "POST",
      body,
    });
  },

  updateEducation: (id: number | string, payload: Partial<CreateEducationPayload> | FormData) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    const body = payload instanceof FormData ? payload : JSON.stringify(payload);
    return apiFetch(`/api/v1/admin/cms/education/${id}`, {
      method: "PUT",
      body,
    });
  },

  deleteEducation: (id: number | string) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    return apiFetch(`/api/v1/admin/cms/education/${id}`, {
      method: "DELETE",
    });
  },

  createCareer: (payload: CreateCareerPayload) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    return apiFetch("/api/v1/admin/cms/careers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateCareer: (id: number | string, payload: Partial<CreateCareerPayload>) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    return apiFetch(`/api/v1/admin/cms/careers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteCareer: (id: number | string) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    return apiFetch(`/api/v1/admin/cms/careers/${id}`, {
      method: "DELETE",
    });
  },

  updateTaxRate: (
    id: number | string,
    payload: Partial<{
      currency_code: string;
      rate_value: number;
      effective_start_date: string;
      effective_end_date?: string;
    }>
  ) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    return apiFetch(`/api/v1/admin/cms/tax-rates/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteTaxRate: (id: number | string) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    return apiFetch(`/api/v1/admin/cms/tax-rates/${id}`, {
      method: "DELETE",
    });
  },

  getJobApplications: () => {
    const err = assertSuperadminCmsPermission<JobApplicationItem[]>();
    if (err) return Promise.resolve(err);
    return apiFetch<JobApplicationItem[]>("/api/v1/admin/cms/job-applications");
  },

  deleteJobApplication: (id: number | string) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    return apiFetch(`/api/v1/admin/cms/job-applications/${id}`, {
      method: "DELETE",
    });
  },

  getJobApplicationCvDownloadUrl: (id: number | string) => {
    return apiFetch<{ download_url?: string; file_url?: string; public_url?: string }>(
      `/api/v1/admin/cms/job-applications/${id}/download`
    );
  },

  getFaqs: () => apiFetch<ChatbotFaqItem[]>("/api/v1/admin/cms/faqs"),

  createFaq: (payload: { category: string; question: string; answer_template: string }) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    return apiFetch("/api/v1/admin/cms/faqs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateFaq: (
    id: number | string,
    payload: Partial<{ category: string; question: string; answer_template: string }>
  ) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    return apiFetch(`/api/v1/admin/cms/faqs/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteFaq: (id: number | string) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    return apiFetch(`/api/v1/admin/cms/faqs/${id}`, {
      method: "DELETE",
    });
  },

  updateContactSettings: (payload: {
    whatsapp?: string;
    email?: string;
    address?: string;
    phone?: string;
    settings?: Array<{ setting_key: string; setting_value: string }>;
  }) => {
    const err = assertSuperadminCmsPermission<PublicSiteSettingItem[]>();
    if (err) return Promise.resolve(err);
    return apiFetch<PublicSiteSettingItem[]>("/api/v1/admin/cms/settings/contact", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  getCareerSettings: () => {
    return apiFetch<{
      isOpen: boolean;
      closedTitle: string;
      closedMessage: string;
      closedPeriodNote: string;
    }>("/api/v1/admin/cms/career-settings");
  },

  updateCareerSettings: (payload: {
    isOpen?: boolean;
    closedTitle?: string;
    closedMessage?: string;
    closedPeriodNote?: string;
  }) => {
    const err = assertSuperadminCmsPermission();
    if (err) return Promise.resolve(err);
    return apiFetch("/api/v1/admin/cms/career-settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};

// ----------------------------------------------------
// Modul Publik (Public CMS)
// ----------------------------------------------------
export interface PublicServiceItem {
  id: number;
  service_code: string;
  service_name: string;
  category: string;
  description?: string;
  card_explanation?: string;
  features?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PublicTaxRateItem {
  id: number;
  currency_code: string;
  rate_value: number;
  effective_start_date: string;
  effective_end_date: string;
  created_at?: string;
}

export interface PublicCompanyProfileItem {
  id: number;
  section_key: string;
  title: string;
  content: string;
  updated_at?: string;
}

export interface PublicRegulationItem {
  id: number;
  title: string;
  regulation_type: string;
  file_path: string;
  file_size?: string;
  category?: string;
  description?: string;
  legal_status?: string;
  replacement_ref?: string;
  download_url?: string;
  file_url?: string;
  created_at: string;
}

export interface PublicEducationItem {
  id: number;
  title: string;
  category: string;
  content_type: string;
  body?: string;
  file_path?: string;
  image?: string;
  image_url?: string;
  download_url?: string;
  file_url?: string;
  created_at: string;
}

export interface PublicCareerItem {
  id: number;
  position_code: string;
  position_title: string;
  level: string;
  location: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface JobApplicationItem {
  id: number;
  job_id: number;
  career_id?: number;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  education?: string;
  linkedin?: string;
  cover_letter?: string;
  registration_code?: string;
  cv_file_path: string;
  applied_at: string;
  job?: {
    position_code?: string;
    position_title: string;
    department?: string;
  };
}

export interface ChatbotFaqItem {
  id: number;
  category: string;
  question: string;
  answer_template: string;
  created_at?: string;
}

export interface PublicSiteSettingItem {
  id: number;
  setting_key: string;
  setting_value: string;
  closed_message?: string | null;
  updated_at?: string;
}

export interface ChatbotTreeItem {
  id: number;
  category?: string;
  question: string;
  answer_template?: string;
  answer?: string;
  parent_id?: number | null;
}

export type RegulationItem = PublicRegulationItem;
export type TaxRateItem = PublicTaxRateItem;
export type EducationItem = PublicEducationItem;
export type CareerItem = PublicCareerItem;

export interface ApplyCareerPayload {
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  education?: string;
  linkedin?: string;
  cover_letter?: string;
  registration_code?: string;
  cv_file_path: string;
}

export function parseContactSettings(settings: PublicSiteSettingItem[] = []): {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  whatsapp: string;
  [key: string]: string;
} {
  const corporateEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "consultingzhou@gmail.com";
  const corporateAddress = "MyRepublic Plaza (d/h Green Office Park 6), Wing A, Lantai Dasar Zona 6, Jalan Grand Boulevard, BSD Green Office Park, Desa Sampora, Kecamatan Cisauk, Kabupaten Tangerang, Banten 15345";
  const map: Record<string, string> = {
    companyName: "Zhou Consulting",
    email: corporateEmail,
    phone: "",
    address: corporateAddress,
    whatsapp: process.env.NEXT_PUBLIC_WA_PHONE ? `+${process.env.NEXT_PUBLIC_WA_PHONE}` : "+62 851-2128-6086",
  };

  if (Array.isArray(settings)) {
    settings.forEach((s) => {
      if (!s?.setting_key) return;
      map[s.setting_key] = s.setting_value;
      if (s.setting_key === "company_name") map.companyName = s.setting_value;
      if (s.setting_key === "company_email" || s.setting_key === "contact_email") {
        const val = s.setting_value;
        map.email = (!val || val === "contact@zhouconsulting.com") ? corporateEmail : val;
      }
      if (s.setting_key === "company_phone" || s.setting_key === "contact_phone") {
        map.phone = "";
      }
      if (s.setting_key === "company_address" || s.setting_key === "contact_address") {
        const val = s.setting_value;
        map.address = (!val || val.includes("SCBD") || val.includes("Sudirman") || val.includes("Botanica")) ? corporateAddress : val;
      }
      if (s.setting_key === "cs_whatsapp" || s.setting_key === "contact_whatsapp") {
        const val = s.setting_value;
        map.whatsapp = (!val || val.includes("1234567890") || val.includes("81298765432") || val.includes("9876-5432"))
          ? (process.env.NEXT_PUBLIC_WA_PHONE ? `+${process.env.NEXT_PUBLIC_WA_PHONE}` : "+62 851-2128-6086")
          : val;
      }
    });
  }

  if (!map.email || map.email === "contact@zhouconsulting.com") {
    map.email = corporateEmail;
  }
  if (!map.address || map.address.includes("SCBD") || map.address.includes("Sudirman") || map.address.includes("Botanica")) {
    map.address = corporateAddress;
  }
  if (!map.whatsapp || map.whatsapp.includes("1234567890") || map.whatsapp.includes("81298765432") || map.whatsapp.includes("9876-5432")) {
    map.whatsapp = process.env.NEXT_PUBLIC_WA_PHONE ? `+${process.env.NEXT_PUBLIC_WA_PHONE}` : "+62 851-2128-6086";
  }
  map.phone = "";

  return map as {
    companyName: string;
    email: string;
    phone: string;
    address: string;
    whatsapp: string;
    [key: string]: string;
  };
}

export const publicApi = {
  getCompanyProfiles: () =>
    apiFetch<PublicCompanyProfileItem[]>("/api/v1/public/company-profiles", {
      skipAuth: true,
    }),

  getServices: () =>
    apiFetch<PublicServiceItem[]>("/api/v1/public/services", {
      skipAuth: true,
    }),

  getLatestTaxRates: () =>
    apiFetch<PublicTaxRateItem[]>("/api/v1/public/tax-rates/latest", {
      skipAuth: true,
    }),

  getTaxRates: () =>
    apiFetch<PublicTaxRateItem[]>("/api/v1/public/tax-rates/latest", {
      skipAuth: true,
    }),

  getRegulations: () =>
    apiFetch<PublicRegulationItem[]>("/api/v1/public/regulations", {
      skipAuth: true,
    }),

  getEducation: () =>
    apiFetch<PublicEducationItem[]>("/api/v1/public/education", {
      skipAuth: true,
    }),

  getCareers: () =>
    apiFetch<PublicCareerItem[]>("/api/v1/public/careers", {
      skipAuth: true,
    }),

  applyCareer: (
    jobId: number | string,
    payload: ApplyCareerPayload | FormData
  ) => {
    const body = payload instanceof FormData ? payload : JSON.stringify(payload);

    return apiFetch(`/api/v1/public/careers/${jobId}/apply`, {
      method: "POST",
      body,
      skipAuth: true,
    });
  },

  getContactSettings: () =>
    apiFetch<PublicSiteSettingItem[]>("/api/v1/public/settings/contact", {
      skipAuth: true,
    }),

  submitContact: (payload: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) =>
    apiFetch("/api/v1/public/contact", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    }),

  getChatbotTree: () =>
    apiFetch<ChatbotTreeItem[]>("/api/v1/client/chatbot/tree", {
      skipAuth: true,
    }),

  getRegulationDownloadUrl: (id: number | string) =>
    apiFetch<{
      title?: string;
      file_path?: string;
      download_url?: string;
      public_url?: string;
      expires_in_seconds?: number;
    }>(`/api/v1/public/regulations/${id}/download`, {
      skipAuth: true,
    }),

  getEducationDownloadUrl: (id: number | string) =>
    apiFetch<{
      title?: string;
      file_path?: string;
      download_url?: string;
      public_url?: string;
      expires_in_seconds?: number;
    }>(`/api/v1/public/education/${id}/download`, {
      skipAuth: true,
    }),

  getCareerSettings: () =>
    apiFetch<{
      isOpen: boolean;
      closedTitle: string;
      closedMessage: string;
      closedPeriodNote: string;
    }>("/api/v1/public/career-settings", {
      skipAuth: true,
    }),
};

// ----------------------------------------------------
// Modul Superadmin
// ----------------------------------------------------
export interface AdminUserItem {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "SUPERADMIN";
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuditLogItem {
  id: number;
  admin_id: number;
  client_id?: number;
  project_id?: number;
  action: string;
  status_before?: string;
  status_after?: string;
  file_name?: string;
  description: string;
  created_at: string;
}

export const superadminApi = {
  getAdmins: () => apiFetch<AdminUserItem[]>("/api/v1/superadmin/admins"),

  createAdmin: (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: "ADMIN" | "SUPERADMIN" | string;
  }) => {
    const formattedPayload = {
      ...payload,
      role: payload.role
        ? payload.role.toUpperCase() === "SUPERADMIN"
          ? "SUPERADMIN"
          : "ADMIN"
        : "ADMIN",
    };
    return apiFetch<AdminUserItem>("/api/v1/superadmin/admins", {
      method: "POST",
      body: JSON.stringify(formattedPayload),
    });
  },

  deactivateAdmin: (id: number | string) =>
    apiFetch(`/api/v1/superadmin/admins/${id}/deactivate`, {
      method: "POST",
    }),

  reactivateAdmin: (id: number | string) =>
    apiFetch(`/api/v1/superadmin/admins/${id}/reactivate`, {
      method: "POST",
    }),

  updateAdmin: (
    id: number | string,
    payload: {
      name?: string;
      email?: string;
      password?: string;
      phone?: string;
      role?: "ADMIN" | "SUPERADMIN" | string;
    }
  ) => {
    const formattedPayload = {
      ...payload,
      ...(payload.role
        ? {
          role:
            payload.role.toUpperCase() === "SUPERADMIN"
              ? "SUPERADMIN"
              : "ADMIN",
        }
        : {}),
    };
    return apiFetch<AdminUserItem>(`/api/v1/superadmin/admins/${id}`, {
      method: "PUT",
      body: JSON.stringify(formattedPayload),
    });
  },

  deleteAdmin: (id: number | string) =>
    apiFetch(`/api/v1/superadmin/admins/${id}`, {
      method: "DELETE",
    }),

  getAuditLogs: () => apiFetch<AuditLogItem[]>("/api/v1/superadmin/audit-logs"),

  exportAuditLogs: () =>
    apiFetch<
      | Array<{
        id?: number;
        timestamp?: string;
        admin?: string;
        klien?: string;
        tiket?: string;
        status_sebelum?: string;
        status_sesudah?: string;
        file?: string;
        deskripsi?: string;
      }>
      | { export_url: string }
    >("/api/v1/superadmin/audit-logs/export"),

  clearAuditLogs: () =>
    apiFetch<{ deleted_count: number }>("/api/v1/superadmin/audit-logs", {
      method: "DELETE",
    }),

  deleteAuditLog: (id: number | string) =>
    apiFetch(`/api/v1/superadmin/audit-logs/${id}`, {
      method: "DELETE",
    }),
};

// ----------------------------------------------------
// Modul Sistem & Infrastruktur
// ----------------------------------------------------
export interface HealthStatus {
  status: string;
  timestamp: string;
  services: {
    database: string;
    redis: string;
  };
  message?: string;
}

export const systemApi = {
  getHealth: () =>
    apiFetch<HealthStatus>("/api/health", {
      skipAuth: true,
    }),
};
