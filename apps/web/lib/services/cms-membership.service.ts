import api from "@/lib/api";

export type CmsAwardeePublicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED"
  | "ARCHIVED";

export type CmsAwardeeMembershipStatus = "ACTIVE" | "INACTIVE";

export type CmsAwardee = {
  id: string;
  name: string;
  position: string;
  studyProgram: string;
  divisionId: string | null;
  division?: { name: string } | null;
  membershipStatus: CmsAwardeeMembershipStatus;
  publicationStatus: CmsAwardeePublicationStatus;
  rejectionReason: string | null;
  updatedAt: string;
  period?: { label: string } | null;
  commissariat?: { name: string } | null;
};

export type CmsAwardeeOptions = {
  period: { id: string; label: string } | null;
  commissariat: { id: string; name: string } | null;
  divisions: Array<{ id: string; name: string }>;
};

export type AwardeeWritePayload = {
  name: string;
  position: string;
  studyProgram: string;
  divisionId?: string | null;
  membershipStatus?: CmsAwardeeMembershipStatus;
};

const pickData = <T>(data: T | undefined, message: string): T => {
  if (data === undefined) throw new Error(message);
  return data;
};

/** Tambah entri Awardee baru (status awal DRAFT, scope dari akun). */
export const createCmsAwardee = async (
  payload: AwardeeWritePayload,
): Promise<CmsAwardee> => {
  const response = await api.post<{ data?: CmsAwardee }>(
    "/v1/memberships/cms",
    payload,
    { withCredentials: true },
  );
  return pickData(response.data.data, "Respons tambah Awardee kosong.");
};

/** Ubah entri Awardee; perubahan menjadi DRAFT sampai diajukan disetujui. */
export const updateCmsAwardee = async (
  id: string,
  payload: AwardeeWritePayload,
): Promise<CmsAwardee> => {
  const response = await api.patch<{ data?: CmsAwardee }>(
    `/v1/memberships/cms/${id}`,
    payload,
    { withCredentials: true },
  );
  return pickData(response.data.data, "Respons simpan Awardee kosong.");
};

/** Ajukan seluruh perubahan (DRAFT/Ditolak) pada scope akun. */
export const submitCmsAwardeeChanges = async (): Promise<number> => {
  const response = await api.post<{ data?: { submitted?: number } }>(
    "/v1/memberships/cms/submit",
    {},
    { withCredentials: true },
  );
  return response.data.data?.submitted ?? 0;
};
