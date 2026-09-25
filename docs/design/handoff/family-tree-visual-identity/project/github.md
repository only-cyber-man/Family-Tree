repo: only-cyber-man/Family-Tree
branch: master

## Last sync
date: 2026-09-25T09:32:04Z
### Updated in this project
- Read data model (Node, Relationship, RelationshipName, Tree), useTree filters, TreeGraph vis-network layout
- Read landing, auth, trees dashboard, ManageInvited, Filters, SelectNode modal
- Designed new brand, web pages and mobile app on top of the existing model (no repo files copied)

## Screen map
| Screen | Repo files |
|---|---|
| Landing.dc.html | src/app/page.tsx, src/app/layout.tsx, src/app/Title.tsx, src/app/Subtitle.tsx |
| Auth.dc.html | src/app/sign-in/LoginForm.tsx, src/app/sign-up/RegisterForm.tsx |
| Dashboard.dc.html | src/app/trees/page.tsx, src/app/trees/CreateTree.tsx, src/app/trees/DeleteTreeButton.tsx, src/app/trees/ManageInvitedButton.tsx |
| TreeView.dc.html | src/app/trees/[treeId]/TreeGraph.tsx, FiltersButton.tsx, SelectNodeModal.tsx, AddNodeButton.tsx, EditNodeButton.tsx, AddRelationshipButton.tsx, ExportVisibleButton.tsx, src/lib/hooks/useTree.tsx |
| Brand.dc.html / tokens.json | src/lib/interfaces/Node.ts, src/lib/interfaces/RelationshipName.ts |
| Mobile.dc.html | src/lib/interfaces/*.ts (data model), src/app/trees/[treeId]/calendar/route.ts |
