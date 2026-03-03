"use client";

import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  CheckCircle2,
  Building2,
  Newspaper,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Define the shape of our stats API
interface DashboardStats {
  faqs: number;
  testimonials: number;
  commissariats: number;
  news: number;
  systemStatus: string;
}

export default function AdminDashboard() {
  const [userName, setUserName] = useState("Admin");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Greet user
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user?.name) setUserName(user.name);
      } catch (e) {
        // silently ignore parse errors
      }
    }

    // Fetch Live Dashboard Stats
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          "http://localhost:5000/api/dashboard/stats",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          router.push("/admin/login");
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  const metrics = [
    {
      label: "Total Testimoni",
      value: isLoading ? "..." : (stats?.testimonials ?? 0),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Total FAQ",
      value: isLoading ? "..." : (stats?.faqs ?? 0),
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "Total Berita",
      value: isLoading ? "..." : (stats?.news ?? 0),
      icon: Newspaper,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      label: "Komisariat Aktif",
      value: isLoading ? "..." : (stats?.commissariats ?? 0),
      icon: Building2,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Sistem Status",
      value: isLoading ? "..." : (stats?.systemStatus ?? "Offline"),
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Selamat Datang, {userName}! 👋
        </h1>
        <p className="mt-2 text-slate-600 font-medium">
          Kelola konten publik situs GenBI Jatim melalui panel ini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md hover:-translate-y-1 transition-all cursor-default"
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${metric.bg}`}
              >
                <Icon className={`w-7 h-7 ${metric.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold tracking-wide text-slate-500 uppercase">
                  {metric.label}
                </p>
                <p className="text-3xl font-extrabold text-[#0e2f5a] mt-1">
                  {isLoading ? (
                    <span className="animate-pulse bg-slate-200 text-transparent rounded">
                      000
                    </span>
                  ) : (
                    metric.value
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
        <h3 className="text-xl font-bold text-[#0e2f5a] mb-4">
          Aktivitas Terbaru
        </h3>
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-slate-500 font-medium tracking-wide">
            Sistem Database{" "}
            <strong className="text-emerald-600">
              {isLoading ? "Memuat..." : "Tersambung"}
            </strong>
            . Belum ada aktivitas krusial terekam hari ini.
          </p>
        </div>
      </div>
    </div>
  );
}
