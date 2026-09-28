import { Inbox, TriangleAlert } from "lucide-react";

type StateMessageProps = {
  tone?: "info" | "error";
  title: string;
  description?: string;
  className?: string;
};

/**
 * Pesan state untuk bagian halaman: "belum ada data" atau "gagal memuat".
 *
 * Dipakai halaman publik supaya kegagalan API tidak pernah muncul sebagai area
 * kosong tanpa penjelasan. Aman dipakai dari server maupun client component.
 */
export function StateMessage({ tone = "info", title, description, className }: StateMessageProps) {
  const Icon = tone === "error" ? TriangleAlert : Inbox;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center ${
        tone === "error"
          ? "border-red-200 bg-red-50/60"
          : "border-slate-200 bg-slate-50/60"
      } ${className ?? ""}`}
    >
      <Icon
        className={`h-7 w-7 ${tone === "error" ? "text-red-500" : "text-slate-400"}`}
        aria-hidden="true"
      />
      <p className={`text-base font-semibold ${tone === "error" ? "text-red-700" : "text-slate-700"}`}>
        {title}
      </p>
      {description && <p className="max-w-md text-sm text-slate-500">{description}</p>}
    </div>
  );
}
