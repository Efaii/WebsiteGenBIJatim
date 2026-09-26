/**
 * Builds the public "Struktur organisasi" view from Membership rows.
 *
 * Rules (see CONTEXT.md "Struktur organisasi"):
 * - BPH is listed first, then the remaining divisions.
 * - Members without a division are excluded.
 * - Within each group, members are ordered by name.
 */
export type StructureMember = { name: string; position: string };
export type StructureDivision = { name: string; members: StructureMember[] };
export type PublicStructure = { bph: StructureMember[]; divisions: StructureDivision[] };

export const BPH_DIVISION_NAME = 'BPH';

type StructureSourceMember = {
  name: string;
  position: string;
  division: { name: string } | null;
};

const byName = (a: StructureMember, b: StructureMember) => a.name.localeCompare(b.name, 'id');

export const buildPublicStructure = (memberships: StructureSourceMember[]): PublicStructure => {
  const grouped = new Map<string, StructureMember[]>();

  for (const membership of memberships) {
    const division = membership.division?.name?.trim();
    if (!division) continue;
    const members = grouped.get(division) ?? [];
    members.push({ name: membership.name, position: membership.position });
    grouped.set(division, members);
  }

  const bph = [...(grouped.get(BPH_DIVISION_NAME) ?? [])].sort(byName);
  grouped.delete(BPH_DIVISION_NAME);

  const divisions = [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'id'))
    .map(([name, members]) => ({ name, members: [...members].sort(byName) }));

  return { bph, divisions };
};
