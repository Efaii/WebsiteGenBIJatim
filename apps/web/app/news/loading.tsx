import { Skeleton } from "@/components/ui/Skeleton";
import { PageBackground } from "@/components/PageBackground";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

/**
 * @page LoadingNews
 * @description Skeleton loader for the News list page.
 */
export default function LoadingNews() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent relative overflow-clip">
      <Navbar />
      <PageBackground variant="default" />

      <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
        {/* Header Skeleton */}
        <div className="flex flex-col items-center space-y-4 mb-12 text-center">
          <Skeleton className="h-10 w-64 md:w-80" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-3/4 max-w-md" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="flex gap-2 w-full md:w-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-11 w-full md:w-72 rounded-xl" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col h-[400px] rounded-[2rem] border border-slate-200/20 bg-white/5 overflow-hidden"
            >
              <Skeleton className="h-48 w-full" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-16 w-full" />
                <div className="pt-4 mt-auto">
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
