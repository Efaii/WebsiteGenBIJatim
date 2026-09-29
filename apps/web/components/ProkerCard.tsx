import Link from "next/link";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";

export interface ProkerCardProps {
  title: string;
  commissariat?: string;
  status: "Upcoming" | "On-going" | "Completed" | string;
  date: string;
  description: string;
  onClick?: () => void;
  href?: string;
  className?: string; // Allow minimal overrides
  actionLabel?: string; // Custom button text
  onAction?: (e: React.MouseEvent) => void; // Custom button action
  hideAction?: boolean; // Hide the button completely
}

export function ProkerCard({
  title,
  status,
  date,
  description,
  onClick,
  href,
  className,
  actionLabel,
  onAction,
  hideAction,
}: ProkerCardProps) {
  /*
   * Kotak tanggal hanya boleh memecah pola tanggal yang dikenal:
   * "10 Jan 2025" (tanggal penuh) dan "Feb 2025" (bulan-tahun). Label jadwal
   * non-tanggal (rentang, berkala, rangkaian sesi, "Menyusul") dan label
   * periode ditampilkan apa adanya, bukan dipecah per kata seperti sebelumnya
   * ("Setiap hari Senin" pernah tampil sebagai "HARI / Setiap").
   */
  const dateParts = date.split(" ");
  const isFullDate = /^\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(date);
  const isMonthYear = /^[A-Za-z]+\s+\d{4}$/.test(date);
  const isTextLabel = !isFullDate && !isMonthYear;
  const mainDate = dateParts[0]; // Day "10" OR Month "Feb"
  const subDate = isFullDate ? `${dateParts[1]} ${dateParts[2]}` : dateParts[1]; // "Jan 2025" OR "2025"

  // Status Styling Logic
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "On-going":
        return "bg-blue-50 text-blue-700 border-blue-200 animate-pulse";
      case "Upcoming":
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const CardContent = (
    <Card
      onClick={!href ? onClick : undefined}
      className={cn(
        "bg-white border-slate-200 shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start md:items-center group hover:border-blue-300 transition-all duration-300 h-full",
        (onClick || href) && "cursor-pointer hover:shadow-md",
        className,
      )}
    >
      <div className={cn(
        "min-h-16 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center flex-shrink-0 group-hover:border-blue-300 transition-colors",
        isTextLabel ? "w-36 px-3 text-center" : "w-16",
      )}>
        {isTextLabel ? (
          <span
            className="text-xs font-bold text-blue-600 uppercase leading-relaxed line-clamp-2"
            title={date}
          >
            {date}
          </span>
        ) : (
          <>
            <span className="text-xs font-bold text-blue-600 uppercase">
              {isFullDate ? subDate.split(" ")[0] : mainDate}
            </span>
            <span className="text-xl font-bold text-slate-900">
              {isFullDate ? mainDate : subDate}
            </span>
          </>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
              getStatusStyles(status),
            )}
          >
            {status}
          </span>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          {description}
        </p>
        {!hideAction && (
          <Button
            size="sm"
            variant="outline"
            className="gap-2 text-xs h-8 bg-white border-slate-200 hover:bg-slate-50 hover:text-blue-600 text-slate-700"
            onClick={
              onAction
                ? (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAction(e);
                  }
                : undefined
            }
          >
            {actionLabel || "Lihat Detail"}
          </Button>
        )}
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block w-full h-full">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
