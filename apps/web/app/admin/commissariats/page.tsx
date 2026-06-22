"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Edit2, Trash2, Globe, Building2, 
  MapPin, GraduationCap, AlertCircle, Search,
  ChevronRight, ExternalLink
} from "lucide-react";
import { 
  getAllProfiles, 
  createProfile, 
  deleteProfile 
} from "@/lib/services/profile.service";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminCommissariatsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    university: "",
    type: "KOMISARIAT"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getAllProfiles();
      // Filter out Koordinator from this list if we want to manage it separately
      // but showing it here as "locked" or "special" is also fine.
      // For now, let's show everything but only allow adding/deleting Komisariat.
      setItems(data || []);
      setError("");
    } catch (err: any) {
      setError("Gagal memuat daftar komisariat.");
    } finally {
      setIsLoading(false);
    }
  };

  const openNewModal = () => {
    setFormData({
      name: "",
      slug: "",
      university: "",
      type: "KOMISARIAT"
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus komisariat "${name}"? Seluruh data (misi, divisi, anggota, proker) milik komisariat ini akan terhapus permanen!`)) return;
    try {
      await deleteProfile(id);
      await fetchData();
    } catch (err) {
      alert("Gagal menghapus komisariat.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await createProfile(formData);
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      alert("Gagal menambahkan komisariat. Pastikan Slug belum digunakan.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = items.filter(item => 
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.university.toLowerCase().includes(searchQuery.toLowerCase())) &&
    item.type !== 'KOORDINATOR'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0e2f5a]">Manajemen Komisariat</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola master data seluruh cabang GenBI di wilayah Jawa Timur.</p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Tambah Komisariat
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama komisariat atau universitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 animate-pulse">
              <div className="h-12 w-12 bg-slate-100 rounded-2xl"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white border border-dashed border-slate-300 rounded-3xl">
            <p className="text-slate-400 font-medium">Tidak ada komisariat ditemukan.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="group bg-white border border-slate-200 rounded-3xl p-6 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.type === 'KOORDINATOR' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'} group-hover:scale-110 transition-transform`}>
                  {item.type === 'KOORDINATOR' ? <Building2 className="w-7 h-7" /> : <GraduationCap className="w-7 h-7" />}
                </div>
                {item.type !== 'KOORDINATOR' && (
                  <button 
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#0e2f5a] text-lg leading-tight">{item.name}</h3>
                  {item.type === 'KOORDINATOR' && (
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Pusat</span>
                  )}
                </div>
                <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {item.university}
                </p>
                <p className="text-blue-500 text-xs font-bold font-mono mt-2">/{item.slug}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <Link 
                  href={`/about/${item.slug}`} 
                  target="_blank"
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                </Link>
                <Link 
                  href={item.type === 'KOORDINATOR' ? "/admin/profile" : `/admin/commissariats/${item.id}`}
                  className="flex items-center gap-2 bg-[#0e2f5a] hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Konten
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-xl font-bold text-[#0e2f5a]">Tambah Komisariat Baru</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Komisariat</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="GenBI Komisariat UNESA"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Slug (URL ID)</label>
                <input 
                  required
                  type="text" 
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  placeholder="unesa"
                />
                <p className="text-[10px] text-slate-400 mt-1 italic">* Digunakan untuk URL: /about/unesa</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Universitas / Kampus</label>
                <input 
                  required
                  type="text" 
                  value={formData.university}
                  onChange={(e) => setFormData({...formData, university: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Universitas Negeri Surabaya"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
