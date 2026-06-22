"use client";

import { useState, useEffect } from "react";
import { 
  Awardee, 
  getAllAwardees, 
  createAwardee, 
  updateAwardee, 
  deleteAwardee 
} from "@/lib/services/awardee.service";
import { getAllProfiles } from "@/lib/services/profile.service";
import { OrganizationProfile } from "@repo/types";

/**
 * @hook useAdminAwardees
 * @description Logic handler for administrative awardee management.
 */
export function useAdminAwardees(selectedPeriod: string) {
  const [awardees, setAwardees] = useState<Awardee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Awardee | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationProfile[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("all");

  const [formData, setFormData] = useState<any>({
    name: "",
    university: "",
    major: "",
    batch: "",
    period: selectedPeriod,
    organizationProfileId: "" 
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Auto-sync university when organization changes
  useEffect(() => {
    if (formData.organizationProfileId && organizations.length > 0) {
      const selectedOrg = organizations.find(org => org.id === formData.organizationProfileId);
      if (selectedOrg && selectedOrg.university !== formData.university) {
        setFormData((prev: any) => ({ ...prev, university: selectedOrg.university }));
      }
    }
  }, [formData.organizationProfileId, organizations]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [awardeesData, orgsData] = await Promise.all([
        getAllAwardees(),
        getAllProfiles()
      ]);
      setAwardees(awardeesData);
      setOrganizations(orgsData);
      
      if (orgsData.length > 0 && !formData.organizationProfileId) {
        const activeP = orgsData.find(o => (o as any).activePeriod)?.activePeriod;
        setFormData((prev: any) => ({ 
          ...prev, 
          period: selectedPeriod && selectedPeriod !== "Semua" ? selectedPeriod : (activeP || prev.period)
        }));
      }
    } catch (error) {
      console.error("Failed to fetch awardees:", error);
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
        // Find the first organization that has an activePeriod set
        const orgWithPeriod = organizations.find(o => (o as any).activePeriod);
        if (orgWithPeriod) {
          setFormData((prev: any) => ({ ...prev, period: (orgWithPeriod as any).activePeriod }));
        }
      }
    }
  }, [selectedPeriod, editingItem, organizations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return alert("Harap isi nama awardee!");
    if (!formData.organizationProfileId) return alert("Harap pilih organisasi!");

    try {
      if (editingItem) {
        await updateAwardee(editingItem.id, formData);
      } else {
        await createAwardee(formData);
      }
      setIsModalOpen(false);
      resetForm();
      fetchInitialData();
    } catch (error: any) {
      console.error("Failed to save awardee:", error);
      alert("Gagal menyimpan data awardee.");
    }
  };

  const handleEdit = (item: Awardee) => {
    setEditingItem(item);
    setFormData({ 
      name: item.name,
      university: item.university,
      major: item.major,
      batch: item.batch,
      period: item.period,
      organizationProfileId: item.organizationProfileId
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data awardee ini?")) {
      try {
        await deleteAwardee(id);
        fetchInitialData();
      } catch (error) {
        console.error("Failed to delete awardee:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      university: "",
      major: "",
      batch: "",
      period: selectedPeriod && selectedPeriod !== "Semua" ? selectedPeriod : "",
      organizationProfileId: ""
    });
    setEditingItem(null);
  };

  const filteredAwardees = awardees.filter(item => {
    const matchesSearch = (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.major || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPeriod = selectedPeriod === "Semua" || item.period === selectedPeriod;
    const matchesOrg = selectedOrgId === "all" || item.organizationProfileId === selectedOrgId;
    return matchesSearch && matchesPeriod && matchesOrg;
  });

  return {
    awardees,
    loading,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    organizations,
    selectedOrgId,
    setSelectedOrgId,
    formData,
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    filteredAwardees
  };
}
