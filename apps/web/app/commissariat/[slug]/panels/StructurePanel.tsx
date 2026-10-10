import { Users } from "lucide-react";
import type { CommissariatStructure } from "@/lib/services/commissariat.service";
import { initialsOf, positionRank, sortMembers } from "../display";

/**
 * Panel "Profil & Kepengurusan": susunan pengurus periode terpilih.
 *
 * Foto pengurus tidak tersedia di API, jadi avatar memakai inisial nama alih-alih
 * gambar placeholder. Komponen ini server component (tanpa state) supaya daftar
 * yang panjang tidak ikut membebani bundle client.
 */
export function StructurePanel({
  structure,
  period,
}: {
  structure: CommissariatStructure | null;
  period: string;
}) {
  const bph = sortMembers(structure?.bph ?? []);
  const divisions = (structure?.divisions ?? []).map((division) => ({
    name: division.name,
    members: sortMembers(division.members),
  }));
  const totalMembers =
    bph.length +
    divisions.reduce((count, division) => count + division.members.length, 0);

  if (totalMembers === 0) {
    return (
      <section className="rounded-card border border-dashed border-genbi-line bg-white/80 px-6 py-14 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-genbi-light text-genbi-blue">
          <Users className="h-6 w-6" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-heading text-lg font-bold text-slate-900">
          Struktur periode {period} belum dipublikasikan
        </h3>
        <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-slate-500">
          Kepengurusan periode ini belum diunggah ke situs. Coba pilih periode
          lain lewat tombol periode di atas, atau cek kembali nanti.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="struktur-heading" className="space-y-8">
      <h2
        id="struktur-heading"
        className="font-heading text-xl font-bold tracking-tight text-slate-900 md:text-2xl"
      >
        Struktur Pengurus
      </h2>

      {bph.length > 0 && (
        <div>
          <h3 className="mb-3 text-base font-bold text-slate-900">
            Badan Pengurus Harian
          </h3>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {bph.map((member) => {
              const lead = positionRank(member.position) === 0;
              return (
                <li
                  key={`${member.name}-${member.position}`}
                  className={lead ? "sm:col-span-2" : undefined}
                >
                  <div className="flex h-full items-center gap-4 rounded-card border border-genbi-line bg-white p-4 shadow-sm">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        lead
                          ? "bg-genbi-blue text-white"
                          : "bg-genbi-light text-genbi-ink"
                      }`}
                      aria-hidden="true"
                    >
                      {initialsOf(member.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold leading-snug text-slate-900">
                        {member.name}
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-genbi-blue">
                        {member.position}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {divisions.length > 0 && (
        <div>
          <h3 className="mb-3 text-base font-bold text-slate-900">Divisi</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {divisions.map((division) => (
              <article
                key={division.name}
                className="overflow-hidden rounded-card border border-genbi-line bg-white shadow-sm"
              >
                <header className="flex items-center justify-between gap-3 border-b border-genbi-line bg-genbi-light/50 px-5 py-3.5">
                  <h4 className="font-heading text-base font-bold text-slate-900">
                    {division.name}
                  </h4>
                  <span className="rounded-full border border-genbi-line bg-white px-2.5 py-0.5 text-xs font-bold tabular-nums text-genbi-ink">
                    {division.members.length}
                  </span>
                </header>
                <ul className="divide-y divide-genbi-line/60">
                  {division.members.map((member) => {
                    const leader = positionRank(member.position) < 50;
                    return (
                      <li
                        key={`${member.name}-${member.position}`}
                        className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-5 py-2.5"
                      >
                        <span className="text-sm font-semibold text-slate-800">
                          {member.name}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            leader ? "text-genbi-blue" : "text-slate-500"
                          }`}
                        >
                          {member.position}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
