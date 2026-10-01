import { Response } from "express";
import { CmsRequest } from "../middlewares/cms-session.middleware";
import { sendSuccess } from "../middlewares/request-context.middleware";
import { getOverviewData } from "../services/overview.service";

/*
 * Adapter HTTP tipis untuk Dasbor CMS: baca sesi, panggil modul data
 * (src/services/overview.service.ts), lalu kirim respons. Seluruh aturan
 * scope dan agregasi hidup di modul itu, bukan di sini.
 */
export const getOverview = async (req: CmsRequest, res: Response) => {
  const account = req.cmsSession!.cmsAccount;
  const assignment = account.assignments[0] ?? null;
  const data = await getOverviewData({
    role: account.role,
    assignment: assignment
      ? {
          commissariatId: assignment.commissariatId,
          periodId: assignment.periodId,
          divisionId: assignment.divisionId,
        }
      : null,
  });
  return sendSuccess(res, data);
};
