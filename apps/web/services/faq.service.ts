export interface AdminFAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const getFaqs = async (): Promise<AdminFAQItem[]> => {
  const response = await fetch('http://localhost:5000/api/faqs', { 
    headers: getHeaders(),
    cache: 'no-store'
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
    throw new Error('Failed to fetch FAQs');
  }
  return response.json();
};

export const createFaq = async (data: Partial<AdminFAQItem>): Promise<AdminFAQItem> => {
  const response = await fetch('http://localhost:5000/api/faqs', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create FAQ');
  return response.json();
};

export const updateFaq = async (id: string, data: Partial<AdminFAQItem>): Promise<AdminFAQItem> => {
  const response = await fetch(`http://localhost:5000/api/faqs/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update FAQ');
  return response.json();
};

export const deleteFaq = async (id: string): Promise<void> => {
  const response = await fetch(`http://localhost:5000/api/faqs/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete FAQ');
};
