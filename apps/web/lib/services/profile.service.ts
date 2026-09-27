import api from "@/lib/api";
import { KorkomData } from "@/app/types";

export const getKorkomData = async (): Promise<KorkomData> => {
    try {
        const response = await api.get<KorkomData>("/profile");
        return response.data;
    } catch (error) {
        console.error("Error fetching profile data:", error);
        // Return default/fallback data if needed, or rethrow
        return {
            name: "GenBI Koordinator Komisariat Jawa Timur",
            university: "Jawa Timur",
            bph: [],
            divisions: [],
            documents: []
        };
    }
}
