# Adopt the fork Beranda design by path-scoped integration

A fork (`raflialviro84/WebsiteGenBIJatim`) held one commit (`15ae339`) that redesigned the Beranda and About Kami. We took only the frontend paths it changed cleanly (home sections, navbar, global styles, site config, About) and deliberately did **not** merge the fork branch, and did **not** take its bundled News/API changes.

## Considered Options

- **Merge the fork branch.** Rejected: it is based on a much older ancestor, so it conflicts on the Awardee page, the Commissariat client, the program card, and three service files, and it would drag in build output (`dist/**`), scratch scripts, seed data, and uploads, while reverting the newer Awardee (#24) and Program Kerja (#20) work.
- **Cherry-pick the commit unchanged.** Rejected: it bundles News/API changes that are out of scope for the release, and its `content/home.ts` dropped a key the existing `CTA` component still reads, so the commit does not even type-check on its own.
- **Path-scoped integration (chosen).** Take the conflict-free frontend paths, keep `main`'s News/API/Program/Awardee behaviour, and repair the one content/type break.

## Consequences

The Beranda and About design now comes from the fork, but the fork branch is not an ancestor of `main`. Future edits to those files must be made on `main`, not re-merged blindly from the fork. The fork's News/API work stays unmerged and out of scope.

Public Beranda metrics are deliberately static and exact (`619` Anggota, `139` Program Kerja, matching what the public list shows). They must not be replaced with invented or rounded figures.
