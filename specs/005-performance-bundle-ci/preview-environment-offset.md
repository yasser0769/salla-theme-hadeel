# Preview-worktree build offset

The isolated preview worktree at `/Users/yasseralshihri/Desktop/Projects/salla-theme-hadeel/.worktrees/preview-hdl-05-20260810` produces five path-sensitive minified JavaScript files that are 31 raw bytes / 212 gzip-9 bytes larger in aggregate than the authoritative primary-tree production build.

- Primary T011: 997,743 raw / 196,388 gzip-9.
- Preview worktree: 997,774 raw / 196,600 gzip-9.
- Hard-cap result remains PASS by 2,226 B.

The source, `app.css`, image assets, C1 Safelist hash, and C5 asset hashes are identical. The preview-only manifest/test ceilings were adjusted to this worktree's reproducible production output so the temporary preview commit is internally consistent. This offset does not alter the primary HDL-05 measurement or exception. If the rendered preview is accepted, source changes remain authoritative; preview-only JavaScript hashes are not copied back to the primary working tree.
