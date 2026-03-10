import api from "@/lib/api";

/**
 * @service TestimonialService (Frontend)
 * @description Admin testimonial CRUD via the backend API.
 */

export interface AdminTestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
  image: string;
}

export const getTestimonials = async (): Promise<AdminTestimonialItem[]> => {
  const response = await api.get<AdminTestimonialItem[]>("/testimonials", {
    headers: { "Cache-Control": "no-store" },
  });
  return response.data;
};

export const createTestimonial = async (
  formData: FormData
): Promise<AdminTestimonialItem> => {
  const response = await api.post<AdminTestimonialItem>(
    "/testimonials",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

export const updateTestimonial = async (
  id: string,
  formData: FormData
): Promise<AdminTestimonialItem> => {
  const response = await api.put<AdminTestimonialItem>(
    `/testimonials/${id}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

export const deleteTestimonial = async (id: string): Promise<void> => {
  await api.delete(`/testimonials/${id}`);
};
