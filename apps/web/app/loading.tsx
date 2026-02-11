export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#020617]">
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce"></div>
        </div>
        <p className="text-blue-200/60 text-sm font-medium animate-pulse">
          Memuat halaman...
        </p>
      </div>
    </div>
  );
}
