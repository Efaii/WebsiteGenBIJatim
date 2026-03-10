import { Metadata } from "next";
import CommissariatListClient from "./CommissariatListClient";

/**
 * @page CommissariatPage
 * @description Server component for SEO metadata. Delegates rendering to CommissariatListClient.
 */

export const metadata: Metadata = {
  title: "Pusat Data Komisariat | GenBI Jawa Timur",
  description:
    "Dashboard terintegrasi untuk memantau kinerja dan perkembangan 9 Komisariat GenBI di Jawa Timur.",
};

export default function CommissariatPage() {
  return <CommissariatListClient />;
}
