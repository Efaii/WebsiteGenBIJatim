import api from "@/lib/api";
import { Document } from "@/app/types";

export const getAllDocuments = async (): Promise<Document[]> => {
    try {
        const response = await api.get<Document[]>("/docs");
        return response.data;
    } catch (error) {
        console.error("Error fetching documents:", error);
        return [];
    }
}
