import api from "@/lib/api";

export type CmsAwardeePublicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED"
  | "ARCHIVED";

export type CmsAwardeeMembershipStatus = "ACTIVE" | "INACTIVE";

export type CmsAwardee = {
  id: string;
  name: string;
  position: string;
  studyProgram: string;
  divisionId: string | null;
  division?: { name: string } | null;
  membershipStatus: CmsAwardeeMembershipStatus;
  publicationStatus: CmsAwardeePublicationStatus;
  rejectionReason: string | null;
  updatedAt: string;
  period?: { label: string } | null;
  commissariat?: { name: string } | null;
};

export type CmsAwardeeOptions = {
  period: { id: string; label: string } | null;
  commissariat: { id: string; name: string } | null;
  divisions: Array<{ id: string; name: string }>;
  periods?: Array<{
    id: string;
    label: string;
    commissariatId: string;
    commissariatName: string;
  }>;
};

export type AwardeeWritePayload = {
  name: string;
  position: string;
  studyProgram: string;
  divisionId?: string | null;
  membershipStatus?: CmsAwardeeMembershipStatus;
};

const pickData = <T>(data: T | undefined, message: string): T => {
  if (data === undefined) throw new Error(message);
  return data;
};

/** Tambah entri Awardee baru (status awal DRAFT, scope dari akun). */
export const createCmsAwardee = async (
  payload: AwardeeWritePayload,
): Promise<CmsAwardee> => {
  const response = await api.post<{ data?: CmsAwardee }>(
    "/v1/memberships/cms",
    payload,
    { withCredentials: true },
  );
  return pickData(response.data.data, "Respons tambah Awardee kosong.");
};

/** Ubah entri Awardee; perubahan menjadi DRAFT sampai diajukan disetujui. */
export const updateCmsAwardee = async (
  id: string,
  payload: AwardeeWritePayload,
): Promise<CmsAwardee> => {
  const response = await api.patch<{ data?: CmsAwardee }>(
    `/v1/memberships/cms/${id}`,
    payload,
    { withCredentials: true },
  );
  return pickData(response.data.data, "Respons simpan Awardee kosong.");
};

/** Ajukan seluruh perubahan (DRAFT/Ditolak) pada scope akun. */
export const submitCmsAwardeeChanges = async (): Promise<number> => {
  const response = await api.post<{ data?: { submitted?: number } }>(
    "/v1/memberships/cms/submit",
    {},
    { withCredentials: true },
  );
  return response.data.data?.submitted ?? 0;
};

/** Opsi divisi per scope; khusus admin global untuk tinjauan pemetaan impor. */
export const getCmsAwardeeScopeOptions = async (
  commissariatId: string,
  periodId: string,
): Promise<CmsAwardeeOptions> => {
  const query = `commissariatId=${encodeURIComponent(commissariatId)}&periodId=${encodeURIComponent(periodId)}`;
  const response = await api.get<{ data?: CmsAwardeeOptions }>(
    `/v1/memberships/cms/options?${query}`,
    { withCredentials: true },
  );
  return pickData(response.data.data, "Respons opsi scope kosong.");
};

export type AwardeeImportRowClassification =
  | "NEW"
  | "UPDATED"
  | "UNCHANGED"
  | "INVALID"
  | "AMBIGUOUS_MATCH"
  | "DUPLICATE_IN_FILE";

export type AwardeeImportRow = {
  rowNumber: number;
  classification: AwardeeImportRowClassification;
  errors: string[];
  rawValues: Record<string, unknown>;
  normalizedValues: {
    komisariat?: string | null;
    nama?: string | null;
    jabatan?: string | null;
    divisi?: string | null;
    prodi?: string | null;
  } | null;
  matchedMembershipId: string | null;
  mappedDivisionId: string | null;
};

export type AwardeeImportPreviewResult = {
  previewId: string;
  sourceFileHash: string;
  sourceSheet: string;
  totalRows: number;
  newCount: number;
  updatedCount: number;
  unchangedCount: number;
  invalidCount: number;
  ambiguousCount: number;
  duplicateCount: number;
  rows: AwardeeImportRow[];
};

/** Unggah berkas Excel dan buat pratinjau impor Awardee. */
export const previewCmsAwardeeImport = async (
  file: File,
  commissariatId: string,
  periodId: string,
): Promise<AwardeeImportPreviewResult> => {
  const form = new FormData();
  form.append("file", file);
  form.append("commissariatId", commissariatId);
  form.append("periodId", periodId);
  const response = await api.post<{ data?: AwardeeImportPreviewResult }>(
    "/v1/membership-imports/preview",
    form,
    {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return pickData(response.data.data, "Respons pratinjau impor kosong.");
};

/** Simpan pratinjau ke data (status COMMITTED). */
export const commitCmsAwardeeImport = async (
  previewId: string,
  options: { confirmLargeImport?: boolean; backupEvidenceId?: string } = {},
): Promise<{ previewId: string; status: string }> => {
  const response = await api.post<{
    data?: { previewId: string; status: string };
  }>(
    "/v1/membership-imports/commit",
    { previewId, ...options },
    { withCredentials: true },
  );
  return pickData(response.data.data, "Respons commit impor kosong.");
};

/** Ajukan batch impor untuk disetujui admin global. */
export const submitCmsAwardeeImport = async (
  previewId: string,
): Promise<{ previewId: string; status: string }> => {
  const response = await api.post<{
    data?: { previewId: string; status: string };
  }>(
    `/v1/membership-imports/${previewId}/submit`,
    {},
    { withCredentials: true },
  );
  return pickData(response.data.data, "Respons pengajuan impor kosong.");
};

/** Setujui pemetaan divisi (khusus admin global) agar pratinjau ulang mengenalinya. */
export const reviewCmsAwardeeImportAlias = async (payload: {
  kind: "DIVISION";
  rawValue: string;
  commissariatId: string;
  periodId: string;
  divisionId: string;
}): Promise<void> => {
  await api.post("/v1/membership-imports/aliases/review", payload, {
    withCredentials: true,
  });
};

/** Antrean pengajuan manual (SUBMITTED) untuk halaman Persetujuan Awardee. */
export const getCmsAwardeeReviewQueue = async (): Promise<CmsAwardee[]> => {
  const response = await api.get<{ data?: CmsAwardee[] }>(
    "/v1/memberships/cms/review",
    { withCredentials: true },
  );
  return response.data.data ?? [];
};

/** Setujui pengajuan manual sekaligus terbitkan (khusus admin global). */
export const approveCmsAwardee = async (id: string): Promise<void> => {
  await api.post(
    `/v1/memberships/cms/${id}/approve`,
    {},
    { withCredentials: true },
  );
};

/** Tolak pengajuan manual dengan catatan wajib (khusus admin global). */
export const rejectCmsAwardee = async (
  id: string,
  reason: string,
): Promise<void> => {
  await api.post(
    `/v1/memberships/cms/${id}/reject`,
    { reason },
    { withCredentials: true },
  );
};

export type CmsImportBatch = {
  id: string;
  sourceFilename: string;
  status: string;
  totalRows: number;
  newCount: number;
  updatedCount: number;
  unchangedCount: number;
  invalidCount: number;
  ambiguousCount: number;
  duplicateCount: number;
  committedAt: string | null;
  createdAt: string;
  uploaderName: string;
  commissariatName: string;
  periodLabel: string;
};

export type CmsImportBatchRow = {
  id: string;
  rowNumber: number;
  classification: string;
  errorCode: string | null;
  errorMessage: string | null;
  rawValues: Record<string, unknown>;
  normalizedValues: {
    komisariat?: string | null;
    nama?: string | null;
    jabatan?: string | null;
    divisi?: string | null;
    prodi?: string | null;
  } | null;
};

export type CmsImportBatchDetail = CmsImportBatch & {
  rows: CmsImportBatchRow[];
};

/** Antrean batch impor untuk admin global, default status SUBMITTED. */
export const getCmsImportBatches = async (
  status = "SUBMITTED",
): Promise<CmsImportBatch[]> => {
  const response = await api.get<{ data?: CmsImportBatch[] }>(
    "/v1/membership-imports",
    { params: { status }, withCredentials: true },
  );
  return response.data.data ?? [];
};

/** Isi satu batch impor untuk pratinjau di halaman persetujuan. */
export const getCmsImportBatchDetail = async (
  id: string,
): Promise<CmsImportBatchDetail> => {
  const response = await api.get<{ data?: CmsImportBatchDetail }>(
    `/v1/membership-imports/${id}`,
    { withCredentials: true },
  );
  return pickData(response.data.data, "Respons pratinjau batch kosong.");
};

/** Setujui batch impor sekaligus terbitkan barisnya (khusus admin global). */
export const approveCmsImportBatch = async (id: string): Promise<void> => {
  await api.post(
    `/v1/membership-imports/${id}/approve`,
    {},
    { withCredentials: true },
  );
};

/** Tolak batch impor dengan catatan wajib (khusus admin global). */
export const rejectCmsImportBatch = async (
  id: string,
  reason: string,
): Promise<void> => {
  await api.post(
    `/v1/membership-imports/${id}/reject`,
    { reason },
    { withCredentials: true },
  );
};
