/** @param {{ date: string; dateLabel?: string | null }} program */
export const programDateLabel = (program) => program.dateLabel || program.date;

/** @param {{ gallery?: string[] }} program */
export const programGalleryItems = (program) =>
  Array.isArray(program.gallery) ? program.gallery : [];

/** @param {{ publicationStatus?: string; executionStatus?: string; status?: string }} program */
export const isPublicProgramItem = (program) =>
  (program.publicationStatus == null || program.publicationStatus === "PUBLISHED") &&
  program.executionStatus !== "CANCELLED" &&
  !["cancelled", "canceled", "cancel"].includes((program.status ?? "").trim().toLowerCase());

/** @template T @param {T[]} programs @returns {T[]} */
export const publicProgramItems = (programs) => programs.filter(isPublicProgramItem);
