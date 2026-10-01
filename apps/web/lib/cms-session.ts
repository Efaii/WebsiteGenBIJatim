import { cookies } from "next/headers";
import api from "@/lib/api";

export type CmsSessionInfo = {
  accountId: string;
  username: string | null;
  displayName: string | null;
  role: "ADMIN_GLOBAL" | "SEKRETARIS_UMUM" | "SEKRETARIS_DIVISI";
  mustChangePassword: boolean;
  commissariatName: string | null;
};

/**
 * Sesi CMS kanonik.
 *
 * Cookie `genbi_cms_session` milik browser diteruskan ke API
 * (`GET /api/v1/auth/me`) untuk diverifikasi; web tidak pernah menjadi sumber
 * kebenaran sesi. `null` berarti tidak ada sesi yang valid (bisa karena cookie
 * belum ada, kedaluwarsa, dicabut, atau akun dinonaktifkan).
 */
export const readCmsSession = async (): Promise<CmsSessionInfo | null> => {
  const store = await cookies();
  const token = store.get("genbi_cms_session")?.value;
  if (!token) return null;

  try {
    const response = await api.get<{ data?: CmsSessionInfo }>("/v1/auth/me", {
      headers: { cookie: `genbi_cms_session=${token}` },
    });
    return response.data.data ?? null;
  } catch {
    return null;
  }
};
