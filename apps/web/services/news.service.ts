// apps/web/services/news.service.ts
export interface AdminNewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  author: string;
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
  const response = await fetch('http://localhost:5000/api/news', { 
    headers: getHeaders(),
    cache: 'no-store'
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
    throw new Error('Failed to fetch News');
  }
  return response.json();
};

// Public Fetch (Latest 4)
export const getLatestNews = async (): Promise<AdminNewsItem[]> => {
  const response = await fetch('http://localhost:5000/api/news/latest', {
    next: { revalidate: 60 } // Next.js ISR: Revalidate every 60 seconds
  });
  if (!response.ok) throw new Error('Failed to fetch Latest News');
  return response.json();
};

export const createNews = async (formData: FormData): Promise<AdminNewsItem> => {
  const response = await fetch('http://localhost:5000/api/news', {
    method: 'POST',
    headers: getHeaders(true),
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to create News');
  return response.json();
};

export const updateNews = async (id: string, formData: FormData): Promise<AdminNewsItem> => {
  const response = await fetch(`http://localhost:5000/api/news/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to update News');
  return response.json();
};

export const deleteNews = async (id: string): Promise<void> => {
  const response = await fetch(`http://localhost:5000/api/news/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete News');
};
