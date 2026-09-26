export type PublicMembershipRecord = {
  id: string;
  name: string;
  position: string;
  studyProgram: string;
  division: { name: string } | null;
  commissariat: { slug: string; name: string };
  period: { label: string };
};

export const projectPublicMembership = (membership: PublicMembershipRecord) => ({
  id: membership.id,
  name: membership.name,
  position: membership.position,
  studyProgram: membership.studyProgram,
  division: membership.division?.name ?? '-',
  commissariat: membership.commissariat,
  period: membership.period.label,
});

export const projectPublicAwardee = (membership: PublicMembershipRecord) => ({
  id: membership.id,
  name: membership.name,
  position: membership.position,
  studyProgram: membership.studyProgram,
  division: membership.division?.name ?? '-',
  commissariat: membership.commissariat,
  period: membership.period.label,
});

export type AwardeeCommissariatCount = { slug: string; name: string; count: number };

/** Counts awardees per commissariat, ordered by commissariat name. */
export const summarizeAwardeesByCommissariat = (
  awardees: Array<{ commissariat: { slug: string; name: string } }>,
): AwardeeCommissariatCount[] => {
  const counts = new Map<string, AwardeeCommissariatCount>();
  for (const awardee of awardees) {
    const { slug, name } = awardee.commissariat;
    const entry = counts.get(slug) ?? { slug, name, count: 0 };
    entry.count += 1;
    counts.set(slug, entry);
  }
  return [...counts.values()].sort((a, b) => a.name.localeCompare(b.name, 'id'));
};
