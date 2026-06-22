"use client";

import { X } from "lucide-react";

interface DivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingDiv: any;
  formData: {
    title: string;
    subtitle: string;
    accent: string;
    order: number | "";
  };
  setFormData: (data: any) => void;
  isSaving: boolean;
}

export function DivisionModal({
  isOpen,
  onClose,
  onSubmit,
  editingDiv,
  formData,
  setFormData,
  isSaving
}: DivisionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center text-slate-900">
          <h2 className="text-xl font-bold text-[#0e2f5a]">{editingDiv ? "Edit Divisi" : "Tambah Divisi"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Nama Divisi</label>
            <input 
              type="text" 
              required 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Sub-judul / Tagline / Deskripsi</label>
            <textarea 
              rows={3} 
              value={formData.subtitle} 
              onChange={(e) => setFormData({...formData, subtitle: e.target.value})} 
              placeholder="Ceritakan singkat tentang divisi ini..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 resize-none leading-relaxed" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Warna Aksen</label>
              <select 
                value={formData.accent} 
                onChange={(e) => setFormData({...formData, accent: e.target.value})} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none"
              >
                <option value="#2563eb">Biru GenBI</option>
                <option value="#0e2f5a">Navy Deep</option>
                <option value="#dc2626">Merah</option>
                <option value="#fbbf24">Kuning</option>
                <option value="#059669">Hijau</option>
                <option value="#64748b">Slate Grey</option>
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
            {editingDiv ? "Update Divisi" : "Simpan Divisi"}
          </button>
        </form>
      </div>
    </div>
  );
}
