import api from "@/lib/api";
export interface Document {
  id: string;
  title: string;
  type: string;
  fileType: string;
  size: string;
  date: string;
  url?: string | null;
  category?: string | null;
  period: string | null;
  isPublic: boolean;
  organizationProfileId: string;
  organization?: { name: string };
  createdAt: string;
  updatedAt: string;
}

/**
 * @service DocumentService (Frontend)
 * @description Provides methods for interacting with the document API.
 */
export const getAdminDocuments = async (organizationProfileId?: string): Promise<Document[]> => {
  const params = organizationProfileId ? { organizationProfileId } : {};
  const response = await api.get("/admin/docs", { params });
  return response.data.data;
};

export const createDocument = async (formData: FormData): Promise<Document> => {
  const response = await api.post("/admin/docs", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data.data;
};

export const updateDocument = async (id: string, formData: FormData): Promise<Document> => {
  const response = await api.put(`/admin/docs/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data.data;
};

export const deleteDocument = async (id: string): Promise<void> => {
  await api.delete(`/admin/docs/${id}`);
};

export const getPublicDocuments = async (organizationProfileId?: string): Promise<Document[]> => {
  const params = organizationProfileId ? { organizationProfileId } : {};
  const response = await api.get("/public/docs", { params });
  return response.data.data;
};
