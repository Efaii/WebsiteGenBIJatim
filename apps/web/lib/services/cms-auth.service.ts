import api from "@/lib/api";

export type CmsLoginResult = {
  accountId: string;
  role: "ADMIN_GLOBAL" | "SEKRETARIS_UMUM" | "SEKRETARIS_DIVISI";
  mustChangePassword: boolean;
};

/**
 * Login CMS kanonik.
 *
 * Sesi disimpan sebagai cookie httpOnly `genbi_cms_session` (diatur API);
 * tidak ada token yang ditulis ke localStorage.
 */
export const loginCms = async (
  username: string,
  password: string,
): Promise<CmsLoginResult> => {
  const response = await api.post<{ data?: CmsLoginResult }>(
    "/v1/auth/login",
    { username, password },
    { withCredentials: true },
  );
  if (!response.data.data)
    throw new Error("Respons login tidak berisi data sesi.");
  return response.data.data;
};

export const logoutCms = async (): Promise<void> => {
  await api.post("/v1/auth/logout", null, { withCredentials: true });
};

/**
 * Ganti password mandiri untuk akun yang sedang masuk.
 *
 * Dipakai alur wajib ganti password saat login pertama akun operator;
 * setelah berhasil akun dapat memakai area admin seperti biasa.
 */
export const changeCmsPassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  await api.post(
    "/v1/auth/change-password",
    { currentPassword, newPassword },
    { withCredentials: true },
  );
};
