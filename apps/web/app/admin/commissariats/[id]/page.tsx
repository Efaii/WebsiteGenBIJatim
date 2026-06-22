"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Save, AlertCircle, Info, Landmark, GraduationCap, 
  Target, Plus, Edit2, Trash2, X, Network, Users, 
  BarChart3, Zap, Camera, Calendar, ArrowLeft
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
  deleteMember
} from "@/lib/services/profile.service";
import { MissionModal } from "@/components/admin/modals/MissionModal";
import { DivisionModal } from "@/components/admin/modals/DivisionModal";
import { MemberModal } from "@/components/admin/modals/MemberModal";
import { ConflictModal } from "@/components/admin/modals/ConflictModal";
import { useRouter, useParams } from "next/navigation";
import { getAssetUrl } from "@/lib/utils";
import { Mission, Member as BPHMember } from "@repo/types";
import Link from "next/link";

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

export default function AdminCommissariatDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    university: "",
    description: "",
    vision: "",
    activePeriod: "2024/2025",
    id: "",
    slug: ""
  });
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"profile" | "structure">("profile");

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

  // Generate management periods
  const currentYear = new Date().getFullYear();
  const availablePeriods = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - 3 + i;
    return `${year}/${year + 1}`;
  });

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getKorkomData(id);
      setFormData({
        name: data.name || "",
        university: data.university || "",
        description: data.description || "",
        vision: data.vision || "",
        activePeriod: data.activePeriod || "2024/2025",
        id: data.id || "",
        slug: data.slug || ""
      });
      setMissions(data.missions || []);
      
      const divs = await getAllDivisions(data.id);
      setDivisions(divs || []);
    } catch (err: any) {
      setError("Gagal memuat data komisariat.");
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
      setSuccess("Konten berhasil diperbarui!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  // Mission CRUD
  const openNewMissionModal = () => {
    setEditingMission(null);
    setMissionFormData({ title: "", desc: "", icon: "Target", order: missions.length + 1 });
    setIsMissionModalOpen(true);
  };
  const openEditMissionModal = (mission: Mission) => {
    setEditingMission(mission);
    setMissionFormData({ title: mission.title, desc: mission.desc, icon: mission.icon, order: mission.order ?? 0 });
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
          if (item.id) await updateMission(item.id, { order: Number(item.order) + 1 }, id);
        }
      }

      if (editingMission && editingMission.id) {
        await updateMission(editingMission.id, missionFormData, id);
      } else {
        await createMission(missionFormData, id);
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
  const handleDeleteMission = async (mId: string) => {
    if (!confirm("Hapus misi?")) return;
    try {
      await deleteMission(mId, id);
      await fetchData();
    } catch (err) { alert("Gagal menghapus misi."); }
  };

  // Division CRUD
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
          if (item.id) await updateDivision(item.id, { order: Number(item.order) + 1 }, id);
        }
      }

      const dataToSubmit = { ...divFormData, order: Number(divFormData.order) || 0 };
      if (editingDiv) {
        await updateDivision(editingDiv.id, dataToSubmit, id);
      } else {
        await createDivision(dataToSubmit, id);
      }
      await fetchData();
      setIsDivModalOpen(false);
      setConflictState({ ...conflictState, isOpen: false });
    } catch (err) { alert("Gagal menyimpan divisi."); }
    finally { setIsSaving(false); }
  };
  const handleDeleteDivision = async (dId: string) => {
    if (!confirm("Hapus divisi beserta anggotanya?")) return;
    try {
      await deleteDivision(dId, id);
      await fetchData();
    } catch (err) { alert("Gagal menghapus divisi."); }
  };

  // Member CRUD
  const openNewMemberModal = (divId: string) => {
    setTargetDivId(divId);
    setEditingMember(null);
    setMemberFormData({ name: "", role: "", university: formData.university, instagram: "", linkedin: "", order: 1 });
    setMemberImageFile(null); setMemberImagePreview(null);
    setIsMemberModalOpen(true);
  };
  const openEditMemberModal = (member: BPHMember, divId: string) => {
    setTargetDivId(divId);
    setEditingMember(member);
    setMemberFormData({ name: member.name, role: member.role, university: member.university, instagram: member.instagram || "", linkedin: member.linkedin || "", order: member.order ?? 0 });
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
  const handleDeleteMember = async (mId: string) => {
    if (!confirm("Hapus anggota?")) return;
    try { await deleteMember(mId); await fetchData(); } catch (err) { alert("Gagal menghapus anggota."); }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 p-4">
      {/* Back Button & Header */}
      <div className="space-y-6">
        <Link href="/admin/commissariats" className="flex items-center gap-2 text-slate-400 hover:text-[#0e2f5a] font-bold text-sm transition-colors group w-fit">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Daftar
        </Link>
        <div className="pb-8 border-b border-slate-100">
          <h1 className="text-4xl font-black text-[#0e2f5a] tracking-tight truncate">{formData.name}</h1>
          <p className="text-slate-400 font-medium mt-1 uppercase tracking-widest text-xs flex items-center gap-2">
            <GraduationCap className="w-3.5 h-3.5" /> {formData.university} • <span className="text-blue-500 font-bold">/{formData.slug}</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
        <button onClick={() => setActiveTab("profile")} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "profile" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          Konten Profil & Misi
        </button>
        <button onClick={() => setActiveTab("structure")} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "structure" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          Struktur & Anggota
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-center gap-3 border border-emerald-100 animate-in slide-in-from-top-2">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {activeTab === "profile" ? (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <form onSubmit={handleProfileSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nama Tampilan</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Universitas</label>
                <input type="text" required value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Deskripsi Singkat</label>
              <textarea rows={4} required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none leading-relaxed" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Visi Komisariat</label>
              <textarea rows={3} required value={formData.vision} onChange={(e) => setFormData({...formData, vision: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none italic leading-relaxed" />
            </div>

            <div className="pt-8 border-t border-slate-100 flex justify-end">
              <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg">
                <Save className="w-4 h-4" /> {isSaving ? "Menyimpan..." : "Simpan Konten"}
              </button>
            </div>
          </form>

          {/* Missions List */}
          <div className="p-8 bg-slate-50 border-t border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#0e2f5a]">Misi Komisariat</h3>
              <button onClick={openNewMissionModal} className="text-blue-600 bg-white border border-blue-200 px-4 py-2 rounded-xl text-xs font-bold shadow-sm"><Plus className="w-3.5 h-3.5 inline mr-1" /> Tambah Misi</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missions.map((m, idx) => {
                const Icon = ICON_OPTIONS.find(i => i.name === m.icon)?.icon || Target;
                return (
                  <div key={m.id || idx} className="bg-white border border-slate-200 p-4 rounded-2xl flex gap-4 items-start group relative">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-[#0e2f5a]">{m.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{m.desc}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditMissionModal(m)} className="p-1.5 text-slate-400 hover:text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteMission(String(m.id))} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={openNewDivModal} className="flex items-center gap-2 bg-[#0e2f5a] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md">
              <Plus className="w-4 h-4" /> Tambah Divisi
            </button>
          </div>
          {divisions.map((div) => (
            <div key={div.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden" style={{ borderTop: `4px solid ${div.accent}` }}>
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-[#0e2f5a]">{div.title}</h3>
                  <p className="text-xs text-slate-400">{div.subtitle}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openNewMemberModal(div.id)} className="text-xs font-bold bg-slate-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-600 hover:text-white transition-all">Tambah Anggota</button>
                  <button onClick={() => openEditDivModal(div)} className="p-2 text-slate-300 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteDivision(div.id)} className="p-2 text-slate-300 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {div.members.map((m) => (
                  <div key={m.id} className="group relative bg-slate-50 p-3 rounded-2xl text-center border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-lg transition-all">
                    <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 overflow-hidden mb-2 border border-slate-200">
                      {m.image ? <Image src={getAssetUrl(m.image)!} alt={m.name} width={48} height={48} unoptimized className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-xs">{m.name.substring(0,2).toUpperCase()}</div>}
                    </div>
                    <h5 className="text-[11px] font-bold text-slate-800 line-clamp-1">{m.name}</h5>
                    <p className="text-[9px] text-blue-500 font-bold uppercase">{m.role}</p>
                    <div className="absolute top-1 right-1 flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditMemberModal(m, div.id)} className="p-1 text-slate-400 hover:text-blue-600"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={() => handleDeleteMember(m.id!)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
