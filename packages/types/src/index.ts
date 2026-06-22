export interface Member {
  id?: string;
  name: string;
  role: string;
  university: string;
  image?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  major?: string;
  division?: string;
  email?: string;
  order?: number;
  divisionId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BPHMember extends Member {}

export interface Mission {
  id?: string;
  title: string;
  desc: string;
  icon: string;
  order?: number;
}

export interface NewsItem {
  id: string | number;
  title: string;
  slug?: string;
  category?: string | null;
  date: string;
  image: string;
  image_color?: string;
  content?: string;
  author?: string;
  snippet?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export enum ProkerStatus {
  PLANNED = 'PLANNED',
  ON_PROGRESS = 'ON_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED'
}

export interface Proker {
  id?: string | number;
  slug?: string;          // For static/mock data routing
  title: string;          // Frontend compatibility (maps to name)
  name?: string;           // Database compatibility
  date: string;
  dateIso?: string;       // ISO format for mapping
  status: ProkerStatus | string;         // Derived status (PLANNED, ON_PROGRESS, DONE)
  category?: string;
  executionFormat?: string;
  format?: string;        // Legacy alias for UI
  description: string;
  description_long?: string;
  objectives?: string | string[];
  benefits?: string | string[];
  target?: string;
  impact?: string | string[];
  evaluation?: string;
  documentation?: string;
  lpjLink?: string;
  proposalUrl?: string;
  lpjUrl?: string;
  newsUrl?: string;       // Link to related news
  commissariat?: string;   // For calendar display
  type?: string;          // For calendar display
  location?: string;      // For calendar display
  link?: string;          // For calendar display
  audience: string;
  period?: string;
  gallery?: any;
  organizationProfileId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventItem extends Omit<Partial<Proker>, 'impact'> {
  id: string;
  date: string;
  day: string;
  title: string;
  commissariat: string;
  type: string;
  time: string;
  location: string;
  description?: string;
  description_long?: string;
  objectives?: string[] | string;
  impact?: string[] | string;
  benefits?: string[] | string;
  image?: string;
  audience: string;
  link?: string;
  proposalLink?: string;
  lpjLink?: string;
  dateIso: string;
  month?: string;
  status?: ProkerStatus | string;
}

export interface Event {
  id: string | number;
  year: number;
  month: string;
  isFuture: boolean;
  items: EventItem[];
}

export interface CalendarEventGroup {
  month: string;
  items: EventItem[];
}

export type CalendarGroup = CalendarEventGroup;

export interface Awardee {
  id: string;
  name: string;
  university: string;
  major: string;
  batch: string;
  period: string;
  organizationProfileId: string;
}

export interface Document {
  id: string;
  title: string;
  type: string;
  fileType: string;
  size: string;
  date: string;
  url?: string;
  category?: string;
  period?: string;
  isPublic?: boolean;
  organizationProfileId?: string;
}

export interface OrganizationProfile {
  id?: string;
  type?: "KOORDINATOR" | "KOMISARIAT" | "WILAYAH";
  slug: string | null;
  name: string;
  university: string;
  activePeriod?: string | null;
  description: string;
  vision?: string | null;
  missions?: Mission[] | null;
  socials?: any | null;
  logo?: string | null;
  logo_genbi?: string | null; // Legacy alias for UI
  univLogo?: string | null;
  logo_univ?: string | null; // Legacy alias for UI
  coverImage?: string | null;
  cover_image?: string | null; // Legacy alias for UI
  _count?: {
    prokers?: number;
    awardees?: number;
    documents?: number;
    divisions?: number;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CommissariatData extends OrganizationProfile {
  proker: Proker[];
  awardees: Awardee[];
  documents: Document[];
  bph?: Member[];
  divisions?: any[];
}

export interface KorkomData extends OrganizationProfile {
  type: "WILAYAH" | "KOORDINATOR" | "KOMISARIAT";
  activePeriod?: string;
  missions: Mission[];
  proker?: Proker[];
  bph?: Member[];
  divisions?: any[];
  documents?: Document[];
}
