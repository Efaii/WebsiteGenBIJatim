import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageBackground } from "@/components/PageBackground";
import { ProkerCard } from "@/components/ProkerCard";
import { getAllPrograms } from "@/lib/services/program.service";
import { programDateLabel, publicProgramItems } from "@/lib/program-presentation.mjs";

export const metadata: Metadata = {
  title: "Program Kerja | GenBI Jatim",
  description: "Daftar program kerja GenBI Jawa Timur",
  openGraph: {
    title: "Program Kerja | GenBI Jatim",
    description: "Daftar program kerja GenBI Jawa Timur",
  },
};

export default async function ProgramListPage() {
  const programs = publicProgramItems(await getAllPrograms());

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 relative overflow-x-hidden">
      <PageBackground />
      <Navbar />

      <main className="flex-1 w-full relative z-10 pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Program Kerja <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-sky-600">GenBI Jatim</span>
              </h1>
              <p className="text-slate-600 text-sm md:text-base">
                Kumpulan program kerja GenBI se-Jawa Timur.
              </p>
            </div>

            {programs.length === 0 ? (
              <div
                role="status"
                className="py-16 text-center text-slate-500 italic border border-dashed border-slate-200 rounded-3xl bg-white/80 backdrop-blur-md"
              >
                Belum ada program kerja.
              </div>
            ) : (
              <div className="grid gap-6">
                {programs.map((item) => (
                  <ProkerCard
                    key={String(item.id)}
                    href={`/program/${item.id}`}
                    title={item.title}
                    status={item.status}
                    date={programDateLabel(item)}
                    description={item.description}
                    commissariat={item.commissariat}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
