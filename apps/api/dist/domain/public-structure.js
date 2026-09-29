"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPublicStructure = exports.BPH_DIVISION_NAME = void 0;
exports.BPH_DIVISION_NAME = 'BPH';
const byName = (a, b) => a.name.localeCompare(b.name, 'id');
const buildPublicStructure = (memberships) => {
    const grouped = new Map();
    for (const membership of memberships) {
        const division = membership.division?.name?.trim();
        if (!division)
            continue;
        const members = grouped.get(division) ?? [];
        members.push({ name: membership.name, position: membership.position });
        grouped.set(division, members);
    }
    const bph = [...(grouped.get(exports.BPH_DIVISION_NAME) ?? [])].sort(byName);
    grouped.delete(exports.BPH_DIVISION_NAME);
    const divisions = [...grouped.entries()]
        .sort(([a], [b]) => a.localeCompare(b, 'id'))
        .map(([name, members]) => ({ name, members: [...members].sort(byName) }));
    return { bph, divisions };
};
exports.buildPublicStructure = buildPublicStructure;
