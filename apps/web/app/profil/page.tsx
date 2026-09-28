import type { Metadata } from "next";
import ProfilView from "./ProfilView";

export const metadata: Metadata = {
  title: "Profil GenBI Jawa Timur",
  description:
    "Profil, visi, misi, nilai, dan pilar GenBI Jawa Timur lintas periode kepengurusan.",
};

export default function ProfilIndexPage() {
  return <ProfilView period={null} />;
}
