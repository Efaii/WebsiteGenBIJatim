"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Save, AlertCircle, Info, Landmark, GraduationCap, 
  Target, Plus, Edit2, Trash2, X, Network, Users, 
  BarChart3, Zap, Camera, Calendar
} from "lucide-react";
import { 
  getKorkomData, 
  updateProfile, 
  createMission, 
  updateMission, 
  deleteMission,
  getAllDivisions,
  createDivision,
  updateDivision,
  deleteDivision,
  createMember,
  updateMember,
  deleteMember,
  getAllProfiles
} from "@/lib/services/profile.service";
import { useRouter } from "next/navigation";
import { getAssetUrl } from "@/lib/utils";
import { Mission, Member as BPHMember } from "@repo/types";
import { MissionModal } from "@/components/admin/modals/MissionModal";
import { DivisionModal } from "@/components/admin/modals/DivisionModal";
import { MemberModal } from "@/components/admin/modals/MemberModal";
import { ConflictModal } from "@/components/admin/modals/ConflictModal";

interface DivisionWithMembers {
  id: string;
  title: string;
  subtitle?: string;
  accent: string;
  order: number;
  members: BPHMember[];
}

const ICON_OPTIONS = [
  { name: "Network", icon: Network },
  { name: "Users", icon: Users },
  { name: "BarChart3", icon: BarChart3 },
  { name: "Target", icon: Target },
  { name: "Zap", icon: Zap },
];

export default function AdminProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    university: "",
    description: "",
    vision: "",
    activePeriod: "2024/2025",
    id: ""
  });
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<"profile" | "missions" | "structure">("profile");

  // Organizational Structure State
  const [divisions, setDivisions] = useState<DivisionWithMembers[]>([]);
  
  // Division Modal State
  const [isDivModalOpen, setIsDivModalOpen] = useState(false);
  const [editingDiv, setEditingDiv] = useState<DivisionWithMembers | null>(null);
  const [divFormData, setDivFormData] = useState<{
    title: string;
    subtitle: string;
    accent: string;
    order: number | "";
  }>({
    title: "",
    subtitle: "",
    accent: "blue",
    order: 1,
  });

  // Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<BPHMember | null>(null);
  const [targetDivId, setTargetDivId] = useState<string | null>(null);
  const [memberFormData, setMemberFormData] = useState<{
    name: string;
    role: string;
    university: string;
    instagram: string;
    linkedin: string;
    order: number | "";
  }>({
    name: "",
    role: "",
    university: "",
    instagram: "",
    linkedin: "",
    order: 1,
  });
  const [memberImageFile, setMemberImageFile] = useState<File | null>(null);
  const [memberImagePreview, setMemberImagePreview] = useState<string | null>(null);

  // Mission Modal State
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [missionFormData, setMissionFormData] = useState<{
    title: string;
    desc: string;
    icon: string;
    order: number | "";
  }>({
    title: "",
    desc: "",
    icon: "Target",
    order: 1,
  });
  
  // Conflict Modal State
  const [conflictState, setConflictState] = useState<{
    isOpen: boolean;
    type: "mission" | "division" | "member";
    targetOrder: number;
    description: string;
    onResolve?: (mode: "keep" | "pushover") => void;
  }>({
    isOpen: false,
    type: "mission",
    targetOrder: 0,
    description: ""
  });

  // Generate management periods (3 back, 1 forward)
  const currentYear = new Date().getFullYear();
  const availablePeriods = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - 3 + i;
    return `${year}/${year + 1}`;
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (id?: string) => {
    setIsLoading(true);
    try {

      // 2. Fetch Korkom profile data explicitly
      const data = await getKorkomData(); // Default fetch is Korkom
      setFormData({
        name: data.name || "",
        university: data.university || "",
        description: data.description || "",
        vision: data.vision || "",
        activePeriod: data.activePeriod || "2024/2025",
        id: data.id || "",
      });
      setMissions(data.missions || []);
      
      const divs = await getAllDivisions(data.id);
      setDivisions(divs || []);
    } catch (err: any) {
      if (err.message?.includes("401")) {
        router.push("/admin/login");
      } else {
        setError("Gagal memuat profil organisasi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");
    
    try {
      await updateProfile(formData);
      setSuccess("Profil organisasi berhasil diperbarui!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const openNewMissionModal = () => {
    setEditingMission(null);
    setMissionFormData({
      title: "",
      desc: "",
      icon: "Target",
      order: missions.length + 1,
    });
    setIsMissionModalOpen(true);
  };

  const openEditMissionModal = (mission: Mission) => {
    setEditingMission(mission);
    setMissionFormData({
      title: mission.title,
      desc: mission.desc,
      icon: mission.icon,
      order: mission.order ?? 0,
    });
    setIsMissionModalOpen(true);
  };

  const handleMissionSubmit = async (e: React.FormEvent, forceMode?: "keep" | "pushover") => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const orderVal = missionFormData.order === "" ? 0 : Number(missionFormData.order);
      if (orderVal < 1) {
        setError("Urutan harus minimal 1.");
        return;
      }
      
      const conflictItem = missions.find(m => 
        Number(m.order) === orderVal && (!editingMission || String(m.id) !== String(editingMission.id))
      );
      
      if (conflictItem && !forceMode) {
        setConflictState({
          isOpen: true,
          type: "mission",
          targetOrder: orderVal,
          description: `misi "${conflictItem.title}"`,
          onResolve: (mode) => handleMissionSubmit(null as any, mode)
        });
        return;
      }

      if (forceMode === "pushover") {
        const toShift = missions.filter(m => Number(m.order) >= orderVal && (!editingMission || String(m.id) !== String(editingMission.id)));
        for (const item of toShift.sort((a,b) => Number(b.order) - Number(a.order))) {
          if (item.id) await updateMission(item.id, { order: Number(item.order) + 1 }, formData.id);
        }
      }

      if (editingMission && editingMission.id) {
        await updateMission(editingMission.id, missionFormData, formData.id);
      } else {
        await createMission(missionFormData, formData.id);
      }
      await fetchData();
      setIsMissionModalOpen(false);
      setConflictState({ ...conflictState, isOpen: false });
    } catch (err) {
      alert("Gagal menyimpan misi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMission = async (id: string) => {
    if (!confirm("Hapus misi ini?")) return;
    try {
      await deleteMission(id, formData.id);
      await fetchData();
    } catch (err) {
      alert("Gagal menghapus misi.");
    }
  };

  // Division Handlers
  const openNewDivModal = () => {
    setEditingDiv(null);
    setDivFormData({ title: "", subtitle: "", accent: "#2563eb", order: divisions.length + 1 });
    setIsDivModalOpen(true);
  };

  const openEditDivModal = (div: DivisionWithMembers) => {
    setEditingDiv(div);
    setDivFormData({ title: div.title, subtitle: div.subtitle || "", accent: div.accent, order: div.order });
    setIsDivModalOpen(true);
  };

  const handleDivSubmit = async (e: React.FormEvent, forceMode?: "keep" | "pushover") => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const orderVal = divFormData.order === "" ? 0 : Number(divFormData.order);
      if (orderVal < 1) {
        setError("Urutan harus minimal 1.");
        return;
      }

      const conflictItem = divisions.find(d => 
        Number(d.order) === orderVal && (!editingDiv || String(d.id) !== String(editingDiv.id))
      );

      if (conflictItem && !forceMode) {
        setConflictState({
          isOpen: true,
          type: "division",
          targetOrder: orderVal,
          description: `divisi "${conflictItem.title}"`,
          onResolve: (mode) => handleDivSubmit(null as any, mode)
        });
        return;
      }

      if (forceMode === "pushover") {
        const toShift = divisions.filter(d => Number(d.order) >= orderVal && (!editingDiv || String(d.id) !== String(editingDiv.id)));
        for (const item of toShift.sort((a,b) => Number(b.order) - Number(a.order))) {
          if (item.id) await updateDivision(item.id, { order: Number(item.order) + 1 }, formData.id);
        }
      }

      const dataToSubmit = { ...divFormData, order: Number(divFormData.order) || 0 };
      if (editingDiv) {
        await updateDivision(editingDiv.id, dataToSubmit, formData.id);
      } else {
        await createDivision(dataToSubmit, formData.id);
      }
      await fetchData();
      setIsDivModalOpen(false);
      setConflictState({ ...conflictState, isOpen: false });
    } catch (err) { alert("Gagal menyimpan divisi."); }
    finally { setIsSaving(false); }
  };

  const handleDeleteDivision = async (id: string) => {
    if (!confirm("Hapus divisi ini beserta seluruh anggotanya?")) return;
    try {
      await deleteDivision(id, formData.id);
      await fetchData();
    } catch (err) {
 alert("Gagal menghapus divisi."); }
  };

  // Member Handlers
  const openNewMemberModal = (divId: string) => {
    setEditingMember(null);
    setMemberFormData({
      name: "",
      role: "",
      university: "",
      instagram: "",
      linkedin: "",
      order: (divisions.find(d => d.id === divId)?.members.length || 0) + 1,
    });
    setMemberImageFile(null);
    setMemberImagePreview(null);
    setIsMemberModalOpen(true);
  };

  const openEditMemberModal = (member: BPHMember, divId: string) => {
    setTargetDivId(divId);
    setEditingMember(member);
    setMemberFormData({
      name: member.name,
      role: member.role,
      university: member.university,
      instagram: member.instagram || "",
      linkedin: member.linkedin || "",
      order: member.order ?? 0,
    });
    setMemberImageFile(null);
    setMemberImagePreview(member.image || null);
    setIsMemberModalOpen(true);
  };

  const handleMemberSubmit = async (e: React.FormEvent, forceMode?: "keep" | "pushover") => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const orderVal = memberFormData.order === "" ? 0 : Number(memberFormData.order);
      if (orderVal < 1) {
        setError("Urutan harus minimal 1.");
        return;
      }

      const divId = targetDivId || (editingMember as any)?.divisionId || (editingMember as any)?.division;
      const currentDiv = divisions.find(d => String(d.id) === String(divId));
      
      if (currentDiv) {
        const conflictItem = currentDiv.members.find(m => 
          Number(m.order) === orderVal && (!editingMember || String(m.id) !== String(editingMember.id))
        );
        
        if (conflictItem && !forceMode) {
          setConflictState({
            isOpen: true,
            type: "member",
            targetOrder: orderVal,
            description: `anggota "${conflictItem.name}"`,
            onResolve: (mode) => handleMemberSubmit(null as any, mode)
          });
          return;
        }

        if (forceMode === "pushover") {
          const toShift = currentDiv.members.filter(m => Number(m.order) >= orderVal && (!editingMember || String(m.id) !== String(editingMember.id)));
          for (const item of toShift.sort((a,b) => Number(b.order) - Number(a.order))) {
            const tempFormData = new FormData();
            tempFormData.append('order', (Number(item.order) + 1).toString());
            await updateMember(item.id!, tempFormData);
          }
        }
      }

      const mFormData = new FormData();
      mFormData.append('name', memberFormData.name);
      mFormData.append('role', memberFormData.role);
      mFormData.append('university', memberFormData.university);
      mFormData.append('instagram', memberFormData.instagram);
      mFormData.append('linkedin', memberFormData.linkedin);
      mFormData.append('order', memberFormData.order.toString());
      
      if (memberImageFile) {
        mFormData.append('image', memberImageFile);
      }

      if (editingMember) {
        await updateMember(editingMember.id!, mFormData);
        setSuccess("Data anggota berhasil diperbarui");
      } else if (targetDivId) {
        mFormData.append('divisionId', targetDivId);
        await createMember(mFormData);
        setSuccess("Anggota baru berhasil ditambahkan");
      }
      setIsMemberModalOpen(false);
      setConflictState({ ...conflictState, isOpen: false });
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan data anggota");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (id: string | undefined) => {
    if (!id || !confirm("Hapus anggota ini?")) return;
    try {
      await deleteMember(id);
      await fetchData();
    } catch (err) { alert("Gagal menghapus anggota."); }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4 pb-8 border-b border-slate-100">
        <div>
          <h1 className="text-4xl font-black text-[#0e2f5a] tracking-tight">Profil Koordinator Wilayah</h1>
          <p className="text-slate-400 font-medium mt-1">Kelola identitas, visi, misi, dan struktur BPH Pusat.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 bg-blue-50 px-5 py-3 rounded-2xl border border-blue-100 shadow-sm">
          <Calendar className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none mb-1">Status Masa Jabatan</p>
            <p className="text-sm font-black text-blue-700 leading-none">Periode {formData.activePeriod}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "profile" 
            ? "bg-white text-blue-600 shadow-sm" 
            : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Profil Organisasi
        </button>
        <button
          onClick={() => setActiveTab("structure")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "structure" 
            ? "bg-white text-blue-600 shadow-sm" 
            : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Struktur Organisasi
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-center gap-3 border border-emerald-100">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {activeTab === "profile" ? (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <form onSubmit={handleProfileSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Landmark className="w-4 h-4 text-blue-500" />
                  Nama Organisasi
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  Wilayah / Lingkup
                </label>
                <input
                  type="text"
                  required
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  Masa Jabatan Aktif (Official)
                </label>
                <select
                  required
                  value={formData.activePeriod}
                  onChange={(e) => setFormData({ ...formData, activePeriod: e.target.value })}
                  className="w-full px-4 py-3 bg-blue-50/30 border border-blue-200 text-blue-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold appearance-none shadow-sm"
                >
                  {availablePeriods.map((period) => (
                    <option key={period} value={period}>Periode {period}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 font-medium px-1">
                  * Tentukan periode yang sedang menjabat. Proker periode sebelumnya otomatis masuk Arsip.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Info className="w-4 h-4 text-blue-500" />
                Deskripsi Singkat (Hero)
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Target className="w-4 h-4 text-blue-500" />
                Visi Organisasi
              </label>
              <textarea
                required
                rows={3}
                value={formData.vision}
                onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none leading-relaxed italic"
              />
            </div>

            <div className="pt-8 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:-translate-y-0.5"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Menyimpan..." : "Simpan Profil & Visi"}
              </button>
            </div>
          </form>

          {/* Missions Section inside Profile Tab */}
          <div className="p-8 bg-slate-50 border-t border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#0e2f5a]">Misi Organisasi</h3>
                <p className="text-xs text-slate-400 font-medium">Langkah-langkah strategis untuk mencapai visi di atas.</p>
              </div>
              <button
                onClick={openNewMissionModal}
                className="flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Misi
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missions.length === 0 ? (
                <div className="col-span-full py-8 text-center bg-white border border-dashed border-slate-300 rounded-2xl">
                  <p className="text-slate-400 text-sm font-medium">Belum ada butir misi. Klik tombol Tambah Misi untuk memulai.</p>
                </div>
              ) : (
                missions.map((mission, idx) => {
                  const Icon = ICON_OPTIONS.find(i => i.name === mission.icon)?.icon || Target;
                  return (
                    <div 
                      key={mission.id || `mission-${idx}`}
                      className="bg-white border border-slate-200 p-4 rounded-2xl flex gap-4 items-start group hover:border-blue-200 transition-all shadow-sm"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900 text-sm">{mission.title}</h4>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => openEditMissionModal(mission)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteMission(String(mission.id))}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{mission.desc}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-end">
            <button
              onClick={openNewDivModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md"
            >
              <Plus className="w-4 h-4" /> Tambah Divisi
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {divisions.map((div, divIdx) => (
              <div key={div.id || `div-${divIdx}`} className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden border-t-4" style={{ borderTopColor: div.accent.startsWith('#') ? div.accent : '#2563eb' }}>
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#0e2f5a]">{div.title}</h3>
                    <p className="text-slate-500 text-sm mt-0.5">{div.subtitle}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openNewMemberModal(div.id)} className="flex items-center gap-2 bg-slate-100 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
                      <Plus className="w-3.5 h-3.5" /> Tambah Anggota
                    </button>
                    <button onClick={() => openEditDivModal(div)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteDivision(div.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {div.members.length === 0 ? (
                      <p className="text-slate-400 text-sm italic col-span-full py-4 text-center">Belum ada anggota di divisi ini.</p>
                    ) : (
                      div.members.map((member, memIdx) => (
                        <div key={member.id || `member-${memIdx}`} className="group relative bg-slate-50 p-4 rounded-3xl border border-transparent hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                          <div className="flex justify-between items-start mb-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs overflow-hidden border border-slate-200 relative">
                              {member.image && getAssetUrl(member.image) ? (
                                <Image 
                                  src={getAssetUrl(member.image) as string} 
                                  alt={member.name} 
                                  fill
                                  unoptimized
                                  className="object-cover" 
                                />
                              ) : (
                                member.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEditMemberModal(member, div.id)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDeleteMember(member.id!)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                          <h5 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">{member.name}</h5>
                          <p className="text-blue-600 font-bold text-[10px] uppercase mt-0.5 tracking-wider">{member.role}</p>
                          <p className="text-slate-400 text-[10px] mt-1 line-clamp-1 italic">{member.university}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <MissionModal 
        isOpen={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
        onSubmit={handleMissionSubmit}
        editingMission={editingMission}
        formData={missionFormData}
        setFormData={setMissionFormData}
        isSaving={isSaving}
        iconOptions={ICON_OPTIONS}
      />

      <DivisionModal 
        isOpen={isDivModalOpen}
        onClose={() => setIsDivModalOpen(false)}
        onSubmit={handleDivSubmit}
        editingDiv={editingDiv}
        formData={divFormData}
        setFormData={setDivFormData}
        isSaving={isSaving}
      />

      <MemberModal 
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onSubmit={handleMemberSubmit}
        editingMember={editingMember}
        formData={memberFormData}
        setFormData={setMemberFormData}
        imagePreview={memberImagePreview}
        setImageFile={setMemberImageFile}
        setImagePreview={setMemberImagePreview}
        isSaving={isSaving}
      />

      <ConflictModal 
        isOpen={conflictState.isOpen}
        onClose={() => setConflictState({ ...conflictState, isOpen: false })}
        onResolve={(mode: "keep" | "pushover") => conflictState.onResolve?.(mode)}
        targetOrder={conflictState.targetOrder}
        description={conflictState.description}
      />
    </div>
  );
}
