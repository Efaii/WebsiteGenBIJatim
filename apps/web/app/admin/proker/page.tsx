
"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Calendar, 
  CheckCircle2, 
  FileText,
  Users,
  ExternalLink,
  Lock
} from "lucide-react";
import { 
  ProkerData, 
  getAdminProkers, 
  createProker, 
  updateProker, 
  deleteProker 
} from "@/lib/services/proker.service";
import { getAllProfiles } from "@/lib/services/profile.service";
import { OrganizationProfile } from "@repo/types";

export default function AdminProkerPage() {
  const [prokers, setProkers] = useState<ProkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<ProkerData | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationProfile[]>([]);

  const [formData, setFormData] = useState<any>({
    title: "",
    category: "",
    status: "PLANNED",
    dateInfo: "",
    description: "",
    proposalUrl: "",
    lpjUrl: "",
    organizationProfileId: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prokerData, orgData] = await Promise.all([
        getAdminProkers(),
        getAllProfiles()
      ]);
      setProkers(prokerData.prokers);
      setOrganizations(orgData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      title: "",
      category: "",
      status: "PLANNED",
      description: "",
      proposalUrl: "",
      lpjUrl: "",
      organizationProfileId: organizations[0]?.id || ""
    });
  };

  const handleEdit = (item: ProkerData) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (editingItem) {
        await updateProker(editingItem.id!.toString(), formData);
      } else {
        await createProker(formData);
      }
      await fetchData();
      closeModal();
    } catch (error) {
      console.error("Failed to save proker:", error);
      alert("Gagal menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus program kerja ini?")) return;
    try {
      await deleteProker(id);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete proker:", error);
    }
  };

  const filteredProkers = prokers.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[3.5rem] shadow-xl shadow-blue-900/5 border border-blue-50">
        <div>
          <h1 className="text-4xl font-black text-[#0e2f5a] tracking-tight">Manajemen Proker</h1>
          <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Data Program Kerja Seluruh Komisariat</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 px-8 py-4.5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span>Tambah Proker</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Cari proker atau divisi..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-600 font-medium"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">Detail Proker</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-slate-400 font-medium">Memuat data...</td>
                </tr>
              ) : filteredProkers.length > 0 ? (
                filteredProkers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-700 text-lg group-hover:text-blue-600 transition-colors">{item.title}</span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase bg-blue-50 w-fit px-2 py-0.5 rounded-md">
                          <Users className="w-3 h-3" />
                          <span>{item.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        item.status === "DONE" ? "bg-green-100 text-green-700" :
                        item.status === "ON_PROGRESS" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(item.id!.toString())} className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-slate-400 font-medium">Belum ada data program kerja</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="px-10 py-7 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
              <h2 className="text-2xl font-black text-[#0e2f5a] tracking-tight">
                {editingItem ? "Edit Proker" : "Tambah Proker"}
              </h2>
              <button onClick={closeModal} className="p-3 hover:bg-slate-50 rounded-full transition-all">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/20 p-10 space-y-8">
              <form id="proker-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Judul Program</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Divisi / Kategori</label>
                    <input 
                      type="text" 
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Organisasi</label>
                    <select 
                      required
                      value={formData.organizationProfileId}
                      onChange={(e) => setFormData({...formData, organizationProfileId: e.target.value})}
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold appearance-none"
                    >
                      <option value="">Pilih Organisasi</option>
                      {organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                    <select 
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold appearance-none"
                    >
                      <option value="PLANNED">Planned</option>
                      <option value="ON_PROGRESS">On Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Tanggal Proker (Teks)</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: 10 Jan 2025 atau Oct - Nov"
                      value={formData.dateInfo || ""}
                      onChange={(e) => setFormData({...formData, dateInfo: e.target.value})}
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Deskripsi & Detail Program</label>
                  <textarea 
                    required
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-3xl outline-none focus:border-blue-500 font-medium resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" /> Link Proposal
                    </label>
                    <input 
                      type="url"
                      value={formData.proposalUrl}
                      onChange={(e) => setFormData({...formData, proposalUrl: e.target.value})}
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5" /> Link LPJ
                    </label>
                    <input 
                      type="url"
                      value={formData.lpjUrl}
                      onChange={(e) => setFormData({...formData, lpjUrl: e.target.value})}
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="px-10 py-7 border-t border-slate-100 flex items-center justify-end gap-4 bg-slate-50 sticky bottom-0 z-20">
              <button onClick={closeModal} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 transition-all">
                Batal
              </button>
              <button 
                type="submit" 
                form="proker-form" 
                disabled={isSaving}
                className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {isSaving ? "Menyimpan..." : "Simpan Proker"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
