import api, { API_URL } from "@/lib/api";

export type CmsProgramArtifact = {
  id: string;
  kind: string;
  originalFilename: string;
  mimeType: string;
  byteSize: number;
};

export type CmsProgramPublicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED"
  | "ARCHIVED";

export type CmsProgramExecutionStatus =
  | "PLANNED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

export type CmsProgramItem = {
  id: string;
  namaProker: string;
  deskripsiProker: string;
  divisi: string;
  formatPelaksanaan: string;
  objectives: string[] | null;
  startDate: string | null;
  endDate: string | null;
  publicationStatus: CmsProgramPublicationStatus;
  executionStatus: CmsProgramExecutionStatus;
  rejectionReason: string | null;
  authorAccountId: string | null;
  updatedAt: string;
  artifacts: CmsProgramArtifact[];
  commissariat?: { name: string; slug: string };
};

export type ProgramWritePayload = {
  title: string;
  description: string;
  format: string;
  objectives: string[];
  startDate: string;
  endDate?: string;
};

const pickData = <T>(data: T | undefined, message: string): T => {
  if (data === undefined) throw new Error(message);
  return data;
};

/** Buat Program Kerja baru (status awal DRAFT, scope dari akun). */
export const createCmsProgram = async (
  payload: ProgramWritePayload,
): Promise<CmsProgramItem> => {
  const response = await api.post<{ data?: CmsProgramItem }>(
    "/v1/programs",
    payload,
    { withCredentials: true },
  );
  return pickData(response.data.data, "Respons buat Program Kerja kosong.");
};

/** Simpan perubahan Program Kerja draft atau hasil penolakan. */
export const updateCmsProgram = async (
  id: string,
  payload: ProgramWritePayload,
): Promise<CmsProgramItem> => {
  const response = await api.patch<{ data?: CmsProgramItem }>(
    `/v1/programs/${id}`,
    payload,
    { withCredentials: true },
  );
  return pickData(response.data.data, "Respons simpan Program Kerja kosong.");
};

/** Jalankan satu langkah transisi status publikasi Program Kerja. */
export const transitionCmsProgram = async (
  id: string,
  status: CmsProgramPublicationStatus,
  rejectionReason?: string,
): Promise<void> => {
  await api.post(
    `/v1/programs/${id}/transition`,
    { status, ...(rejectionReason ? { rejectionReason } : {}) },
    { withCredentials: true },
  );
};

/** Unggah berkas Program Kerja (proposal saat draft, LPJ setelah disetujui). */
export const uploadCmsProgramArtifact = async (
  id: string,
  kind: "proposal" | "lpj",
  file: File,
): Promise<CmsProgramArtifact> => {
  const form = new FormData();
  form.append("kind", kind);
  form.append("file", file);
  const response = await api.post<{ data?: CmsProgramArtifact }>(
    `/v1/programs/${id}/artifacts`,
    form,
    {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return pickData(response.data.data, "Respons unggah berkas kosong.");
};

/** URL unduhan berkas; hanya berlaku setelah Program Kerja disetujui. */
export const cmsProgramArtifactUrl = (programId: string, artifactId: string) =>
  `${API_URL}/v1/programs/${programId}/artifacts/${artifactId}`;
