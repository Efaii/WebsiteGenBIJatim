"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, Download } from "lucide-react";
import { OrganizationProfile } from "@repo/types";
import { Document } from "@/lib/services/document.service";

interface DocModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: Document | null;
  organizations: OrganizationProfile[];
  formData: Partial<Document>;
  setFormData: (data: any) => void;
  uploadMethod: "file" | "link";
  setUploadMethod: (method: "file" | "link") => void;
  isOtherCategory: boolean;
  setIsOtherCategory: (val: boolean) => void;
  dynamicCategories: string[];
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  handleTypeChange: (type: string) => void;
  handleCategoryChange: (category: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function DocModal({
  isOpen,
  onClose,
  editingItem,
  organizations,
  formData,
  setFormData,
  uploadMethod,
  setUploadMethod,
  isOtherCategory,
  setIsOtherCategory,
  dynamicCategories,
  selectedFile,
  setSelectedFile,
  handleTypeChange,
  handleCategoryChange,
  onSubmit
}: DocModalProps) {
  const sensitiveKeywords = ['lpj', 'evaluasi', 'internal', 'rapat', 'pertanggungjawaban', 'keuangan'];
  const isSensitive = sensitiveKeywords.some(word => 
    (formData.title || '').toLowerCase().includes(word) || 
    (formData.category || '').toLowerCase().includes(word) ||
    formData.type === 'LPJ'
  );

  // Auto-set to private if sensitive (Safe via useEffect)
  useEffect(() => {
    if (isOpen && isSensitive && formData.isPublic) {
      setFormData((prev: any) => ({ ...prev, isPublic: false }));
    }
  }, [isOpen, isSensitive, formData.isPublic, setFormData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-full overflow-hidden flex flex-col border border-white/20 animate-in slide-in-from-bottom-8 duration-500">
        {/* Modal Header */}
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-white">
          <div>
            <h3 className="text-2xl font-black text-slate-900">{editingItem ? "Edit Dokumen" : "Tambah Dokumen"}</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Metode Hybrid: Simpan di Server atau Link Drive</p>
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
           {/* Method Toggles */}
           <div className="flex p-1.5 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setUploadMethod("file")}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${uploadMethod === "file" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod("link")}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${uploadMethod === "link" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                Link Eksternal
              </button>
           </div>

            {/* Organization & Period Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Organisasi Terkait</label>
                  <select 
                    required
                    value={formData.organizationProfileId || ""}
                    onChange={(e) => setFormData({...formData, organizationProfileId: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none"
                  >
                    <option value="" disabled>Pilih Organisasi</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
               </div>
               <div className="space-y-3 opacity-50 grayscale pointer-events-none">
                  <label className="text-xs font-black text-blue-600 uppercase tracking-widest ml-1">Periode Kepengurusan</label>
                  <input 
                    readOnly
                    value={formData.period || ""}
                    className="w-full px-5 py-4 bg-blue-50/50 border border-blue-200 rounded-2xl outline-none font-bold"
                  />
               </div>
            </div>

           {/* Conditional Input Rendering */}
           {uploadMethod === "file" ? (
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Pilih File (Server Storage)</label>
                <div className={`relative group border-2 border-dashed ${selectedFile ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 bg-slate-50'} rounded-[2rem] p-8 transition-all hover:border-blue-400`}>
                  <input 
                    type="file"
                    id="file-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.docx,.doc,.xls,.xlsx,.zip"
                  />
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <div className={`p-4 rounded-2xl ${selectedFile ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                      <Download className="w-8 h-8" />
                    </div>
                    <div>
                      {selectedFile ? (
                        <>
                          <p className="text-blue-600 font-black text-sm mb-1">{selectedFile.name}</p>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Klik untuk ganti</p>
                        </>
                      ) : (
                        <>
                          <p className="text-slate-700 font-black text-sm mb-1">Pilih file untuk disimpan di server</p>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">PDF, Office, ZIP (Maks. 20MB)</p>
                        </>
                    )}
                    </div>
                  </div>
                </div>
              </div>
           ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">URL / Link Dokumen (Drive/Cloud)</label>
                  <input 
                    required
                    type="url"
                    value={formData.url || ""}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-5 py-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium" 
                  />
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Format (Pilih dari List)</label>
                      <select 
                        required={uploadMethod === "link"}
                        value={formData.fileType || ""}
                        onChange={(e) => setFormData({...formData, fileType: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none"
                      >
                        <option value="" disabled>Pilih Format</option>
                        <option value="PDF">PDF</option>
                        <option value="DOCX">DOCX</option>
                        <option value="XLSX">XLSX</option>
                        <option value="ZIP">ZIP</option>
                        <option value="JPG">JPG</option>
                        <option value="PNG">PNG</option>
                        <option value="MP4">MP4</option>
                        <option value="LINK">LINK</option>
                      </select>
                    </div>
                </div>
              </div>
           )}

           {/* Shared Info Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Judul Dokumen</label>
                <input 
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Contoh: Modul Pelatihan"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                <div className="flex flex-col gap-2">
                   <select 
                     value={isOtherCategory ? "Lainnya" : (formData.category || "")}
                     onChange={(e) => {
                       const val = e.target.value;
                       if (val === "Lainnya") {
                         setIsOtherCategory(true);
                         handleTypeChange("Lainnya");
                       } else {
                         setIsOtherCategory(false);
                         handleCategoryChange(val);
                       }
                     }}
                     className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none"
                   >
                     <option value="" disabled>Pilih Kategori</option>
                     {dynamicCategories.map(cat => (
                       <option key={cat} value={cat}>{cat}</option>
                     ))}
                     <option value="Lainnya" className="text-blue-600 font-bold">+ Tambah Kategori Baru</option>
                   </select>
                   {isOtherCategory && (
                     <input 
                       required
                       type="text"
                       value={formData.category || ""}
                       onChange={(e) => setFormData({...formData, category: e.target.value})}
                       placeholder="Ketik kategori baru..."
                       className="w-full px-5 py-4 bg-blue-50/50 border border-blue-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium animate-in slide-in-from-top-2" 
                     />
                   )}
                </div>
              </div>
           </div>

           {/* Type & Date Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tipe Dokumen</label>
                <select 
                  required
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none"
                >
                  <option value="" disabled>Pilih Tipe</option>
                  <option value="SOP">SOP</option>
                  <option value="SK">SK</option>
                  <option value="LPJ">LPJ</option>
                  <option value="PROPOSAL">PROPOSAL</option>
                  <option value="Materi">Materi</option>
                  <option value="Template">Template</option>
                  <option value="Panduan">Panduan</option>
                  <option value="Dokumentasi">Dokumentasi</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Terbit</label>
                <input 
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" 
                />
              </div>
           </div>

           {/* Access Level Toggle */}
           <div className={`p-6 rounded-3xl border transition-all flex items-center justify-between group ${isSensitive ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-100'}`}>
               <div className="flex items-center gap-4">
                 <div className={`p-3 rounded-2xl ${formData.isPublic ? 'bg-emerald-50 text-emerald-600' : (isSensitive ? 'bg-amber-100 text-amber-600' : 'bg-red-50 text-red-600')}`}>
                   {formData.isPublic ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
                 </div>
                 <div>
                   <h4 className="font-black text-slate-800 text-sm">Visibilitas Publik</h4>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-tight mt-0.5">
                     {isSensitive 
                        ? "Terdeteksi sebagai dokumen sensitif. Tidak dapat dipublikasikan." 
                        : (formData.isPublic ? "Dapat dilihat oleh semua pengunjung" : "Terbatas untuk Admin/Pembina")}
                   </p>
                 </div>
               </div>
               <button
                 type="button"
                 disabled={isSensitive}
                 onClick={() => setFormData({...formData, isPublic: !formData.isPublic})}
                 className={`w-14 h-8 rounded-full transition-all relative ${isSensitive ? 'bg-slate-200 cursor-not-allowed opacity-50' : (formData.isPublic ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-300')}`}
               >
                 <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.isPublic ? 'left-7' : 'left-1'}`} />
               </button>
            </div>

           {/* Modal Footer (Inner) */}
           <div className="pt-6 flex flex-col md:flex-row gap-4">
              <button 
                type="submit"
                className="flex-1 px-8 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                {editingItem ? "Update Dokumen" : "Simpan Dokumen"}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
