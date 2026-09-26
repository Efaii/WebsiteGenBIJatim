import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getPublicAwardees } from "@/lib/services/awardee.service";
import { getPublicPeriods, periodFromSlug, periodSlug } from "@/lib/services/period.service";

export default async function AwardeePage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string; q?: string }>;
}) {
  const { periode, q } = await searchParams;

  const { periods, defaultPeriod } = await getPublicPeriods();
  const period = (periode && periodFromSlug(periode, periods)) || periods[0] || defaultPeriod;

  const { awardees, summary } = period
    ? await getPublicAwardees(period)
    : { awardees: [], summary: { total: 0, byCommissariat: [] } };

  const query = (q ?? "").trim();
  const normalizedQuery = query.toLowerCase();
  const filtered = normalizedQuery
    ? awardees.filter((awardee) =>
        [awardee.name, awardee.commissariat.name, awardee.division, awardee.studyProgram]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : awardees;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-6xl px-6 py-20">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-blue-600 md:text-4xl">
            Penerima Beasiswa GenBI Jatim
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Data penerima beasiswa Bank Indonesia periode {period} dari sembilan komisariat GenBI Jawa Timur.
          </p>
        </header>

        {/* --- PERIOD FILTER --- */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          <span className="mr-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Periode</span>
          {periods.map((item) => (
            <Link
              key={item}
              href={`/awardee?periode=${periodSlug(item)}`}
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

        {/* --- SUMMARY --- */}
        <section className="mb-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-bold text-slate-900">{summary.total}</span>
              <span className="text-sm font-semibold text-slate-500">awardee pada periode {period}</span>
            </div>
            {summary.byCommissariat.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {summary.byCommissariat.map((entry) => (
                  <li
                    key={entry.slug}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {entry.name} <span className="text-blue-600">{entry.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* --- SEARCH --- */}
        <form method="get" className="mb-6 flex flex-wrap items-center gap-3">
          <input type="hidden" name="periode" value={periodSlug(period)} />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Cari nama, komisariat, divisi, atau prodi..."
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Cari
          </button>
          {query && (
            <Link href={`/awardee?periode=${periodSlug(period)}`} className="text-sm font-semibold text-slate-500 hover:text-blue-600">
              Reset
            </Link>
          )}
        </form>

        {/* --- TABLE --- */}
        {filtered.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Nama</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Komisariat</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Divisi</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Prodi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((awardee) => (
                    <tr key={awardee.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 text-sm font-semibold text-slate-900">{awardee.name}</td>
                      <td className="px-5 py-3 text-sm text-slate-600">{awardee.commissariat.name}</td>
                      <td className="px-5 py-3 text-sm text-slate-600">{awardee.division}</td>
                      <td className="px-5 py-3 text-sm text-slate-600">{awardee.studyProgram}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-6 text-center text-sm text-slate-500">
            {query ? `Tidak ada awardee yang cocok dengan "${query}".` : `Data awardee periode ${period} belum tersedia.`}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Menampilkan {filtered.length} dari {awardees.length} awardee.
        </p>
      </main>

      <div className="border-t border-slate-200 bg-white">
        <Footer />
      </div>
    </div>
  );
}
