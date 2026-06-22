"use client";

import { X, CheckCircle2, User, GraduationCap, Building2, Calendar } from "lucide-react";
import { OrganizationProfile } from "@repo/types";
import { Awardee } from "@/lib/services/awardee.service";

interface AwardeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: Awardee | null;
  organizations: OrganizationProfile[];
  formData: Partial<Awardee>;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AwardeeModal({
  isOpen,
  onClose,
  editingItem,
  organizations,
  formData,
  setFormData,
  onSubmit
}: AwardeeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-full overflow-hidden flex flex-col border border-white/20 animate-in slide-in-from-bottom-8 duration-500">
        {/* Modal Header */}
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-white">
          <div>
            <h3 className="text-2xl font-black text-slate-900">{editingItem ? "Edit Awardee" : "Tambah Awardee"}</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Kelola data penerima beasiswa Bank Indonesia.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-2xl transition-all active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-10 py-8 space-y-8 scrollbar-hide">
           {/* Name Input */}
           <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <User className="w-3 h-3" /> Nama Lengkap
              </label>
              <input 
                required
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" 
              />
           </div>

           {/* Organization Selection */}
           <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Building2 className="w-3 h-3" /> Komisariat / Organisasi
              </label>
              <select 
                required
                value={formData.organizationProfileId || ""}
                onChange={(e) => setFormData({...formData, organizationProfileId: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none"
              >
                <option value="" disabled>Pilih Komisariat (Wajib)</option>
                {organizations
                  .filter(org => org.type !== 'KOORDINATOR')
                  .map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
              </select>
            </div>

           {/* University & Major Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <GraduationCap className="w-3 h-3" /> Universitas
                </label>
                <input 
                  readOnly
                  type="text"
                  value={formData.university || ""}
                  placeholder="Akan terisi otomatis..."
                  className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl outline-none font-bold text-slate-500 cursor-not-allowed" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <GraduationCap className="w-3 h-3" /> Jurusan
                </label>
                <input 
                  required
                  type="text"
                  value={formData.major || ""}
                  onChange={(e) => setFormData({...formData, major: e.target.value})}
                  placeholder="Contoh: Teknik Informatika"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" 
                />
              </div>
           </div>

           {/* Batch & Period Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                   <Calendar className="w-3 h-3" /> Angkatan / Batch
                 </label>
                 <select 
                   required
                   value={formData.batch || ""}
                   onChange={(e) => setFormData({...formData, batch: e.target.value})}
                   className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none"
                 >
                   <option value="" disabled>Pilih Angkatan</option>
                   {Array.from({ length: new Date().getFullYear() - 2024 + 2 }, (_, i) => {
                     const year = (new Date().getFullYear() + 1 - i).toString();
                     return <option key={year} value={year}>{year}</option>;
                   })}
                 </select>
              </div>
              <div className="space-y-3 opacity-50 grayscale pointer-events-none">
                 <label className="text-xs font-black text-blue-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                   <Calendar className="w-3 h-3" /> Periode Kepengurusan
                 </label>
                 <input 
                   readOnly
                   value={formData.period || ""}
                   className="w-full px-5 py-4 bg-blue-50/50 border border-blue-200 rounded-2xl outline-none font-bold"
                 />
              </div>
           </div>

           {/* Modal Footer (Inner) */}
           <div className="pt-6 flex flex-col md:flex-row gap-4">
              <button 
                type="submit"
                className="flex-1 px-8 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                {editingItem ? "Update Awardee" : "Simpan Awardee"}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
