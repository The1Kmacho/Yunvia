# Yunvia

**Build together. Live better.**

Yunvia is an open-source project to help people build stronger, more self-sufficient communities by organizing collective projects, sharing skills and resources, and collaborating locally.

Born in Puerto Rico, designed for communities everywhere.

> **Project status:** Interactive prototype with optional development-only .NET matching API. Yunvia is not yet a deployed community service, registered nonprofit, or legally cleared brand.

## First C# backend integration (development branch)

The `feat/dotnet-opportunity-api` branch adds an **ASP.NET Core 10** backend for skills catalog and opportunity matching. The Next.js frontend can call it when `NEXT_PUBLIC_YUNVIA_API_URL` is configured. The server computes suggestions, while the browser still supplies fictional demo data; **this is not yet a secure, persistent multi-user backend**.

Requires the **.NET 10 SDK**. Open two terminals from the repository root:

```powershell
# Terminal 1 — C# API (http://localhost:5064)
dotnet run --project backend/Yunvia.Api --launch-profile http
```

```powershell
# Terminal 2 — Next.js
$env:NEXT_PUBLIC_YUNVIA_API_URL="http://localhost:5064"
npm run dev
```

See [backend/README.md](backend/README.md) for the API routes, automated checks, setup and important security limitations. No extra npm libraries are required for this milestone.

## Three-pillar interactive workflow (development branch)

The `feat/integrated-opportunity-workflows` branch extends the prototype with **explainable opportunity matching**, **fictional collective purchasing commitments**, and **shared asset loan requests/approvals/returns**, connected to the existing community project experience.

The new **Discover / Descubrir** page explains why suggestions were generated from community-scoped, voluntarily shared information. It is still a **local-only browser demo**; users, suppliers, quotes, commitments and savings comparisons are fictional. No real transactions or permissions exist.

See [INTEGRATED_WORKFLOWS.md](INTEGRATED_WORKFLOWS.md) for walkthroughs, limitations, and tests.

## Interactive web prototype

The first interactive UI is available on the `feat/community-prototype` branch for review. It includes **Spanish/English language switching, demo communities, project creation, milestones, resource needs, and voluntary help pledges**, with a mobile-friendly visual design.

**This is an offline-style browser demonstration:** no accounts, backend, database, moderation, shared multi-user state, or production security controls. Sample members and projects are fictional. Changes are stored only in your browser.

**Run locally:**

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

See [PROTOTYPE.md](PROTOTYPE.md) for limitations and developer instructions, and [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for the design direction.

## Why Yunvia exists

Communities already have knowledge, equipment, time, and skills. What they often lack is a straightforward way to discover those capabilities and coordinate meaningful action.

Yunvia aims to help neighbors move from **"we should do this"** to **"we did this together."**

## What we are building first

A lightweight, mobile-friendly, bilingual (Spanish/English) web application for:

1. **Communities** — form or join a local group with clear membership and coordination.
2. **Collective projects** — propose and organize initiatives such as community gardens, tool libraries, and shared purchasing.
3. **Contributions** — volunteer time, offer skills, lend resources, and track what each project needs.
4. **Progress** — assign responsibilities, track milestones, and make project status visible to members.
5. **Safe coordination** — practical access controls, reporting, and privacy-conscious communication.

Our launch design will be **project-first**, not an endless social feed or a general-purpose classifieds marketplace.

## Principles

Yunvia is intended to be:

- **Nonpartisan** — the platform itself does not endorse political parties or candidates.
- **Nonprofit-oriented** — benefit to communities is the goal, not maximizing ad revenue or transaction fees. A legal nonprofit structure has not yet been established.
- **Open-source** — transparent development and community contributions. A software license is still to be selected before accepting external code contributions.
- **Community-driven** — local groups choose how to organize within baseline safety and accountability requirements.
- **Accessible** — designed for affordable mobile devices, varied digital literacy, and unreliable connectivity.
- **Privacy-conscious** — collect only what is necessary and do not expose precise locations by default.

See [VISION.md](VISION.md) and [PRINCIPLES.md](PRINCIPLES.md).

## Project documents

| Document | Purpose |
| --- | --- |
| [VISION.md](VISION.md) | Mission, product thesis, and measures of success |
| [PRINCIPLES.md](PRINCIPLES.md) | Values, governance guardrails, and trust commitments |
| [ROADMAP.md](ROADMAP.md) | MVP phases, pilot, and what comes later |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Proposed architecture and technical decisions still open |

## First milestone

Build a working pilot that lets members create a community, launch a collective project, request contributions, pledge help, and track progress. Validate with one real community in Puerto Rico before scaling.

## Contributing

The project is in its foundation stage. Before external code contributions open, we will choose a license, contribution guidelines, a code of conduct, and a security reporting process.

## Name and legal status

“Yunvia” is a working project brand. Domain, trademark, and app-store clearance remain pending. Descriptions of nonprofit intent or member governance do not imply that an incorporated organization already exists.
