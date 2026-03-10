import { Skeleton } from "@/components/ui/Skeleton";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

/**
 * @page LoadingAwardee
 * @description Skeleton loader for the Awardee database page.
 */
export default function LoadingAwardee() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <div className="container mx-auto px-6 lg:px-8 xl:px-12 max-w-7xl">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-64 md:w-80 mb-4" />
            <Skeleton className="h-5 w-full max-w-2xl" />
          </div>

          {/* Filters Skeleton */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Skeleton className="h-12 flex-1 rounded-full" />
            <Skeleton className="h-12 w-full md:w-56 rounded-full" />
          </div>

          {/* Table Skeleton */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 h-12 border-b border-slate-200 flex items-center px-6 gap-8">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="p-0">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                  key={i}
                  className="h-16 border-b border-slate-100 flex items-center px-6 gap-8"
                >
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
