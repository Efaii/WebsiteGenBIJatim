import { cookies } from "next/headers";
import api from "@/lib/api";

/**
 * GET ke API kanonik dari server component CMS.
 *
 * Web tidak memegang sesi sendiri: cookie `genbi_cms_session` milik browser
 * diteruskan ke API. `null` berarti tidak ada sesi / permintaan gagal supaya
 * halaman menampilkan state kosong dengan jujur, bukan data palsu.
 */
export const cmsApiGet = async <T>(path: string): Promise<T | null> => {
  const store = await cookies();
  const token = store.get("genbi_cms_session")?.value;
  if (!token) return null;

  try {
    const response = await api.get<{ data?: T }>(path, {
      headers: { cookie: `genbi_cms_session=${token}` },
    });
    return response.data.data ?? null;
  } catch {
    return null;
  }
};
