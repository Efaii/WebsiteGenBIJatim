export type OverviewStatusEntry = { status: string; value: number };

/**
 * Bentuk respons `GET /v1/overview` untuk dashboard Ringkasan. Angka dibaca
 * dari API kanonik yang sama dengan daftar halaman lain.
 */
export type CmsOverview = {
  role: "ADMIN_GLOBAL" | "SEKRETARIS_UMUM" | "SEKRETARIS_DIVISI";
  scope: {
    commissariatId: string;
    periodId: string;
    divisionId: string | null;
  } | null;
  cards: {
    awardee: { total: number | null; published: number | null } | null;
    program: { total: number; published: number };
    news: { total: number; published: number };
    pendingTitles: number;
  };
  approvals: {
    news: number;
    program: number;
    awardee: number;
    imports: number;
  } | null;
  awardeeChart: Array<{ label: string; value: number }> | null;
  programByStatus: OverviewStatusEntry[];
  newsByStatus: OverviewStatusEntry[];
  newsMonthly: Array<{ label: string; value: number }>;
};
