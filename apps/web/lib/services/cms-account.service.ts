import api from "@/lib/api";

export type CmsOperatorRole =
  | "ADMIN_GLOBAL"
  | "SEKRETARIS_UMUM"
  | "SEKRETARIS_DIVISI";

export type CmsOperatorStatus = "ACTIVE" | "DISABLED";

export type CmsOperatorAssignment = {
  commissariatId: string | null;
  periodId: string | null;
  divisionId: string | null;
  commissariat: string | null;
  period: string | null;
  division: string | null;
};

export type CmsOperatorAccount = {
  id: string;
  username: string;
  name: string;
  role: CmsOperatorRole;
  status: CmsOperatorStatus;
  mustChangePassword: boolean;
  createdAt: string;
  assignment: CmsOperatorAssignment | null;
};

export type CmsOperatorCreatePayload = {
  username: string;
  name: string;
  password: string;
  role: CmsOperatorRole;
  commissariatId?: string | null;
  periodId?: string | null;
  divisionId?: string | null;
};

/** Daftar akun operator untuk admin global. */
export const listCmsAccounts = async (): Promise<CmsOperatorAccount[]> => {
  const response = await api.get<{ data?: CmsOperatorAccount[] }>(
    "/v1/cms-accounts",
    { withCredentials: true },
  );
  return response.data.data ?? [];
};

/** Buat akun operator baru dengan peran dan scope. */
export const createCmsAccount = async (
  payload: CmsOperatorCreatePayload,
): Promise<void> => {
  await api.post("/v1/cms-accounts", payload, { withCredentials: true });
};

/** Reset password akun; akun wajib menggantinya saat masuk berikutnya. */
export const resetCmsAccountPassword = async (
  id: string,
  newPassword: string,
): Promise<void> => {
  await api.post(
    `/v1/cms-accounts/${id}/reset-password`,
    { newPassword },
    { withCredentials: true },
  );
};

/** Aktifkan atau nonaktifkan akun operator. */
export const setCmsAccountStatus = async (
  id: string,
  status: CmsOperatorStatus,
): Promise<void> => {
  await api.post(
    `/v1/cms-accounts/${id}/status`,
    { status },
    { withCredentials: true },
  );
};
