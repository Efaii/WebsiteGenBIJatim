"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquareQuote,
  FileText,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Building2,
  Newspaper,
  Menu,
  X,
  Globe,
} from "lucide-react";
import ProtectedRoute from "@/components/admin/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Bypassing the protected layout wrapper exclusively for the Login route.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/admin/login");
  };

  const navLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    {
      name: "Kelola Testimoni",
      href: "/admin/testimonials",
      icon: MessageSquareQuote,
    },
    { name: "Komisariat", href: "/admin/commissariats", icon: Building2 },
    { name: "Berita", href: "/admin/news", icon: Newspaper },
    { name: "Kelola FAQ", href: "/admin/faqs", icon: HelpCircle },
    { name: "Sistem Status", href: "/admin/settings", icon: Settings },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 flex font-sans">
        {/* Sidebar (Desktop & Mobile Wrapper) */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0e2f5a] text-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">
                  GenBI Admin
                </h1>
                <p className="text-blue-300 text-xs mt-0.5 font-medium tracking-wide">
                  Panel Manajemen 2.0
                </p>
              </div>
              <button
                className="lg:hidden text-white/70 hover:text-white transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-900/20 font-semibold"
                        : "text-slate-300 hover:bg-white/10 hover:text-white font-medium"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`}
                    />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/10 space-y-2">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors group"
              >
                <Globe className="w-5 h-5 group-hover:text-blue-300 transition-colors" />
                <span className="font-medium">Lihat Website</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Topbar */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <button
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 ml-auto">
                <div className="hidden sm:block text-right mr-2">
                  <p className="text-sm font-bold text-slate-700">
                    Administrator
                  </p>
                  <p className="text-xs font-semibold text-blue-600">
                    Active Session
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shadow-inner">
                  <span className="text-blue-800 font-extrabold text-sm tracking-widest">
                    AD
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Rendering Area */}
          <main className="flex-1 p-6 lg:p-10 overflow-auto">{children}</main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
