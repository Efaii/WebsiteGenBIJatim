"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeAwardeesByCommissariat = exports.projectPublicAwardee = exports.projectPublicMembership = void 0;
const projectPublicMembership = (membership) => ({
    id: membership.id,
    name: membership.name,
    position: membership.position,
    studyProgram: membership.studyProgram,
    division: membership.division?.name ?? '-',
    commissariat: membership.commissariat,
    period: membership.period.label,
});
exports.projectPublicMembership = projectPublicMembership;
const projectPublicAwardee = (membership) => ({
    id: membership.id,
    name: membership.name,
    position: membership.position,
    studyProgram: membership.studyProgram,
    division: membership.division?.name ?? '-',
    commissariat: membership.commissariat,
    period: membership.period.label,
});
exports.projectPublicAwardee = projectPublicAwardee;
/** Counts awardees per commissariat, ordered by commissariat name. */
const summarizeAwardeesByCommissariat = (awardees) => {
    const counts = new Map();
    for (const awardee of awardees) {
        const { slug, name } = awardee.commissariat;
        const entry = counts.get(slug) ?? { slug, name, count: 0 };
        entry.count += 1;
        counts.set(slug, entry);
    }
    return [...counts.values()].sort((a, b) => a.name.localeCompare(b.name, 'id'));
};
exports.summarizeAwardeesByCommissariat = summarizeAwardeesByCommissariat;
