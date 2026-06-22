import api from "@/lib/api";
import { Member, Document, EventItem, KorkomData } from "@/app/types";

export const getKorkomData = async (id?: string): Promise<KorkomData> => {
    try {
        const url = id ? `/public/profile?id=${id}` : "/public/profile";
        const response = await api.get<{ status: string; data: KorkomData }>(url);
        return response.data.data;
    } catch (error) {
        console.error("[Profile Service] API Error fetching profile data:", error);
        // Graceful Fallback
        return {
            id: 'main-profile',
            type: 'KOORDINATOR',
            slug: null,
            name: "GenBI Koordinator Komisariat Jawa Timur",
            university: "Jawa Timur",
            description: "GenBI Jawa Timur...",
            vision: "",
            missions: [],
            socials: {},
            logo: null,
            univLogo: null,
            coverImage: null,
            bph: [],
            divisions: [],
            documents: [],
            proker: [],
            updatedAt: new Date(),
            createdAt: new Date()
        } as KorkomData;
    }
}

export const getSharedEvents = async (): Promise<EventItem[]> => {
    try {
        const response = await api.get<{ status: string; data: EventItem[] }>("/public/events");
        return response.data.data;
    } catch (error) {
        console.error("[Profile Service] API Error fetching shared events:", error);
        return [];
    }
}

export const updateProfile = async (data: Partial<KorkomData>) => {
    try {
        const response = await api.patch("/profile", data);
        return response.data;
    } catch (error) {
        console.error("[Profile Service] API Error updating profile:", error);
        throw error;
    }
}

export const createMission = async (data: any, organizationProfileId?: string) => {
    try {
        const response = await api.post("/profile/missions", { ...data, organizationProfileId });
        return response.data;
    } catch (error) {
        console.error("[Profile Service] API Error creating mission:", error);
        throw error;
    }
}

export const updateMission = async (id: string, data: any, organizationProfileId?: string) => {
    try {
        const url = organizationProfileId ? `/profile/missions/${id}?organizationProfileId=${organizationProfileId}` : `/profile/missions/${id}`;
        const response = await api.put(url, data);
        return response.data;
    } catch (error) {
        console.error("[Profile Service] API Error updating mission:", error);
        throw error;
    }
}

export const deleteMission = async (id: string, organizationProfileId?: string) => {
    try {
        const url = organizationProfileId ? `/profile/missions/${id}?organizationProfileId=${organizationProfileId}` : `/profile/missions/${id}`;
        const response = await api.delete(url);
        return response.data;
    } catch (error) {
        console.error("[Profile Service] API Error deleting mission:", error);
        throw error;
    }
}

// Division CRUD
export const getAllDivisions = async (organizationProfileId?: string) => {
    try {
        const url = organizationProfileId ? `/profile/divisions?organizationProfileId=${organizationProfileId}` : "/profile/divisions";
        const response = await api.get(url);
        return response.data.data;
    } catch (error) {
        throw error;
    }
}

export const createDivision = async (data: any, organizationProfileId?: string) => {
    try {
        const response = await api.post("/profile/divisions", { ...data, organizationProfileId });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const updateDivision = async (id: string, data: any, organizationProfileId?: string) => {
    try {
        const url = organizationProfileId ? `/profile/divisions/${id}?organizationProfileId=${organizationProfileId}` : `/profile/divisions/${id}`;
        const response = await api.put(url, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteDivision = async (id: string, organizationProfileId?: string) => {
    try {
        const url = organizationProfileId ? `/profile/divisions/${id}?organizationProfileId=${organizationProfileId}` : `/profile/divisions/${id}`;
        const response = await api.delete(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Member CRUD
export const createMember = async (data: any) => {
    try {
        const response = await api.post("/profile/members", data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const updateMember = async (id: string, data: any) => {
    try {
        const response = await api.put(`/profile/members/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteMember = async (id: string) => {
    try {
        const response = await api.delete(`/profile/members/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getAllProfiles = async () => {
    try {
        const response = await api.get<{ status: string; data: any[] }>("/public/profile/all");
        return response.data.data;
    } catch (error) {
        throw error;
    }
}

export const createProfile = async (data: any) => {
    try {
        const response = await api.post("/profile", data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteProfile = async (id: string) => {
    try {
        const response = await api.delete(`/profile/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
