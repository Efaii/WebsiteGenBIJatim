import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function AboutLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white">
      <Navbar />
      <main className="flex-1 mt-32 w-full mb-20">
        {/* Hero Skeleton */}
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-6 text-center flex flex-col items-center">
            <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-full"></div>
            <div className="h-16 w-3/4 max-w-lg bg-slate-200 animate-pulse rounded-2xl"></div>
            <div className="h-24 w-full max-w-2xl bg-slate-200 animate-pulse rounded-3xl"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="container mx-auto px-6 py-20 mt-10">
           <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-10 md:p-14 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-8">
              <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg"></div>
              <div className="h-20 w-full bg-slate-200 animate-pulse rounded-xl"></div>
              <div className="w-full h-px bg-slate-100 my-4"></div>
              <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 w-full bg-slate-200 animate-pulse rounded-md"></div>
                <div className="h-8 w-full bg-slate-200 animate-pulse rounded-md"></div>
                <div className="h-8 w-3/4 bg-slate-200 animate-pulse rounded-md"></div>
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
