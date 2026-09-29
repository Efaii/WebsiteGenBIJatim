"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createFaq,
  deleteFaq,
  listCmsFaqs,
  orderFaqs,
  updateFaq,
  type CmsFaqItem,
} from "@/lib/services/cms-faq.service";

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal memproses FAQ. Coba lagi.";
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-genbi-blue";

/**
 * Pengelolaan FAQ jalur kanonik (ADR 0014): CRUD + urutan + aktif/nonaktif.
 * Semua aksi memakai sesi kanonik; beranda membaca daftar aktif yang sama.
 */
export function FaqManager() {
  const [items, setItems] = useState<CmsFaqItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [edits, setEdits] = useState<
    Record<string, { question: string; answer: string }>
  >({});

  const refresh = useCallback(async () => {
    const list = await listCmsFaqs();
    setItems(list);
    setEdits(
      Object.fromEntries(
        list.map((item) => [
          item.id,
          { question: item.question, answer: item.answer },
        ]),
      ),
    );
  }, []);

  useEffect(() => {
    void refresh().catch((err) => setError(extractMessage(err)));
  }, [refresh]);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      await refresh();
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const ids = items.map((item) => item.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    void run(() => orderFaqs(ids));
  };

  return (
    <div className="space-y-4">
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">FAQ baru</h2>
        <input
          value={newQuestion}
          onChange={(event) => setNewQuestion(event.target.value)}
          placeholder="Pertanyaan"
          maxLength={300}
          className={inputClass}
        />
        <textarea
          value={newAnswer}
          onChange={(event) => setNewAnswer(event.target.value)}
          placeholder="Jawaban"
          maxLength={5000}
          rows={3}
          className={inputClass}
        />
        <button
          type="button"
          disabled={busy || !newQuestion.trim() || !newAnswer.trim()}
          onClick={() =>
            void run(async () => {
              await createFaq({
                question: newQuestion.trim(),
                answer: newAnswer.trim(),
                isActive: true,
              });
              setNewQuestion("");
              setNewAnswer("");
            })
          }
          className="rounded-lg bg-genbi-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          Tambah FAQ
        </button>
      </section>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <section
            key={item.id}
            data-faq-id={item.id}
            className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-400">
                Urutan {index + 1} · {item.isActive ? "Aktif" : "Nonaktif"}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={busy || index === 0}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={busy || index === items.length - 1}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run(() =>
                      updateFaq(item.id, { isActive: !item.isActive }),
                    )
                  }
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  {item.isActive ? "Nonaktifkan" : "Aktifkan"}
                </button>
              </div>
            </div>
            <input
              value={edits[item.id]?.question ?? ""}
              maxLength={300}
              onChange={(event) =>
                setEdits((prev) => ({
                  ...prev,
                  [item.id]: { ...prev[item.id], question: event.target.value },
                }))
              }
              className={inputClass}
            />
            <textarea
              value={edits[item.id]?.answer ?? ""}
              maxLength={5000}
              rows={3}
              onChange={(event) =>
                setEdits((prev) => ({
                  ...prev,
                  [item.id]: { ...prev[item.id], answer: event.target.value },
                }))
              }
              className={inputClass}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(() =>
                    updateFaq(item.id, {
                      question: (edits[item.id]?.question ?? "").trim(),
                      answer: (edits[item.id]?.answer ?? "").trim(),
                    }),
                  )
                }
                className="rounded-lg bg-genbi-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                Simpan
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (window.confirm("Hapus FAQ ini?")) {
                    void run(() => deleteFaq(item.id));
                  }
                }}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                Hapus
              </button>
            </div>
          </section>
        ))}
        {items.length === 0 && (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Belum ada FAQ.
          </p>
        )}
      </div>
    </div>
  );
}
