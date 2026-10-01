"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setNewsFeaturedOrder } from "@/lib/services/cms-news.service";
import { FIELD_BASE } from "../../ui";

/**
 * Pemilih slot beranda ringkas di dalam tabel daftar berita. Hanya berita
 * terbit yang bisa menempati slot 1-3; pilihan lain ditonjolkan sebagai badge
 * "Slot n" pada kolom ini dan "tidak valid" bila berita sudah tidak terbit.
 */
export function SlotSelect({
  newsId,
  value,
  published,
}: {
  newsId: string;
  value: number | null;
  published: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState(value ? String(value) : "");

  const save = async (next: string) => {
    setCurrent(next);
    setBusy(true);
    try {
      await setNewsFeaturedOrder(newsId, next === "" ? null : Number(next));
      router.refresh();
    } catch {
      // Gagal: biarkan state lama; refresh menampilkan nilai kanonik.
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <select
      value={current}
      disabled={busy}
      onChange={(event) => void save(event.target.value)}
      aria-label="Slot beranda"
      className={`${FIELD_BASE} px-2 py-1 text-xs disabled:opacity-60`}
    >
      <option value="">Tidak tampil</option>
      <option value="1" disabled={!published}>
        Slot 1
      </option>
      <option value="2" disabled={!published}>
        Slot 2
      </option>
      <option value="3" disabled={!published}>
        Slot 3
      </option>
    </select>
  );
}
