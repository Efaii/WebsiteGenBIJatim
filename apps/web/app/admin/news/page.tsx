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
  getAdminNews,
  createNews,
  updateNews,
  deleteNews,
  AdminNewsItem,
} from "@/services/news.service";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminNewsPage() {
  const [items, setItems] = useState<AdminNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminNewsItem | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
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
      const data = await getAdminNews();
      setItems(data);
      setError("");
    } catch (err: any) {
      if (err.message === "Unauthorized") {
        localStorage.removeItem("token");
        router.push("/admin/login");
      } else {
        setError("Gagal memuat data Berita.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setTitle("");
    setAuthor(
      localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") as string).name
        : "Admin",
    );
    setContent("");
    setImageFile(null);
    setPreviewUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminNewsItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setAuthor(item.author);
    setContent(item.content);
    setImageFile(null);
    setPreviewUrl(`http://localhost:5000${item.image}`);
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
      alert("Gambar sampul (Cover) wajib diunggah untuk berita baru!");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("content", content);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingItem) {
        await updateNews(editingItem.id, formData);
      } else {
        await createNews(formData);
      }

      await fetchData();
      closeModal();
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan berita.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus Berita ini beserta file gambarnya secara permanen?",
      )
    )
      return;
    try {
      await deleteNews(id);
      await fetchData();
    } catch (err) {
      alert("Gagal menghapus Berita.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0e2f5a]">
            Kelola Berita / Artikel
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Publikasi aktivitas dan artikel terbaru GenBI Jatim.
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Tulis Berita
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
                <th className="px-6 py-4 w-32">Cover</th>
                <th className="px-6 py-4 min-w-[300px]">Judul & Slug</th>
                <th className="px-6 py-4 w-40">Penulis</th>
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
                    <p>Memuat database berita...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-500 font-medium"
                  >
                    Belum ada karya jurnalistik yang terbit.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 relative">
                        <Image
                          src={`http://localhost:5000${item.image}`}
                          alt={item.title}
                          fill
                          sizes="96px"
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0e2f5a] truncate max-w-sm">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate max-w-sm">
                        /{item.slug}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {item.author}
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 min-h-screen overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 my-8 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-[#0e2f5a]">
                {editingItem ? "Edit Artikel" : "Tulis Artikel Baru"}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6 overflow-y-auto"
            >
              {/* Photo Upload Section */}
              <div className="grid md:grid-cols-[200px_1fr] gap-6 items-start">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Cover Artikel
                  </label>
                  <div
                    className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden relative group cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        unoptimized
                        sizes="200px"
                        className="object-cover group-hover:opacity-75 transition-opacity"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-blue-500">
                        <UploadCloud className="w-8 h-8" />
                        <span className="text-xs font-semibold">
                          Unggah Foto (16:9)
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleImageChange}
                  />
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Maks: 20MB. Format WebP didukung.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Judul Artikel
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 text-lg font-bold border border-slate-300 text-[#0e2f5a] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Masukkan judul liputan yang menarik..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Nama Penulis / Jurnalis
                    </label>
                    <input
                      type="text"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Divisi Jurnalistik GenBI"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Konten Berita
                </label>
                <textarea
                  required
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none leading-relaxed"
                  placeholder="Ketik isi berita selengkapnya di sini..."
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 flex-shrink-0">
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
                  {isSaving ? "Menerbitkan..." : "Terbitkan Artikel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
