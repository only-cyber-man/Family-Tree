# Family Tree

A private family tree, drawn as a graph. Add the people you know, link how they
are related, and watch the generations line up by birth year. Live at
[family-tree.cyber-man.pl](https://family-tree.cyber-man.pl).

## Layout

| Path | What |
|---|---|
| `src/` | Next.js 14 web client (App Router) |
| `mobile/` | Expo / React Native app for iOS and Android, see `mobile/README.md` |
| `docs/design/handoff/family-tree-visual-identity/` | Claude Design handoff: brand, page designs, `tokens.json`, logo and app icon sources |
| `worker/` | Background worker bundled into the standalone server |

Both clients talk to the same PocketBase backend (`ft_users`, `ft_trees`,
`ft_nodes`, `ft_relationships`, `ft_relationships_names`).

## Web client

```bash
yarn install
yarn dev            # http://localhost:3000
yarn build          # standalone build + worker
yarn lint
```

Environment:

| Variable | Default | Used by |
|---|---|---|
| `NEXT_PUBLIC_POCKETBASE_URL` | `https://pocketbase.cyber-man.pl` | browser client |
| `SSR_POCKETBASE_URL` | `https://pocketbase.cyber-man.pl` | server components |

### Design system

Colours, type and spacing come from `docs/design/.../project/tokens.json` and
live as CSS custom properties in `src/app/globals.css`, with a dark set applied
through `prefers-color-scheme` (`<html data-theme="light|dark">` forces one).
Fonts are Literata (headings) and Manrope (UI) via `next/font`. Components use
the token variables, never raw hex, so both themes follow automatically.

The tree canvas (`src/app/trees/[treeId]/TreeCanvas.tsx`) is plain DOM + SVG:
people sit on a vertical axis by birth year (`src/lib/treeLayout.ts`), and each
relationship group has its own colour, dash and weight
(`src/lib/relationshipStyle.ts`). Marriages are the heaviest stroke and
"lives with" the faintest.
