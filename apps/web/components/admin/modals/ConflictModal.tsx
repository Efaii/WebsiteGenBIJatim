"use client";

import { AlertCircle } from "lucide-react";

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (mode: "keep" | "pushover") => void;
  targetOrder: number;
  description: string;
}

export function ConflictModal({
  isOpen,
  onClose,
  onResolve,
  targetOrder,
  description
}: ConflictModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900">Urutan Terpakai!</h3>
            <p className="text-slate-500 leading-relaxed px-4 text-sm text-center">
              Urutan <span className="font-bold text-amber-600">#{targetOrder}</span> sudah diisi oleh {description}. Apa yang ingin Anda lakukan?
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => onResolve("pushover")}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex flex-col items-center"
            >
              <span>Geser Ke Bawah</span>
              <span className="text-[10px] opacity-70 font-medium">Turunkan urutan data lain secara otomatis</span>
            </button>
            <button 
              onClick={() => onResolve("keep")}
              className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-all flex flex-col items-center"
            >
              <span>Gunakan Urutan Sama</span>
              <span className="text-[10px] opacity-60 font-medium">Biarkan dua data memiliki urutan yang sama</span>
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-all"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
