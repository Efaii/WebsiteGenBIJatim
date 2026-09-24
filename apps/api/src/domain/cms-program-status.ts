import { PublicationStatus } from "@prisma/client";

export const cmsPublicationStatus = (value: unknown): PublicationStatus | undefined =>
  typeof value === "string" && Object.values(PublicationStatus).includes(value as PublicationStatus)
    ? value as PublicationStatus
    : undefined;
