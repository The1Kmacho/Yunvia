# Interactive prototype

This repository currently contains a **client-side demonstration** of the Yunvia experience, not a ready-to-deploy community service.

## Run locally

Requirements: Node.js 20.9+ and npm.

```bash
npm install
npm run dev
```

Open **http://localhost:3000**.

Other checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Explore

- Switch between Spanish and English in the header.
- Switch between example communities.
- Create a community or project.
- Open a project, mark milestones complete, or list an additional resource need.
- Offer or withdraw help toward example project needs.
- Reset to the seeded example using **Reset demo / Reiniciar demo**.

Data is local to this browser and can be cleared; it is not shared between devices or people. Two sample communities and their example projects are **fictional**.

## Important limitations

- **No database, backend, authentication, real invitations or accounts.**
- **No real membership or moderation.** Anyone using this demo controls local state, including milestones.
- **No payment handling, legal/nonprofit registration, or real emergency-response functionality.**
- **No deployment, domain, trademark clearance, or software license is included.**
- **No full automated browser testing yet.** CI checks types, lint, and build if the workflow is enabled.
- A dependency lockfile has not yet been generated. Commit one in a development environment with npm access before release.
- This prototype is not appropriate for storing real people's private information.

## Implementation

Next.js App Router + React, TypeScript, and a custom CSS token-based design system (no Tailwind native bindings required). Demo state is modeled in `src/lib/model.ts`, seeded in `src/lib/demo-data.ts`, and interface copy lives in `src/lib/copy.ts`.

## Production milestones

1. Human feedback on layout and project-first user journey.
2. Pick a pilot community and a low-risk real-world use case.
3. Choose auth, hosting and database architecture.
4. Design server-side per-community authorization, privacy defaults, and abuse reporting.
5. Connect UI to a database and membership system, then test with pilot users.

## Windows native dependency fix

This branch removes the unused Tailwind/PostCSS native build dependency. If you installed the earlier prototype and encounter `@tailwindcss/oxide-win32-x64-msvc` errors, stop the dev server and clean the old install (PowerShell):

```powershell
Remove-Item -Recurse -Force node_modules,.next -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install
npm run dev
```

The existing interface uses hand-written CSS. Tailwind is not required for the prototype.
