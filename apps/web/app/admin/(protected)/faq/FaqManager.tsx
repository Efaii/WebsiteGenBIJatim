"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, CircleHelp, Loader2, Trash2 } from "lucide-react";
import {
  createFaq,
  deleteFaq,
  listCmsFaqs,
  orderFaqs,
  updateFaq,
  type CmsFaqItem,
} from "@/lib/services/cms-faq.service";
import {
  BTN_DANGER,
  BTN_ICON,
  BTN_PRIMARY,
  BTN_SMALL,
  FIELD,
  LABEL,
  PANEL,
} from "../../ui";

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal memproses FAQ. Coba lagi.";
};

const ACTIVE_BADGE =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";

/**
 * Pengelolaan FAQ jalur kanonik (ADR 0014): CRUD + urutan + aktif/nonaktif.
 * Semua aksi memakai sesi kanonik; beranda membaca daftar aktif yang sama.
 */
export function FaqManager() {
  const [items, setItems] = useState<CmsFaqItem[]>([]);
  const [loaded, setLoaded] = useState(false);
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
    void (async () => {
      try {
        await refresh();
      } catch (err) {
        setError(extractMessage(err));
      } finally {
        setLoaded(true);
      }
    })();
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
    <div className="space-y-6">
      <section className={`${PANEL} space-y-4 p-6`}>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">FAQ baru</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Langsung aktif dan ikut tampil di beranda setelah ditambahkan.
          </p>
        </div>
        <div>
          <label className={LABEL} htmlFor="faq-new-question">
            Pertanyaan
          </label>
          <input
            id="faq-new-question"
            value={newQuestion}
            onChange={(event) => setNewQuestion(event.target.value)}
            placeholder="Pertanyaan"
            maxLength={300}
            className={`${FIELD} mt-1`}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="faq-new-answer">
            Jawaban
          </label>
          <textarea
            id="faq-new-answer"
            value={newAnswer}
            onChange={(event) => setNewAnswer(event.target.value)}
            placeholder="Jawaban"
            maxLength={5000}
            rows={3}
            className={`${FIELD} mt-1`}
          />
        </div>
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
          className={BTN_PRIMARY}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Tambah FAQ
        </button>
      </section>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-relaxed text-red-700">
          {error}
        </p>
      )}

      {!loaded ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-card border border-genbi-line bg-white"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <section
              key={item.id}
              data-faq-id={item.id}
              className={`${PANEL} space-y-4 p-6`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Urutan {index + 1}
                  </span>
                  <span
                    className={`${ACTIVE_BADGE} ${
                      item.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={busy || index === 0}
                    aria-label="Naikkan urutan"
                    className={BTN_ICON}
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={busy || index === items.length - 1}
                    aria-label="Turunkan urutan"
                    className={BTN_ICON}
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void run(() =>
                        updateFaq(item.id, { isActive: !item.isActive }),
                      )
                    }
                    className={BTN_SMALL}
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
                    [item.id]: {
                      ...prev[item.id],
                      question: event.target.value,
                    },
                  }))
                }
                className={FIELD}
              />
              <textarea
                value={edits[item.id]?.answer ?? ""}
                maxLength={5000}
                rows={3}
                onChange={(event) =>
                  setEdits((prev) => ({
                    ...prev,
                    [item.id]: {
                      ...prev[item.id],
                      answer: event.target.value,
                    },
                  }))
                }
                className={FIELD}
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
                  className={BTN_PRIMARY}
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
                  className={BTN_DANGER}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Hapus
                </button>
              </div>
            </section>
          ))}
          {items.length === 0 && (
            <div
              className={`${PANEL} flex flex-col items-center px-6 py-14 text-center`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-genbi-light text-genbi-blue">
                <CircleHelp className="h-6 w-6" aria-hidden />
              </span>
              <p className="mt-4 text-sm font-semibold text-slate-900">
                Belum ada FAQ
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Tambahkan lewat formulir di atas.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
