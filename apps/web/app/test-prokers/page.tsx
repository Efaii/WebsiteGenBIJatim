"use client";

import { ProkerCard } from "@/components/ProkerCard";

export default function TestProkersPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-12 space-y-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Proker Category Test Page</h1>
        <p className="text-blue-200/60 font-medium">Testing visual badges for Weekly, Monthly, and Agenda categories.</p>
        
        <div className="grid gap-6">
          <ProkerCard 
            title="Kajian Mingguan (Weekly)"
            date="10 Jan 2025"
            status="On-going"
            category="Mingguan"
            description="Kajian rutin setiap Jumat malam yang membahas isu-isu ekonomi terkini dan dampaknya bagi mahasiswa."
          />
          
          <ProkerCard 
            title="GenBI Berbagi (Monthly)"
            date="Feb 2025"
            status="Upcoming"
            category="Bulanan"
            description="Inisiatif bulanan untuk mendistribusikan bantuan sosial kepada panti asuhan di sekitar wilayah komisariat."
          />
          
          <ProkerCard 
            title="Website GenBI Jatim (Project/Agenda)"
            date="Mar 2025"
            status="On-going"
            category="Project"
            description="Proyek strategis pengembangan portal digital terpusat untuk seluruh komisariat GenBI di Jawa Timur."
          />
          
          <ProkerCard 
            title="Musyawarah Besar (Agenda)"
            date="Des 2025"
            status="Upcoming"
            category="Agenda"
            description="Agenda tahunan tertinggi untuk mengevaluasi kinerja pengurus dan memilih nahkoda baru kepemimpinan GenBI."
          />
          
          <ProkerCard 
            title="Webinar Nasional (Generic)"
            date="Jan 2025"
            status="Completed"
            description="Sharing session bersama Bank Indonesia mengenai kebijakan moneter terbaru."
          />
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto pt-12 border-t border-white/10 text-center">
        <p className="text-blue-200/40 text-sm">
          Halaman ini hanya untuk demo visual kategori. Anda dapat menghapus file <code>apps/web/app/test-prokers/page.tsx</code> setelah selesai mengevaluasi.
        </p>
      </div>
    </div>
  );
}
