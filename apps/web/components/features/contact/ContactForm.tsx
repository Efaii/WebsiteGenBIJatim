"use client";

import { useActionState } from "react";
import { submitContactForm } from "@/actions/contact";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { Send } from "lucide-react";

const initialState = {
  status: "idle" as const,
  message: "",
};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    initialState,
  );

  if (state.status === "success") {
    return (
      <Card className="bg-white border border-slate-200 shadow-sm p-8 h-full rounded-2xl flex flex-col justify-center">
        <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 py-12">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm border border-green-100">
            ✅
          </div>
          <h4 className="text-2xl font-bold text-slate-900 mb-3">Pesan Terkirim!</h4>
          <p className="text-slate-600 max-w-sm mb-8 leading-relaxed">
            {state.message ||
              "Terima kasih, tim Humas kami akan segera membalas email Anda."}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="rounded-xl font-bold border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 h-12 px-6"
          >
            Kirim Pesan Lain
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-8 h-full rounded-2xl flex flex-col">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
          Kirim Pesan
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed font-medium">
          Silakan isi formulir di bawah ini untuk mengajukan pertanyaan, tawaran
          kerjasama media partner, atau sponsorship.
        </p>
      </div>

      <form action={formAction} className="space-y-6 flex-1 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-xs font-bold text-slate-500 uppercase tracking-wider"
            >
              Nama Lengkap
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full bg-slate-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
              placeholder="Jhon Doe"
            />
            {state.errors?.name && (
              <p className="text-red-500 text-xs font-medium">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-bold text-slate-500 uppercase tracking-wider"
            >
              Email / Kontak
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full bg-slate-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
              placeholder="email@example.com"
            />
            {state.errors?.email && (
              <p className="text-red-500 text-xs font-medium">{state.errors.email[0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="subject"
            className="text-xs font-bold text-slate-500 uppercase tracking-wider"
          >
            Perihal
          </label>
          <select
            id="subject"
            name="subject"
            className="w-full bg-slate-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer shadow-sm font-medium"
          >
            <option value="Pertanyaan Umum">Pertanyaan Umum</option>
            <option value="Media Partner">Media Partner</option>
            <option value="Sponsorship Event">Sponsorship Event</option>
            <option value="Audiensi / Kunjungan">Audiensi / Kunjungan</option>
          </select>
          {state.errors?.subject && (
            <p className="text-red-500 text-xs font-medium">{state.errors.subject[0]}</p>
          )}
        </div>

        <div className="space-y-2 flex-1 flex flex-col">
          <label
            htmlFor="message"
            className="text-xs font-bold text-slate-500 uppercase tracking-wider"
          >
            Pesan Anda
          </label>
          <textarea
            id="message"
            name="message"
            required
            className="w-full flex-1 min-h-[160px] bg-slate-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none shadow-sm"
            placeholder="Tuliskan detail keperluan Anda di sini..."
          ></textarea>
          {state.errors?.message && (
            <p className="text-red-500 text-xs font-medium">{state.errors.message[0]}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full group bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-14 text-base font-bold shadow-md shadow-blue-500/20 transition-all mt-auto"
          disabled={isPending}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Mengirim...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Kirim Pesan
              <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
          )}
        </Button>
      </form>
    </Card>
  );
}
