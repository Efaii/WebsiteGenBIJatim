import api from "@/lib/api";

/**
 * @service FaqService (Frontend)
 * @description Admin FAQ CRUD via the backend API.
 */

export interface AdminFAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

export const getFaqs = async (): Promise<AdminFAQItem[]> => {
  const response = await api.get<AdminFAQItem[]>("/faqs", {
    headers: { "Cache-Control": "no-store" },
  });
  return response.data;
};

export const createFaq = async (
  data: Partial<AdminFAQItem>
): Promise<AdminFAQItem> => {
  const response = await api.post<AdminFAQItem>("/faqs", data);
  return response.data;
};

export const updateFaq = async (
  id: string,
  data: Partial<AdminFAQItem>
): Promise<AdminFAQItem> => {
  const response = await api.put<AdminFAQItem>(`/faqs/${id}`, data);
  return response.data;
};

export const deleteFaq = async (id: string): Promise<void> => {
  await api.delete(`/faqs/${id}`);
};
