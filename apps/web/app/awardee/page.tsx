import { Metadata } from "next";
import AwardeeClient from "./AwardeeClient";

/**
 * @page AwardeePage
 * @description Server component for SEO metadata. Delegates rendering to AwardeeClient.
 */

export const metadata: Metadata = {
  title: "Database Awardee | GenBI Jawa Timur",
  description:
    "Daftar lengkap penerima beasiswa Bank Indonesia di seluruh komisariat Jawa Timur.",
};

export default function AwardeePage() {
  return <AwardeeClient />;
}
