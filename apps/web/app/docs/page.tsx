import DocsClient from "./DocsClient";
import { getAllDocuments } from "@/lib/services/docs.service";

export default async function DocsPage() {
  const docs = await getAllDocuments();
  return <DocsClient initialDocs={docs} />;
}
