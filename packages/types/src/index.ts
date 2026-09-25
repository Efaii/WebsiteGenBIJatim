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
  id: number | string;
  title: string;
  slug?: string;
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
  divisi?: string;
  type?: string;
  audience: "Internal" | "External";
  status: "Completed" | "On-going" | "Upcoming" | "Recurring";
  date: string;
  dateIso: string | null;
  dateLabel?: string | null;
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
  
  // Real DB Fields mapped from backend
  kpiTukTarget?: string;
  dampak?: string;
  evaluasi?: string;
  linkProposalPdf?: string;
  linkLpjPdf?: string;
  dokumentasiDrive?: string;
  proposalLink?: string;
  lpjLink?: string;
  documentation?: string;
  commissariatSlug?: string;
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
  id: string;
  name: string;
  position: string;
  major: string;
  division: string;
  commissariat: { slug: string; name: string };
  period: string;
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
  memberCount?: number;
  prokerCount?: number;
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

import { z } from "zod";

export const CMS_ROLES = ["ADMIN_GLOBAL", "SEKRETARIS_UMUM", "SEKRETARIS_DIVISI"] as const;
export const PUBLICATION_STATUSES = ["DRAFT", "SUBMITTED", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"] as const;
export const MEMBERSHIP_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export type CmsRole = (typeof CMS_ROLES)[number];
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export const cmsRoleSchema = z.enum(CMS_ROLES);
export const publicationStatusSchema = z.enum(PUBLICATION_STATUSES);
export const membershipStatusSchema = z.enum(MEMBERSHIP_STATUSES);

export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive().max(100),
  total: z.number().int().nonnegative(),
  hasNextPage: z.boolean(),
});

export const responseMetaSchema = z.object({
  requestId: z.string().min(1),
  pagination: paginationMetaSchema.optional(),
});

export const apiErrorSchema = z.object({
  code: z.enum([
    "VALIDATION_ERROR",
    "UNAUTHENTICATED",
    "FORBIDDEN",
    "NOT_FOUND",
    "CONFLICT",
    "UNSUPPORTED_MEDIA_TYPE",
    "RATE_LIMITED",
    "INTERNAL_ERROR",
  ]),
  message: z.string().min(1),
  fields: z.record(z.string(), z.array(z.string())).optional(),
});

export const successEnvelopeSchema = <T extends z.ZodType>(data: T) =>
  z.object({ data, meta: responseMetaSchema });

export const errorEnvelopeSchema = z.object({
  error: apiErrorSchema,
  meta: z.object({ requestId: z.string().min(1) }),
});

const canonicalScopeSchema = z.object({
  commissariatId: z.string().uuid(),
  periodId: z.string().uuid(),
  divisionId: z.string().uuid().nullable(),
});

export const membershipWriteSchema = canonicalScopeSchema.extend({
  name: z.string().trim().min(1),
  position: z.string().trim().min(1),
  studyProgram: z.string().trim().min(1),
  publicationStatus: publicationStatusSchema.optional(),
  membershipStatus: membershipStatusSchema.optional(),
}).strict();

export const periodWriteSchema = z.object({
  label: z.string().trim().regex(/^\d{4}\/\d{4}$/),
}).strict();

export const divisionWriteSchema = z.object({
  name: z.string().trim().min(1),
  commissariatId: z.string().uuid(),
  periodId: z.string().uuid(),
}).strict();

export const canonicalResourceIdSchema = z.string().uuid();

export const newsCategorySchema = z.enum(["KEGIATAN", "WEBINAR", "SOSIAL", "EDUKASI", "PELATIHAN"]);
export const newsWriteSchema = z.object({
  title: z.string().trim().min(1).max(160),
  excerpt: z.string().trim().max(280),
  content: z.string().trim().max(50000),
  category: newsCategorySchema.nullable().optional(),
}).strict();

export const membershipImportErrorCodeSchema = z.enum([
  "INVALID_FILE", "INVALID_HEADER", "INVALID_ROW", "INVALID_SCOPE", "INVALID_COMMISSARIAT", "INVALID_DIVISION",
  "UNMAPPED_DIVISION", "AMBIGUOUS_MATCH", "DUPLICATE_IN_FILE", "AMBIGUOUS_SHEET", "PREVIEW_EXPIRED", "PREVIEW_STALE", "PREVIEW_ALREADY_COMMITTED",
]);

export type MembershipWrite = z.infer<typeof membershipWriteSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
