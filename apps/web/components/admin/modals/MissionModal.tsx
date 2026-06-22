"use client";

import { X } from "lucide-react";

interface MissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingMission: any;
  formData: {
    title: string;
    desc: string;
    icon: string;
    order: number | "";
  };
  setFormData: (data: any) => void;
  isSaving: boolean;
  iconOptions: { name: string; icon: any }[];
}

export function MissionModal({
  isOpen,
  onClose,
  onSubmit,
  editingMission,
  formData,
  setFormData,
  isSaving,
  iconOptions
}: MissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center text-slate-900">
          <h2 className="text-xl font-bold text-[#0e2f5a]">{editingMission ? "Edit Misi" : "Tambah Misi"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Judul Misi (Singkat)</label>
            <input 
              type="text" 
              required 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              placeholder="Misal: Pemberdayaan Masyarakat"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Deskripsi Lengkap</label>
            <textarea 
              rows={4} 
              required 
              value={formData.desc} 
              onChange={(e) => setFormData({...formData, desc: e.target.value})} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 resize-none leading-relaxed" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Ikon</label>
              <select 
                value={formData.icon} 
                onChange={(e) => setFormData({...formData, icon: e.target.value})} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none"
              >
                {iconOptions.map(opt => <option key={opt.name} value={opt.name}>{opt.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Urutan</label>
              <input 
                type="number" 
                min={1}
                value={formData.order} 
                onChange={(e) => setFormData({...formData, order: e.target.value === "" ? "" : Math.max(1, parseInt(e.target.value) || 1)})} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none" 
              />
            </div>
          </div>
          <button type="submit" disabled={isSaving} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:-translate-y-0.5">
            {editingMission ? "Update Misi" : "Simpan Misi"}
          </button>
        </form>
      </div>
    </div>
  );
}
