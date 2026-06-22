"use client";

import { X, Camera, Scissors } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { getAssetUrl } from "@/lib/utils";
import { ImageCropperModal } from "./ImageCropperModal";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingMember: any;
  formData: {
    name: string;
    role: string;
    university: string;
    instagram: string;
    linkedin: string;
    order: number | "";
  };
  setFormData: (data: any) => void;
  imagePreview: string | null;
  setImageFile: (file: File) => void;
  setImagePreview: (preview: string) => void;
  isSaving: boolean;
}

export function MemberModal({
  isOpen,
  onClose,
  onSubmit,
  editingMember,
  formData,
  setFormData,
  imagePreview,
  setImageFile,
  setImagePreview,
  isSaving
}: MemberModalProps) {
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], "profile.jpg", { type: "image/jpeg" });
    setImageFile(croppedFile);
    setImagePreview(URL.createObjectURL(croppedBlob));
    setIsCropperOpen(false);
    setTempImage(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0e2f5a]">{editingMember ? "Edit Anggota" : "Tambah Anggota"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="relative group cursor-pointer w-28 h-28">
              <div className="w-full h-full rounded-3xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400">
                {imagePreview ? (
                  <Image 
                    src={imagePreview.startsWith("blob:") ? imagePreview : getAssetUrl(imagePreview) || ""} 
                    alt="" 
                    fill 
                    unoptimized
                    className="object-cover" 
                  />
                ) : (
                  <Camera className="w-8 h-8 text-slate-300" />
                )}
              </div>
               <label className="absolute inset-0 cursor-pointer opacity-0">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </label>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto Profil</p>
              {imagePreview && (
                <button 
                  type="button"
                  onClick={() => {
                    if (imagePreview) {
                        setTempImage(imagePreview.startsWith('blob:') ? imagePreview : getAssetUrl(imagePreview));
                        setIsCropperOpen(true);
                    }
                  }}
                  className="mt-1 flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Scissors className="w-3 h-3" /> Edit Foto
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Nama Lengkap</label>
            <input 
              type="text" 
              required 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Jabatan</label>
              <input 
                type="text" 
                required 
                value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value})} 
                placeholder="Misal: Ketua" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Urutan (Posisi)</label>
              <input 
                type="number" 
                min={1}
                value={formData.order} 
                onChange={(e) => setFormData({...formData, order: e.target.value === "" ? "" : Math.max(1, parseInt(e.target.value) || 1)})} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Universitas / Kampus</label>
            <input 
              type="text" 
              value={formData.university} 
              onChange={(e) => setFormData({...formData, university: e.target.value})} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Instagram (Username)</label>
              <input 
                type="text" 
                value={formData.instagram} 
                onChange={(e) => setFormData({...formData, instagram: e.target.value})} 
                placeholder="@username" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Linkedin (URL/Name)</label>
              <input 
                type="text" 
                value={formData.linkedin} 
                onChange={(e) => setFormData({...formData, linkedin: e.target.value})} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none" 
              />
            </div>
          </div>

          <button type="submit" disabled={isSaving} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:-translate-y-0.5">
            {editingMember ? "Simpan Perubahan" : "Tambahkan Anggota"}
          </button>
        </form>
      </div>

      {tempImage && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          image={tempImage}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setIsCropperOpen(false);
            setTempImage(null);
          }}
        />
      )}
    </div>
  );
}
