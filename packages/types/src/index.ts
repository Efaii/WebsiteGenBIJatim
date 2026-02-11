export interface BPHMember {
  role: string;
  name: string;
  image: string;
  university: string;
  major?: string;
  division?: string;
  instagram?: string;
  linkedin?: string;
}

export interface NewsItem {
  id: number;
  title: string;
  category: "Kegiatan" | "Webinar" | "Sosial" | "Edukasi" | "Pelatihan";
  date: string;
  image_color: string;
  image?: string;
  snippet: string;
}

export interface ProkerData {
  id: number | string;
  title: string;
  slug?: string;
  commissariat?: string;
  type?: string;
  audience: "Internal" | "External";
  status: "Completed" | "On-going" | "Upcoming" | "Recurring";
  date: string;
  dateIso: string;
  time?: string;
  location?: string;
  format?: "Offline" | "Online" | "Hybrid";
  link?: string;
  description: string;
  description_long?: string;
  background?: string;
  objectives?: string[];
  kpi?: string[];
  impact?: string[];
  benefits?: string[];
  evaluation?: string;
  proposalLink?: string;
  lpjLink?: string;
  documentation?: string;
  newsUrl?: string;
  gallery?: string[];
  image?: string;
}

export interface EventItem extends Partial<ProkerData> {
  id: string;
  date: string;
  day: string;
  title: string;
  commissariat: string;
  type: string;
  time: string;
  location: string;
  description?: string;
  image?: string;
  audience: "Internal" | "External";
  link?: string;
  dateIso: string; // for filtering
  month?: string;
  status?: "Completed" | "On-going" | "Upcoming" | "Recurring";
}

export interface Event {
  id: string | number;
  year: number;
  month: string;
  isFuture: boolean;
  items: EventItem[];
}

export interface CalendarGroup {
  month: string;
  items: EventItem[];
}

export interface Awardee {
  id: number;
  name: string;
  major: string;
  year: string;
}

export interface Document {
  id: number;
  title: string;
  type:
    | "SK"
    | "LPJ"
    | "SOP"
    | "Other"
    | "Proposal"
    | "Data"
    | "Materi"
    | "Surat"
    | "Notulensi"
    | "Dokumentasi";
  fileType: "PDF" | "DOCX" | "XLSX" | "PPTX" | "ZIP";
  size: string;
  date: string;
  url?: string;
  category?: string;
}

export interface CommissariatData {
  slug: string;
  name: string;
  university: string;
  logo_univ: string;
  logo_genbi: string;
  cover_image: string;
  description: string;
  socials: {
    instagram: string;
    email: string;
  };
  instagram?: string;
  email?: string;
  bph: BPHMember[];
  divisions: BPHMember[];
  proker: ProkerData[];
  awardees: Awardee[];
  documents: Document[];
}

export interface KorkomData {
  name: string;
  university: string;
  bph: BPHMember[];
  divisions: BPHMember[];
  documents: Document[];
}
