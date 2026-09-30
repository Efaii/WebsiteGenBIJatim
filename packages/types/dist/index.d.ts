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
    dateIso: string;
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
    studyProgram: string;
    division: string;
    commissariat: {
        slug: string;
        name: string;
    };
    period: string;
}
export interface Document {
    id: number;
    title: string;
    type: "SK" | "LPJ" | "SOP" | "Other" | "Proposal" | "Data" | "Materi" | "Surat" | "Notulensi" | "Dokumentasi";
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
export declare const CMS_ROLES: readonly ["ADMIN_GLOBAL", "SEKRETARIS_UMUM", "SEKRETARIS_DIVISI"];
export declare const PUBLICATION_STATUSES: readonly ["DRAFT", "SUBMITTED", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"];
export declare const MEMBERSHIP_STATUSES: readonly ["ACTIVE", "INACTIVE"];
export type CmsRole = (typeof CMS_ROLES)[number];
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];
export declare const cmsRoleSchema: z.ZodEnum<{
    ADMIN_GLOBAL: "ADMIN_GLOBAL";
    SEKRETARIS_UMUM: "SEKRETARIS_UMUM";
    SEKRETARIS_DIVISI: "SEKRETARIS_DIVISI";
}>;
export declare const publicationStatusSchema: z.ZodEnum<{
    DRAFT: "DRAFT";
    SUBMITTED: "SUBMITTED";
    APPROVED: "APPROVED";
    PUBLISHED: "PUBLISHED";
    REJECTED: "REJECTED";
    ARCHIVED: "ARCHIVED";
}>;
export declare const membershipStatusSchema: z.ZodEnum<{
    ACTIVE: "ACTIVE";
    INACTIVE: "INACTIVE";
}>;
export declare const paginationMetaSchema: z.ZodObject<{
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
    total: z.ZodNumber;
    hasNextPage: z.ZodBoolean;
}, z.core.$strip>;
export declare const responseMetaSchema: z.ZodObject<{
    requestId: z.ZodString;
    pagination: z.ZodOptional<z.ZodObject<{
        page: z.ZodNumber;
        pageSize: z.ZodNumber;
        total: z.ZodNumber;
        hasNextPage: z.ZodBoolean;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const apiErrorSchema: z.ZodObject<{
    code: z.ZodEnum<{
        VALIDATION_ERROR: "VALIDATION_ERROR";
        UNAUTHENTICATED: "UNAUTHENTICATED";
        FORBIDDEN: "FORBIDDEN";
        NOT_FOUND: "NOT_FOUND";
        CONFLICT: "CONFLICT";
        UNSUPPORTED_MEDIA_TYPE: "UNSUPPORTED_MEDIA_TYPE";
        RATE_LIMITED: "RATE_LIMITED";
        INTERNAL_ERROR: "INTERNAL_ERROR";
    }>;
    message: z.ZodString;
    fields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
export declare const successEnvelopeSchema: <T extends z.ZodType>(data: T) => z.ZodObject<{
    data: T;
    meta: z.ZodObject<{
        requestId: z.ZodString;
        pagination: z.ZodOptional<z.ZodObject<{
            page: z.ZodNumber;
            pageSize: z.ZodNumber;
            total: z.ZodNumber;
            hasNextPage: z.ZodBoolean;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const errorEnvelopeSchema: z.ZodObject<{
    error: z.ZodObject<{
        code: z.ZodEnum<{
            VALIDATION_ERROR: "VALIDATION_ERROR";
            UNAUTHENTICATED: "UNAUTHENTICATED";
            FORBIDDEN: "FORBIDDEN";
            NOT_FOUND: "NOT_FOUND";
            CONFLICT: "CONFLICT";
            UNSUPPORTED_MEDIA_TYPE: "UNSUPPORTED_MEDIA_TYPE";
            RATE_LIMITED: "RATE_LIMITED";
            INTERNAL_ERROR: "INTERNAL_ERROR";
        }>;
        message: z.ZodString;
        fields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>>;
    }, z.core.$strip>;
    meta: z.ZodObject<{
        requestId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const membershipWriteSchema: z.ZodObject<{
    commissariatId: z.ZodString;
    periodId: z.ZodString;
    divisionId: z.ZodNullable<z.ZodString>;
    name: z.ZodString;
    position: z.ZodString;
    studyProgram: z.ZodString;
    publicationStatus: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        SUBMITTED: "SUBMITTED";
        APPROVED: "APPROVED";
        PUBLISHED: "PUBLISHED";
        REJECTED: "REJECTED";
        ARCHIVED: "ARCHIVED";
    }>>;
    membershipStatus: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
    }>>;
}, z.core.$strict>;
export declare const periodWriteSchema: z.ZodObject<{
    label: z.ZodString;
}, z.core.$strict>;
export declare const divisionWriteSchema: z.ZodObject<{
    name: z.ZodString;
    commissariatId: z.ZodString;
    periodId: z.ZodString;
}, z.core.$strict>;
export declare const canonicalResourceIdSchema: z.ZodString;
export declare const newsCategorySchema: z.ZodEnum<{
    KEGIATAN: "KEGIATAN";
    WEBINAR: "WEBINAR";
    SOSIAL: "SOSIAL";
    EDUKASI: "EDUKASI";
    PELATIHAN: "PELATIHAN";
}>;
export declare const newsWriteSchema: z.ZodObject<{
    title: z.ZodString;
    excerpt: z.ZodString;
    content: z.ZodString;
    category: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        KEGIATAN: "KEGIATAN";
        WEBINAR: "WEBINAR";
        SOSIAL: "SOSIAL";
        EDUKASI: "EDUKASI";
        PELATIHAN: "PELATIHAN";
    }>>>;
    author: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const membershipImportErrorCodeSchema: z.ZodEnum<{
    INVALID_FILE: "INVALID_FILE";
    INVALID_HEADER: "INVALID_HEADER";
    INVALID_ROW: "INVALID_ROW";
    INVALID_SCOPE: "INVALID_SCOPE";
    INVALID_COMMISSARIAT: "INVALID_COMMISSARIAT";
    INVALID_DIVISION: "INVALID_DIVISION";
    UNMAPPED_DIVISION: "UNMAPPED_DIVISION";
    AMBIGUOUS_MATCH: "AMBIGUOUS_MATCH";
    DUPLICATE_IN_FILE: "DUPLICATE_IN_FILE";
    AMBIGUOUS_SHEET: "AMBIGUOUS_SHEET";
    PREVIEW_EXPIRED: "PREVIEW_EXPIRED";
    PREVIEW_STALE: "PREVIEW_STALE";
    PREVIEW_ALREADY_COMMITTED: "PREVIEW_ALREADY_COMMITTED";
}>;
export type MembershipWrite = z.infer<typeof membershipWriteSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
//# sourceMappingURL=index.d.ts.map