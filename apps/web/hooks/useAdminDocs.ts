"use client";

import { useState, useEffect } from "react";
import { 
  Document, 
  getAdminDocuments, 
  createDocument, 
  updateDocument, 
  deleteDocument 
} from "@/lib/services/document.service";
import { getAllProfiles } from "@/lib/services/profile.service";
import { OrganizationProfile } from "@repo/types";

/**
 * @hook useAdminDocs
 * @description Logic handler for administrative document management.
 */
export function useAdminDocs(selectedPeriod: string) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Document | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationProfile[]>([]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"file" | "link">("file");
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  
  const presetCategories = [
    "Arsip", "Panduan", "Template", "Laporan", "SK", "SOP", 
    "Materi", "Proposal", "LPJ", "Legalitas", "Internal", 
    "Kegiatan", "Edukasi", "Umum"
  ];
  const dynamicCategories = Array.from(new Set([...presetCategories, ...docs.map(d => d.category || "")])).filter(Boolean).sort();

  const [formData, setFormData] = useState<any>({
    title: "",
    type: "",
    fileType: "",
    size: "0 MB",
    date: "",
    category: "",
    period: "",
    url: "",
    isPublic: false,
    organizationProfileId: ""
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [docsData, orgsData] = await Promise.all([
        getAdminDocuments(),
        getAllProfiles()
      ]);
      setDocs(docsData);
      setOrganizations(orgsData);
      
      if (orgsData.length > 0 && !formData.organizationProfileId) {
        setFormData((prev: any) => ({ 
          ...prev, 
          period: selectedPeriod || orgsData[0].activePeriod || prev.period
        }));
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sync period when selectedPeriod changes (only for new items)
  useEffect(() => {
    if (!editingItem) {
      if (selectedPeriod && selectedPeriod !== "Semua") {
        setFormData((prev: any) => ({ ...prev, period: selectedPeriod }));
      } else if (organizations.length > 0) {
        const orgWithPeriod = organizations.find(o => (o as any).activePeriod);
        if (orgWithPeriod) {
          setFormData((prev: any) => ({ ...prev, period: (orgWithPeriod as any).activePeriod }));
        }
      }
    }
  }, [selectedPeriod, editingItem, organizations]);

  const handleTypeChange = (newType: string) => {
    const typeToCategory: Record<string, string> = {
      'SK': 'Legalitas',
      'LPJ': 'Laporan',
      'PROPOSAL': 'Kegiatan',
      'MATERI': 'Edukasi',
      'SOP': 'Internal',
      'DOKUMENTASI': 'Kegiatan',
      'TEMPLATE': 'Template',
      'PANDUAN': 'Panduan',
      'LAINNYA': 'Umum'
    };

    const suggestedCategory = typeToCategory[newType.toUpperCase()];
    setFormData((prev: any) => ({
      ...prev,
      type: newType,
      category: (!isOtherCategory && suggestedCategory) ? suggestedCategory : prev.category
    }));
  };

  const handleCategoryChange = (newCategory: string) => {
    const categoryToType: Record<string, string> = {
      // Business Aliases
      'LEGALITAS': 'SK',
      'LAPORAN': 'LPJ',
      'KEGIATAN': 'PROPOSAL',
      'EDUKASI': 'Materi',
      'INTERNAL': 'SOP',
      
      // Explicit Type Names (if used as category labels)
      'SK': 'SK',
      'LPJ': 'LPJ',
      'PROPOSAL': 'PROPOSAL',
      'MATERI': 'Materi',
      'SOP': 'SOP',
      'PANDUAN': 'Panduan',
      'TEMPLATE': 'Template',
      'DOKUMENTASI': 'Dokumentasi',
      
      'ARSIP': 'Dokumentasi',
      'UMUM': 'Lainnya'
    };

    const suggestedType = categoryToType[newCategory.toUpperCase()];
    setFormData((prev: any) => ({
      ...prev,
      category: newCategory,
      type: suggestedType || prev.type
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Front-end Pre-validation
    if (!formData.organizationProfileId) {
      alert("Harap pilih organisasi terkait!");
      return;
    }
    if (!formData.title?.trim()) {
      alert("Harap isi judul dokumen!");
      return;
    }

    try {
      const data = new FormData();
      data.append("title", formData.title || "");
      data.append("type", formData.type || "");
      data.append("date", formData.date || "");
      data.append("category", formData.category || "");
      data.append("period", formData.period || "");
      data.append("isPublic", String(formData.isPublic));
      data.append("organizationProfileId", formData.organizationProfileId);
      
      if (uploadMethod === "file") {
        if (selectedFile) {
          // Client-side size validation (20MB limit)
          if (selectedFile.size > 20 * 1024 * 1024) {
            alert("Ukuran file terlalu besar! Maksimal 20MB.");
            return;
          }
          data.append("file", selectedFile);
        } else if (editingItem) {
          // If editing and no new file, keep existing one
          data.append("url", formData.url || "");
          data.append("fileType", formData.fileType || "");
          data.append("size", formData.size || "");
        } else {
          alert("Silakan pilih file untuk diupload!");
          return;
        }
      } else if (uploadMethod === "link") {
        if (!formData.url) {
          alert("Harap masukkan link dokumen!");
          return;
        }
        
        // Simple validation for size (must contain number and unit like MB/KB or be "External")
        const sizeStr = formData.size?.trim();
        if (sizeStr && sizeStr !== "External" && !/^\d+(\.\d+)?\s*(MB|KB|GB|B|LINK)$/i.test(sizeStr)) {
          alert("Format ukuran tidak valid! Gunakan format seperti '2.5 MB' atau 'External'.");
          return;
        }

        data.append("url", formData.url);
        data.append("fileType", formData.fileType || "LINK");
        data.append("size", formData.size || "External");
      }

      if (editingItem) {
        await updateDocument(editingItem.id, data);
      } else {
        await createDocument(data);
      }
      setIsModalOpen(false);
      resetForm();
      fetchInitialData();
    } catch (error: any) {
      console.error("Failed to save document:", error);
      const resData = error.response?.data;
      const msg = resData?.message || error.message || "Gagal menyimpan dokumen.";
      const details = resData?.details ? `\n\nDetails: ${JSON.stringify(resData.details, null, 2)}` : "";
      const stack = resData?.stack ? `\n\nStack: ${resData.stack}` : "";
      
      alert(`Error: ${msg}${details}${stack}`);
    }
  };

  const handleEdit = (item: Document) => {
    setEditingItem(item);
    setFormData({ ...item });
    setUploadMethod(item.url?.startsWith('/uploads') ? "file" : "link");
    setIsOtherCategory(!presetCategories.includes(item.category || ""));
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) {
      try {
        await deleteDocument(id);
        fetchInitialData();
      } catch (error) {
        console.error("Failed to delete document:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "",
      fileType: "",
      size: "0 MB",
      date: "",
      category: "",
      period: selectedPeriod,
      url: "",
      isPublic: false,
      organizationProfileId: organizations[0]?.id || ""
    });
    setUploadMethod("file");
    setIsOtherCategory(false);
    setSelectedFile(null);
    setEditingItem(null);
  };

  const filteredDocs = docs.filter(item => {
    const matchesSearch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.category || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPeriod = selectedPeriod === "Semua" || item.period === selectedPeriod;
    return matchesSearch && matchesPeriod;
  });

  return {
    docs,
    loading,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
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
    handleSubmit,
    handleEdit,
    handleDelete,
    handleTypeChange,
    handleCategoryChange,
    resetForm,
    filteredDocs
  };
}
