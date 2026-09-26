import Link from "next/link";
import AboutClient from "../about/AboutClient";
import { getKorkomData, getSharedEvents } from "@/lib/services/profile.service";
import { getPeriodHasData, getPublicPeriods, periodSlug } from "@/lib/services/period.service";

export default async function ProfilView({ period }: { period: string | null }) {
  const { periods } = await getPublicPeriods();
  const active = period ?? periods[0] ?? null;

  const [korkomData, sharedEvents, hasData] = await Promise.all([
    getKorkomData(),
    getSharedEvents(),
    active ? getPeriodHasData(active) : Promise.resolve(false),
  ]);

  return (
    <div>
      <section className="bg-slate-50 pt-28 pb-6">
        <div className="container mx-auto px-6 max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Profil Periode</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {periods.map((item) => (
              <Link
                key={item}
                href={`/profil/${periodSlug(item)}`}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                  item === active
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {item}
              </Link>
            ))}
          </div>
          {active && !hasData && (
            <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-4 text-sm text-slate-500">
              Data untuk periode {active} belum tersedia. Bagian naratif di bawah tetap berlaku lintas periode.
            </p>
          )}
        </div>
      </section>

      <AboutClient korkomData={korkomData} sharedEvents={sharedEvents} />
    </div>
  );
}
