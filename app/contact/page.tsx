"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/MotionWrapper";

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<
    "idle" | "submitting" | "success"
  >("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    // Simulate API call
    setTimeout(() => {
      setFormStatus("success");
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white selection:bg-cyan-500 selection:text-white relative overflow-clip">
      <Navbar />

      {/* Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
      </div>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-16 relative">
          <div className="container mx-auto px-6 text-center">
            <SlideUp>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Hubungi{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-200">
                  Kami
                </span>
              </h1>
              <p className="text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed font-light">
                Punya pertanyaan, tawaran kerjasama, atau ingin berkolaborasi?
                Kami siap mendengar dan bersinergi dengan Anda.
              </p>
            </SlideUp>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 md:py-20 relative z-10">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Column: Contact Info & Map */}
              <div className="space-y-8">
                <FadeIn delay={0.2}>
                  <Card className="bg-white/5 backdrop-blur-md border-white/10 p-8">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <span className="text-3xl">📍</span> Sekretariat
                    </h3>
                    <address className="not-italic text-blue-200/80 space-y-4 leading-relaxed">
                      <p className="font-semibold text-white">
                        GenBI Jawa Timur
                      </p>
                      <p>
                        Kantor Perwakilan Bank Indonesia Provinsi Jawa Timur
                      </p>
                      <p>
                        Jl. Pahlawan No.105, Krembangan Sel., Kec. Krembangan,
                        Kota SBY, Jawa Timur 60175
                      </p>
                    </address>

                    <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                          ✉️
                        </div>
                        <div>
                          <p className="text-xs text-blue-300 uppercase font-bold tracking-wider">
                            Email Resmi
                          </p>
                          <a
                            href="mailto:sekretariat@genbijatim.id"
                            className="text-white hover:text-cyan-400 transition-colors"
                          >
                            sekretariat@genbijatim.id
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                          📱
                        </div>
                        <div>
                          <p className="text-xs text-blue-300 uppercase font-bold tracking-wider">
                            Instagram
                          </p>
                          <a
                            href="https://instagram.com/genbijatim"
                            target="_blank"
                            className="text-white hover:text-cyan-400 transition-colors"
                          >
                            @genbijatim
                          </a>
                        </div>
                      </div>
                    </div>
                  </Card>
                </FadeIn>

                {/* Map Placeholder */}
                <FadeIn delay={0.4}>
                  <div className="w-full h-64 rounded-2xl overflow-hidden border border-white/10 bg-white/5 relative group">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.9406604618774!2d112.73551531477416!3d-7.2475969947703975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7f93fc4d38c6b%3A0x62c0406830526742!2sBank%20Indonesia%20Representative%20Office%20of%20East%20Java!5e0!3m2!1sen!2sid!4v1679890123456!5m2!1sen!2sid"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      className="grayscale group-hover:grayscale-0 transition-all duration-700 opacity-70 group-hover:opacity-100"
                    ></iframe>
                  </div>
                </FadeIn>
              </div>

              {/* Right Column: Contact Form */}
              <SlideUp delay={0.4} className="h-full">
                <Card className="bg-white/5 backdrop-blur-md border-white/10 p-8 h-full">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Kirim Pesan
                  </h3>
                  <p className="text-blue-200/60 mb-8 text-sm">
                    Silakan isi formulir di bawah ini untuk mengajukan
                    pertanyaan, tawaran kerjasama media partner, atau
                    sponsorship.
                  </p>

                  {formStatus === "success" ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center animate-in fade-in zoom-in duration-500">
                      <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-3xl mb-4">
                        ✅
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">
                        Pesan Terkirim!
                      </h4>
                      <p className="text-blue-200/70">
                        Terima kasih, tim Humas kami akan segera membalas email
                        Anda.
                      </p>
                      <Button
                        onClick={() => setFormStatus("idle")}
                        variant="secondary"
                        size="sm"
                        className="mt-6"
                      >
                        Kirim Pesan Lain
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                            Nama Lengkap
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                            placeholder="Jhon Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                            Email / Kontak
                          </label>
                          <input
                            type="email"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                          Perihal
                        </label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer">
                          <option className="bg-blue-950 text-white">
                            Pertanyaan Umum
                          </option>
                          <option className="bg-blue-950 text-white">
                            Media Partner
                          </option>
                          <option className="bg-blue-950 text-white">
                            Sponsorship Event
                          </option>
                          <option className="bg-blue-950 text-white">
                            Audiensi / Kunjungan
                          </option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                          Pesan Anda
                        </label>
                        <textarea
                          rows={5}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all resize-none"
                          placeholder="Tuliskan detail keperluan Anda di sini..."
                        ></textarea>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full group"
                        disabled={formStatus === "submitting"}
                      >
                        {formStatus === "submitting" ? (
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
                  )}
                </Card>
              </SlideUp>
            </div>
          </div>
        </section>

        {/* Partnership CTA */}
        <section className="py-24 relative overflow-hidden text-center">
          <div className="container relative z-10 px-6 mx-auto">
            <FadeIn>
              <h2 className="text-3xl font-bold text-white mb-6">Mitra Kami</h2>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Mock Logos */}
                <div className="text-2xl font-bold text-white">
                  BANK INDONESIA
                </div>
                <div className="text-xl font-bold text-white border-2 border-white p-2">
                  GENBI PUSAT
                </div>
                <div className="text-xl font-bold text-white">
                  MAHASISWA JAWA TIMUR
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
