import { Suspense } from "react";
import { CmsLoginForm } from "./CmsLoginForm";

export const metadata = { title: "Masuk CMS | GenBI Jatim" };

export default function CmsLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <Suspense fallback={null}>
        <CmsLoginForm />
      </Suspense>
    </main>
  );
}
