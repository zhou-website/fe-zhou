/**
 * Zhou Consulting - RESTful API Client Integration
 * Connected to live backend at http://43.173.2.162 (OpenAPI 3.1.0)
 * Handles JWT authentication, automatic token injection, error handling, and type-safe endpoints.
 */

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://43.173.2.162"
).replace(/\/+$/, "").replace(/\/api\/?$/, "");

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

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (err) {
    console.error("Gagal menyimpan token ke localStorage:", err);
  }
}

export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (err) {
    console.error("Gagal menghapus token dari localStorage:", err);
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, skipAuth = false, headers = {}, ...rest } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

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

  try {
    const response = await fetch(url, {
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
    const message = err instanceof Error ? err.message : "Gagal terhubung ke server backend";
    console.error(`API Error on [${url}]:`, err);
    return {
      success: false,
      message,
      error: "NETWORK_ERROR",
    };
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

  google: (token: string) =>
    apiFetch<LoginResponseData>("/api/v1/auth/google", {
      method: "POST",
      body: JSON.stringify({ token }),
      skipAuth: true,
    }),

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
}

export interface ClientDocumentItem {
  id: number;
  project_id: number;
  file_name: string;
  file_path: string;
  file_size?: string;
  file_type?: string;
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

  escalateChatbot: (payload: {
    message: string;
    contact_phone?: string;
    category?: string;
  }) =>
    apiFetch("/api/v1/client/chatbot/escalate", {
      method: "POST",
      body: JSON.stringify(payload),
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

export const adminApi = {
  getDashboardOverview: () => apiFetch("/api/v1/admin/dashboard/overview"),

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

  updateConsultationStatus: (id: number | string, status: string) =>
    apiFetch(`/api/v1/admin/consultations/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
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

  getAllDocuments: () => apiFetch<ClientDocumentItem[]>("/api/v1/admin/documents"),
};

// ----------------------------------------------------
// Modul CMS Admin (Admin CMS)
// ----------------------------------------------------
export const adminCmsApi = {
  updateCompanyProfile: (payload: {
    section_key: string;
    title: string;
    content: string;
  }) =>
    apiFetch("/api/v1/admin/cms/company-profiles", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  createService: (payload: {
    service_code: string;
    service_name: string;
    category: string;
    description?: string;
    is_active?: boolean;
  }) =>
    apiFetch("/api/v1/admin/cms/services", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createTaxRate: (payload: {
    currency_code: string;
    rate_value: number;
    effective_start_date: string;
    effective_end_date: string;
  }) =>
    apiFetch("/api/v1/admin/cms/tax-rates", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getJobApplications: () => apiFetch("/api/v1/admin/cms/job-applications"),
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
  is_active?: boolean;
}

export interface PublicTaxRateItem {
  id: number;
  currency_code: string;
  rate_value: number;
  effective_start_date: string;
  effective_end_date: string;
}

export interface PublicCompanyProfileItem {
  id: number;
  section_key: string;
  title: string;
  content: string;
}

export interface PublicRegulationItem {
  id: number;
  title: string;
  regulation_type: string;
  file_path: string;
  file_size?: string;
  created_at: string;
}

export interface PublicEducationItem {
  id: number;
  title: string;
  category: string;
  content_type: string;
  body?: string;
  file_path?: string;
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

  applyCareer: (jobId: number | string, formData: FormData) =>
    apiFetch(`/api/v1/public/careers/${jobId}/apply`, {
      method: "POST",
      body: formData,
      skipAuth: true,
    }),

  getContactSettings: () =>
    apiFetch("/api/v1/public/settings/contact", {
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
    role?: "ADMIN" | "SUPERADMIN";
  }) =>
    apiFetch<AdminUserItem>("/api/v1/superadmin/admins", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deactivateAdmin: (id: number | string) =>
    apiFetch(`/api/v1/superadmin/admins/${id}/deactivate`, {
      method: "POST",
    }),

  deleteAdmin: (id: number | string) =>
    apiFetch(`/api/v1/superadmin/admins/${id}`, {
      method: "DELETE",
    }),

  getAuditLogs: () => apiFetch<AuditLogItem[]>("/api/v1/superadmin/audit-logs"),

  exportAuditLogs: () =>
    apiFetch<{ export_url: string }>("/api/v1/superadmin/audit-logs/export"),
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
