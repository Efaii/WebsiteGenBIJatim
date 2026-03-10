import api from "@/lib/api";
import { BPHMember, Document, EventItem, KorkomData } from "@/app/types";

export const getKorkomData = async (): Promise<KorkomData> => {
    try {
        const response = await api.get<KorkomData>("/public/profile");
        return response.data;
    } catch (error) {
        // Silently fallback without polluting SSR compilation logs.
        return {
            name: "GenBI Koordinator Komisariat Jawa Timur",
            university: "Jawa Timur",
            bph: [],
            divisions: [],
            documents: []
        };
    }
}

export const getSharedEvents = async (): Promise<EventItem[]> => {
    try {
        const response = await api.get<EventItem[]>("/public/events");
        return response.data;
    } catch (error) {
        // Silently fallback without polluting SSR compilation logs.
        return [];
    }
}
