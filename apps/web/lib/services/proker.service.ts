import api from "@/lib/api";
import { Proker } from "@repo/types";

export type { Proker };
export type ProkerData = Proker;

/**
 * @service ProkerService (Frontend)
 * @description Work Program CRUD via the backend API.
 */

export const getPublicProkers = async (params?: { orgId?: string, page?: number, limit?: number }): Promise<{ prokers: Proker[], pagination: any }> => {
  const response = await api.get<{ status: string; data: Proker[]; pagination: any }>("/proker", { params });
  return { prokers: response.data.data, pagination: response.data.pagination };
};

export const getAdminProkers = async (params?: { orgId?: string, page?: number, limit?: number }): Promise<{ prokers: Proker[], pagination: any }> => {
  const response = await api.get<{ status: string; data: Proker[]; pagination: any }>("/proker/admin", { params });
  return { prokers: response.data.data, pagination: response.data.pagination };
};

export const createProker = async (data: any): Promise<Proker> => {
  const isFormData = data instanceof FormData;
  const response = await api.post<{ status: string; data: Proker }>("/proker", data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data.data;
};

export const updateProker = async (id: string, data: any): Promise<Proker> => {
  const isFormData = data instanceof FormData;
  const response = await api.put<{ status: string; data: Proker }>(`/proker/${id}`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data.data;
};

export const getProkerById = async (id: string): Promise<Proker> => {
  const response = await api.get<{ status: string; data: Proker }>(`/proker/${id}`);
  return response.data.data;
};

export const deleteProker = async (id: string): Promise<void> => {
  await api.delete(`/proker/${id}`);
};
