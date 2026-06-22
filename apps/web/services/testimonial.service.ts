export interface AdminTestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
  image: string;
}

const getHeaders = (isFormData = false) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: any = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return headers;
};

export const getTestimonials = async (): Promise<AdminTestimonialItem[]> => {
  const response = await fetch('http://localhost:5000/api/testimonials', { 
    headers: getHeaders(),
    cache: 'no-store'
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
    throw new Error('Failed to fetch Testimonials');
  }
  return response.json();
};

export const createTestimonial = async (formData: FormData): Promise<AdminTestimonialItem> => {
  const response = await fetch('http://localhost:5000/api/testimonials', {
    method: 'POST',
    headers: getHeaders(true),
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to create Testimonial');
  return response.json();
};

export const updateTestimonial = async (id: string, formData: FormData): Promise<AdminTestimonialItem> => {
  const response = await fetch(`http://localhost:5000/api/testimonials/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to update Testimonial');
  return response.json();
};

export const deleteTestimonial = async (id: string): Promise<void> => {
  const response = await fetch(`http://localhost:5000/api/testimonials/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete Testimonial');
};
