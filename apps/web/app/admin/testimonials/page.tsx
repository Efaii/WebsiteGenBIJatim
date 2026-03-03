"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  UploadCloud,
  Image as ImageIcon,
} from "lucide-react";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  AdminTestimonialItem,
} from "@/services/testimonial.service";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminTestimonialPage() {
  const [items, setItems] = useState<AdminTestimonialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminTestimonialItem | null>(
    null,
  );

  // Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getTestimonials();
      setItems(data);
      setError("");
    } catch (err: any) {
      if (err.message === "Unauthorized") {
        localStorage.removeItem("token");
        router.push("/admin/login");
      } else {
        setError("Gagal memuat data Testimoni.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setName("");
    setRole("");
    setQuote("");
    setImageFile(null);
    setPreviewUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminTestimonialItem) => {
    setEditingItem(item);
    setName(item.name);
    setRole(item.role);
    setQuote(item.quote);
    setImageFile(null);
    setPreviewUrl(
      item.image.startsWith("/uploads")
        ? `http://localhost:5000${item.image}`
        : item.image
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Live Preview
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem && !imageFile) {
      alert("Gambar wajib diunggah untuk testimoni baru!");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("role", role);
      formData.append("quote", quote);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingItem) {
        await updateTestimonial(editingItem.id, formData);
      } else {
        await createTestimonial(formData);
      }

      await fetchData();
      closeModal();
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus Testimoni ini beserta gambarnya?",
      )
    )
      return;
    try {
      await deleteTestimonial(id);
      await fetchData();
    } catch (err) {
      alert("Gagal menghapus Testimoni.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0e2f5a]">
            Kelola Testimoni
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Daftar ulasan dari para Awardee GenBI Jatim.
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Tambah Testimoni
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-20">Foto</th>
                <th className="px-6 py-4">Nama & Peran</th>
                <th className="px-6 py-4 hidden md:table-cell">Kutipan</th>
                <th className="px-6 py-4 w-32 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <div className="inline-block w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Memuat baris data...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-500 font-medium"
                  >
                    Belum ada data Testimoni.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 relative">
                        {item.image.startsWith("/uploads/") ? (
                          <Image
                            src={`http://localhost:5000${item.image}`}
                            alt={item.name}
                            fill
                            sizes="48px"
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="48px"
                            unoptimized
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#0e2f5a]">
                        {item.name}
                      </div>
                      <div className="text-xs text-blue-600 md:text-slate-500 mt-0.5">
                        {item.role}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell truncate max-w-sm italic">
                      &ldquo;{item.quote}&rdquo;
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-xl font-bold text-[#0e2f5a]">
                {editingItem ? "Edit Testimoni" : "Tambah Testimoni"}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Photo Upload Section */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Foto / Avatar
                </label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        unoptimized
                        sizes="96px"
                        className="object-cover group-hover:opacity-75 transition-opacity"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                    {previewUrl && (
                      <div
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold cursor-pointer transition-opacity"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Ubah Foto
                      </div>
                    )}
                  </div>

                  <div className="flex bg flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <UploadCloud className="w-4 h-4" /> Unggah File
                    </button>
                    <p className="text-xs text-slate-500">
                      Format: JPG, PNG, WEBP. Maks: 5MB.
                      <br />
                      Disarankan: Rasio 1:1 (Persegi)
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Peran / Jabatan
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="GenBI 2023 • Designer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Kutipan / Testimoni
                </label>
                <textarea
                  required
                  rows={4}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none italic"
                  placeholder='"Berada di lingkungan ini mengubah sudut pandang saya..."'
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md transition-all ${isSaving ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5"}`}
                >
                  {isSaving ? "Mengunggah..." : "Simpan Testimoni"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
