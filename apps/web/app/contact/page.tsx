import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card } from "@/components/Card";
import { FadeIn, SlideUp } from "@/components/MotionWrapper";
import { ContactForm } from "@/components/features/contact/ContactForm";

export const metadata = {
  title: "Hubungi Kami - GenBI Jatim",
  description:
    "Hubungi GenBI Jawa Timur untuk pertanyaan, kerjasama, atau kolaborasi.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-blue-200 selection:text-blue-900 relative overflow-clip">
      <Navbar />

      {/* Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] mix-blend-multiply animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-100 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000"></div>
      </div>

      <main className="flex-1">
        {/* Hero Section - 100vh */}
        <section className="min-h-[100svh] flex flex-col items-center justify-center relative pt-20">
          <div className="container mx-auto px-6 text-center">
            <SlideUp>
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-slate-900">
                Mari{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                  Terhubung
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
                Pintu komunikasi kami selalu terbuka. Baik itu pertanyaan, ide kolaborasi, maupun penawaran kerja sama, kami siap mendengarkan dan menciptakan sinergi positif bersama Anda.
              </p>
            </SlideUp>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
            <div className="w-8 h-12 rounded-full border-2 border-slate-400 flex justify-center p-2">
              <div className="w-1 h-3 bg-slate-400 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 relative z-10 bg-white border-t border-slate-200">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
              {/* Left Column: Contact Info & Map */}
              <div className="space-y-8 flex flex-col h-full">
                <FadeIn delay={0.2} className="flex-none">
                  <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 p-8 rounded-2xl group">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                      <span className="text-3xl group-hover:scale-110 transition-transform">📍</span> Sekretariat
                    </h3>
                    <address className="not-italic text-slate-600 space-y-4 leading-relaxed font-medium">
                      <p className="font-bold text-slate-900 text-lg">
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

                    <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                          ✉️
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                            Email Resmi
                          </p>
                          <a
                            href="mailto:sekretariat@genbijatim.id"
                            className="text-slate-900 font-bold hover:text-blue-600 transition-colors"
                          >
                            sekretariat@genbijatim.id
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                          📱
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                            Instagram
                          </p>
                          <a
                            href="https://instagram.com/genbijatim"
                            target="_blank"
                            className="text-slate-900 font-bold hover:text-blue-600 transition-colors"
                          >
                            @genbijatim
                          </a>
                        </div>
                      </div>
                    </div>
                  </Card>
                </FadeIn>

                {/* Map Placeholder */}
                <FadeIn delay={0.4} className="flex-1 min-h-[300px]">
                  <div className="w-full h-full min-h-[300px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group bg-slate-50">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.9406604618774!2d112.73551531477416!3d-7.2475969947703975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7f93fc4d38c6b%3A0x62c0406830526742!2sBank%20Indonesia%20Representative%20Office%20of%20East%20Java!5e0!3m2!1sen!2sid!4v1679890123456!5m2!1sen!2sid"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      className="grayscale group-hover:grayscale-0 transition-all duration-700 opacity-80 group-hover:opacity-100 absolute inset-0"
                    ></iframe>
                  </div>
                </FadeIn>
              </div>

              {/* Right Column: Contact Form */}
              <SlideUp delay={0.4} className="h-full">
                <ContactForm />
              </SlideUp>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
