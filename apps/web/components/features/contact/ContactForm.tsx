"use client";

import { useActionState } from "react";
import { submitContactForm } from "@/actions/contact";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

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
      <Card className="bg-white/5 backdrop-blur-md border-white/10 p-8 h-full">
        <div className="flex flex-col items-center justify-center h-64 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-3xl mb-4">
            ✅
          </div>
          <h4 className="text-xl font-bold text-white mb-2">Pesan Terkirim!</h4>
          <p className="text-blue-200/70">
            {state.message ||
              "Terima kasih, tim Humas kami akan segera membalas email Anda."}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="secondary"
            size="sm"
            className="mt-6"
          >
            Kirim Pesan Lain
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 p-8 h-full">
      <h3 className="text-2xl font-bold text-white mb-2">Kirim Pesan</h3>
      <p className="text-blue-200/60 mb-8 text-sm">
        Silakan isi formulir di bawah ini untuk mengajukan pertanyaan, tawaran
        kerjasama media partner, atau sponsorship.
      </p>

      <form action={formAction} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-xs font-bold text-blue-300 uppercase tracking-wider"
            >
              Nama Lengkap
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
              placeholder="Jhon Doe"
            />
            {state.errors?.name && (
              <p className="text-red-400 text-xs">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-bold text-blue-300 uppercase tracking-wider"
            >
              Email / Kontak
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
              placeholder="email@example.com"
            />
            {state.errors?.email && (
              <p className="text-red-400 text-xs">{state.errors.email[0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="subject"
            className="text-xs font-bold text-blue-300 uppercase tracking-wider"
          >
            Perihal
          </label>
          <select
            id="subject"
            name="subject"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
          >
            <option value="Pertanyaan Umum" className="bg-blue-950 text-white">
              Pertanyaan Umum
            </option>
            <option value="Media Partner" className="bg-blue-950 text-white">
              Media Partner
            </option>
            <option
              value="Sponsorship Event"
              className="bg-blue-950 text-white"
            >
              Sponsorship Event
            </option>
            <option
              value="Audiensi / Kunjungan"
              className="bg-blue-950 text-white"
            >
              Audiensi / Kunjungan
            </option>
          </select>
          {state.errors?.subject && (
            <p className="text-red-400 text-xs">{state.errors.subject[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="message"
            className="text-xs font-bold text-blue-300 uppercase tracking-wider"
          >
            Pesan Anda
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all resize-none"
            placeholder="Tuliskan detail keperluan Anda di sini..."
          ></textarea>
          {state.errors?.message && (
            <p className="text-red-400 text-xs">{state.errors.message[0]}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full group"
          disabled={isPending}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Mengirim...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Kirim Pesan{" "}
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </span>
          )}
        </Button>
      </form>
    </Card>
  );
}
