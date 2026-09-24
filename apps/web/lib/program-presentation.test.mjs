import assert from "node:assert/strict";
import test from "node:test";
import { isPublicProgramItem, programDateLabel, programGalleryItems, publicProgramItems } from "./program-presentation.mjs";

test("uses the period label for an undated program", () => {
  assert.equal(
    programDateLabel({ date: "Periode 2025/2026", dateIso: null, dateLabel: "Periode 2025/2026" }),
    "Periode 2025/2026",
  );
});

test("keeps every legacy and child gallery image", () => {
  const gallery = [
    ...Array.from({ length: 6 }, (_, index) => `/legacy-${index + 1}.webp`),
    ...Array.from({ length: 9 }, (_, index) => `/child-${index + 1}.webp`),
  ];
  assert.deepEqual(programGalleryItems({ gallery }), gallery);
  assert.equal(programGalleryItems({ gallery }).length, 15);
});

test("hides archived and cancelled records from public presentation", () => {
  const programs = [
    { id: "published", publicationStatus: "PUBLISHED", executionStatus: "COMPLETED", status: "Completed" },
    { id: "archived", publicationStatus: "ARCHIVED", executionStatus: "COMPLETED", status: "Completed" },
    { id: "cancelled", publicationStatus: "PUBLISHED", executionStatus: "CANCELLED", status: "Completed" },
    { id: "cancel-text", publicationStatus: "PUBLISHED", executionStatus: "COMPLETED", status: "Cancel" },
    { id: "mock-public", status: "Upcoming" },
  ];
  assert.deepEqual(publicProgramItems(programs).map(({ id }) => id), ["published", "mock-public"]);
  assert.equal(isPublicProgramItem(programs[1]), false);
});
