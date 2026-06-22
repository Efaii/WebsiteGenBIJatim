"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  GraduationCap,
  Building2,
  Calendar,
  AlertCircle,
  Filter
} from "lucide-react";
import { useAdminAwardees } from "@/hooks/useAdminAwardees";
import { AwardeeModal } from "@/components/admin/AwardeeModal";

/**
 * @page AdminAwardeesPage
 * @description Administrative page for managing the Awardee database.
 */
export default function AdminAwardeesPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  const {
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
  } = useAdminAwardees(selectedPeriod);

  const availablePeriods = ["Semua", ...Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 3 + i;
    return `${year}/${year + 1}`;
  })];

  // Auto-set default period based on organization activePeriod
  useEffect(() => {
    if (organizations.length > 0 && !selectedPeriod) {
      // Find the first organization that has an activePeriod set
      const orgWithPeriod = organizations.find(o => (o as any).activePeriod);
      if (orgWithPeriod) {
        setSelectedPeriod((orgWithPeriod as any).activePeriod);
      }
    }
  }, [organizations, selectedPeriod]);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/30">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 bg-white p-8 rounded-[3rem] border border-blue-100 shadow-xl shadow-blue-900/5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Database Awardee</h1>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] ml-1">Pilih periode untuk memfilter dan menambah data</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative group">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="pl-14 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-black text-slate-700 appearance-none min-w-[220px]"
            >
              {availablePeriods.map(p => (
                <option key={p} value={p}>{p === "Semua" ? "Semua Periode" : `Periode ${p}`}</option>
              ))}
            </select>
            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
          </div>

          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="group flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-blue-200 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>Tambah Awardee</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
               <Users className="w-7 h-7" />
            </div>
            <div>
               <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Total Awardee</p>
               <h3 className="text-2xl font-black text-slate-800">{filteredAwardees.length}</h3>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
               <Building2 className="w-7 h-7" />
            </div>
            <div>
               <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Komisariat Terlibat</p>
               <h3 className="text-2xl font-black text-slate-800">{new Set(filteredAwardees.map(a => a.organizationProfileId)).size}</h3>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
               <GraduationCap className="w-7 h-7" />
            </div>
            <div>
               <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Status Data</p>
               <h3 className="text-sm font-black text-slate-700">Terverifikasi BI</h3>
            </div>
         </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-blue-500" />
          <input 
            type="text"
            placeholder="Cari nama atau jurusan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50/50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white border border-transparent focus:border-blue-500 transition-all font-medium text-slate-700" 
          />
        </div>
        <div className="relative w-full md:w-72">
           <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
           <select
             value={selectedOrgId}
             onChange={(e) => setSelectedOrgId(e.target.value)}
             className="w-full pl-12 pr-6 py-4 bg-slate-50/50 rounded-2xl border border-transparent focus:border-blue-500 outline-none transition-all font-bold text-xs uppercase tracking-widest appearance-none"
           >
              <option value="all">Semua Komisariat</option>
              {organizations
                .filter(org => org.type !== 'KOORDINATOR')
                .map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
           </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Diri</th>
                <th className="px-8 py-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Pendidikan</th>
                <th className="px-8 py-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Komisariat / Angkatan</th>
                <th className="px-8 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                   <td colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                         <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                         <p className="text-slate-400 font-bold animate-pulse">Memuat data awardee...</p>
                      </div>
                   </td>
                </tr>
              ) : filteredAwardees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="max-w-xs mx-auto space-y-4">
                       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                          <AlertCircle className="w-10 h-10 text-slate-300" />
                       </div>
                       <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Tidak ada data ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAwardees.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg">
                        {item.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-lg group-hover:text-blue-600 transition-colors capitalize">{item.name}</span>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">{item.id.split('-')[0]}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col gap-1 items-center">
                       <span className="text-slate-700 font-black text-sm uppercase tracking-tight">{item.university}</span>
                       <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{item.major}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col gap-1.5 items-center">
                       <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                         {(item as any).organization?.name || "General"}
                       </span>
                       <div className="flex items-center gap-2">
                         <div className="flex items-center gap-1.5 text-slate-400">
                           <Calendar className="w-3 h-3" />
                           <span className="text-[10px] font-bold uppercase tracking-widest">BATCH {item.batch}</span>
                         </div>
                         <span className="text-slate-300">|</span>
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.period || "All"}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end items-center gap-3">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-3 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-2xl transition-all shadow-sm"
                        title="Edit Awardee"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl transition-all shadow-sm"
                        title="Hapus Awardee"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AwardeeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingItem={editingItem}
        organizations={organizations}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
