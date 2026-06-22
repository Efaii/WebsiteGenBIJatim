import api from "@/lib/api";

export interface Awardee {
  id: string;
  name: string;
  university: string;
  major: string;
  batch: string;
  period: string | null;
  organizationProfileId: string;
  createdAt: string;
  updatedAt: string;
}

export const getAllAwardees = async (orgId?: string): Promise<Awardee[]> => {
  try {
    const response = await api.get<{ status: string; data: Awardee[] }>("/awardees", {
      params: { orgId }
    });
    return response.data.data;
  } catch (error) {
    console.error("[Awardee Service] Error fetching awardees:", error);
    throw error;
  }
};

export const createAwardee = async (data: Partial<Awardee>) => {
  try {
    const response = await api.post("/awardees", data);
    return response.data;
  } catch (error) {
    console.error("[Awardee Service] Error creating awardee:", error);
    throw error;
  }
};

export const updateAwardee = async (id: string, data: Partial<Awardee>) => {
  try {
    const response = await api.put(`/awardees/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("[Awardee Service] Error updating awardee:", error);
    throw error;
  }
};

export const deleteAwardee = async (id: string) => {
  try {
    const response = await api.delete(`/awardees/${id}`);
    return response.data;
  } catch (error) {
    console.error("[Awardee Service] Error deleting awardee:", error);
    throw error;
  }
};
