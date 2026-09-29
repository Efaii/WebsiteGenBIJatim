// CMS-only service (permukaan CMS).
//
// Permukaan publik memakai `@/lib/services/news.service.ts` yang membaca
// `/api/v1/news`. File ini memakai endpoint legacy `/news` dan hanya boleh
// dipakai halaman `/admin/*`. Jangan impor dari komponen publik.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export interface AdminNewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  author: string;
  featuredOrder?: number | null;
  createdAt: string;
  updatedAt: string;
}

const getHeaders = (isFormData = false) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: any = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return headers;
};

// Admin Fetch (Protected)
export const getAdminNews = async (): Promise<AdminNewsItem[]> => {
  const response = await fetch(`${API_BASE}/news`, {
    headers: getHeaders(),
    cache: 'no-store'
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
    throw new Error('Failed to fetch News');
  }
  return response.json();
};

export const createNews = async (formData: FormData): Promise<AdminNewsItem> => {
  const response = await fetch(`${API_BASE}/news`, {
    method: 'POST',
    headers: getHeaders(true),
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to create News');
  return response.json();
};

export const updateNews = async (id: string, formData: FormData): Promise<AdminNewsItem> => {
  const response = await fetch(`${API_BASE}/news/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to update News');
  return response.json();
};

/**
 * Mengatur slot beranda berita (1-3) atau melepasnya (null).
 * Satu slot hanya bisa diisi satu berita; slot yang sama dilepas otomatis.
 */
export const setAdminNewsFeaturedOrder = async (
  id: string,
  featuredOrder: number | null,
): Promise<AdminNewsItem> => {
  const response = await fetch(`${API_BASE}/news/${id}/featured`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ featuredOrder }),
  });
  if (!response.ok) throw new Error('Failed to set featured order');
  return response.json();
};

export const deleteNews = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/news/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete News');
};
