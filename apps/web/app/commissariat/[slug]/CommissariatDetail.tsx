import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { ProkerData } from "@repo/types";
import { periodSlug } from "@/lib/services/period.service";
import type { CommissariatAwardee, CommissariatStructure } from "@/lib/services/commissariat.service";

type CommissariatDetailData = {
  slug: string;
  name: string;
  university: string;
  logo_univ: string;
  logo_genbi: string;
  cover_image: string;
  description: string;
  memberCount?: number;
  proker: ProkerData[];
};

type Props = {
  data: CommissariatDetailData;
  periods: string[];
  period: string;
  structure: CommissariatStructure | null;
  awardees: CommissariatAwardee[];
};

const MemberRow = ({ name, position }: { name: string; position: string }) => (
  <li className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white px-4 py-2.5">
    <span className="text-sm font-semibold text-slate-900">{name}</span>
    <span className="text-xs font-medium uppercase tracking-wider text-blue-600">{position}</span>
  </li>
);

export default function CommissariatDetail({ data, periods, period, structure, awardees }: Props) {
  const hasStructure = Boolean(structure && (structure.bph.length > 0 || structure.divisions.length > 0));

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />

      {/* --- HEADER --- */}
      <section className="relative overflow-hidden bg-blue-950 pb-16 pt-28 text-white">
        {data.cover_image && (
          <Image src={data.cover_image} alt={data.name} fill className="object-cover opacity-25" priority />
        )}
        <div className="container relative z-10 mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-3">
              <Image
                src={data.logo_univ || "/assets/logos/genbi.svg"}
                alt={`${data.name} Logo`}
                width={80}
                height={80}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{data.name}</h1>
              <p className="mt-2 text-blue-100/80">{data.university}</p>
              {data.description && (
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-blue-100/70">{data.description}</p>
              )}
              <p className="mt-4 text-sm font-semibold text-cyan-300">{data.memberCount ?? 0} anggota</p>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto max-w-6xl flex-1 px-6 py-12">
        {/* --- PERIOD SELECTOR --- */}
        <div className="mb-10 flex flex-wrap items-center gap-2">
          <span className="mr-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Periode</span>
          {periods.map((item) => (
            <Link
              key={item}
              href={`/commissariat/${data.slug}?periode=${periodSlug(item)}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                item === period
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {item}
            </Link>
          ))}
        </div>

        {/* --- STRUKTUR ORGANISASI --- */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Struktur Organisasi</h2>
          {hasStructure ? (
            <div className="space-y-8">
              {structure!.bph.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-600">BPH</h3>
                  <ul className="grid gap-2 md:grid-cols-2">
                    {structure!.bph.map((member) => (
                      <MemberRow key={`bph-${member.name}-${member.position}`} {...member} />
                    ))}
                  </ul>
                </div>
              )}
              {structure!.divisions.map((division) => (
                <div key={division.name}>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-600">{division.name}</h3>
                  <ul className="grid gap-2 md:grid-cols-2">
                    {division.members.map((member) => (
                      <MemberRow key={`${division.name}-${member.name}-${member.position}`} {...member} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-4 text-sm text-slate-500">
              Struktur pengurus periode {period} belum tersedia.
            </p>
          )}
        </section>

        {/* --- PROGRAM KERJA --- */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Program Kerja</h2>
          {data.proker.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.proker.map((program) => (
                <Link
                  key={String(program.id)}
                  href={`/program/${program.id}`}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
                >
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                      {program.divisi || "Program"}
                    </p>
                    <h3 className="mt-2 font-bold leading-snug text-slate-900 group-hover:text-blue-700">
                      {program.title}
                    </h3>
                  </div>
                  <p className="mt-4 text-xs font-semibold text-slate-500">{program.dateLabel || program.date}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-4 text-sm text-slate-500">
              Belum ada program kerja publik untuk komisariat ini.
            </p>
          )}
        </section>

        {/* --- AWARDEE --- */}
        <section className="mb-6">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">Awardee</h2>
          <p className="mb-6 text-sm text-slate-500">
            {awardees.length} penerima beasiswa pada periode {period}.
          </p>
          {awardees.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Nama</th>
                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Divisi</th>
                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Jabatan</th>
                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Prodi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {awardees.map((awardee) => (
                      <tr key={awardee.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-3 text-sm font-semibold text-slate-900">{awardee.name}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{awardee.division}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{awardee.position}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{awardee.studyProgram}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-4 text-sm text-slate-500">
              Data awardee periode {period} belum tersedia.
            </p>
          )}
        </section>
      </main>

      <div className="border-t border-slate-200 bg-white">
        <Footer />
      </div>
    </div>
  );
}
