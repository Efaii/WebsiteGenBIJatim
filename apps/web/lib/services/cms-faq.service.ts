import api from "@/lib/api";

export type CmsFaqItem = {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  updatedAt: string;
};

export type CmsFaqInput = {
  question: string;
  answer: string;
  isActive: boolean;
};

const pickData = <T>(data: T | undefined, message: string): T => {
  if (data === undefined) throw new Error(message);
  return data;
};

/** Daftar seluruh FAQ (termasuk nonaktif) untuk pengelolaan CMS. */
export const listCmsFaqs = async (): Promise<CmsFaqItem[]> => {
  const response = await api.get<{ data?: CmsFaqItem[] }>("/v1/faqs/cms", {
    withCredentials: true,
  });
  return Array.isArray(response.data.data) ? response.data.data : [];
};

export const createFaq = async (input: CmsFaqInput): Promise<CmsFaqItem> => {
  const response = await api.post<{ data?: CmsFaqItem }>("/v1/faqs", input, {
    withCredentials: true,
  });
  return pickData(response.data.data, "Respons buat FAQ tidak berisi data.");
};

export const updateFaq = async (
  id: string,
  input: Partial<CmsFaqInput>,
): Promise<CmsFaqItem> => {
  const response = await api.patch<{ data?: CmsFaqItem }>(
    `/v1/faqs/${id}`,
    input,
    { withCredentials: true },
  );
  return pickData(response.data.data, "Respons simpan FAQ tidak berisi data.");
};

export const deleteFaq = async (id: string): Promise<void> => {
  await api.delete(`/v1/faqs/${id}`, { withCredentials: true });
};

/** Urutkan ulang FAQ; index array menjadi urutan tampil. */
export const orderFaqs = async (ids: string[]): Promise<CmsFaqItem[]> => {
  const response = await api.post<{ data?: CmsFaqItem[] }>(
    "/v1/faqs/order",
    { ids },
    { withCredentials: true },
  );
  return Array.isArray(response.data.data) ? response.data.data : [];
};
