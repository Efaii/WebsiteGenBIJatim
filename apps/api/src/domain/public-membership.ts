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
