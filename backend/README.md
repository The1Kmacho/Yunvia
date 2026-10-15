# Yunvia .NET Backend — first connected slice

This directory introduces the **C# / ASP.NET Core 10** backend for Yunvia while retaining Next.js for the UI.

## What works today

- `GET /health` — health status.
- `GET /api/v1/demo/skills` — canonical ES/EN structured skills catalog.
- `POST /api/v1/demo/opportunities/match` — pure deterministic matching across tools, buying groups, and exact skill-task matches.
- `Yunvia.Domain` — matching rules and catalog, independent of ASP.NET.
- `Yunvia.Domain.Tests` — zero-external-package test harness for core rules, invoked with `dotnet run`.

These are intentionally **development-only demo endpoints**. No claims of secure member identity or stored communities are made.

## Requirements

- .NET **10 SDK**, not just runtime.
- Node.js and npm as required for the existing Next.js app.

## Run the backend

From the repository root:

```powershell
dotnet run --project backend/Yunvia.Api --launch-profile http
```

The local backend runs at **http://localhost:5064**.

Try:

```powershell
Invoke-RestMethod http://localhost:5064/health
Invoke-RestMethod http://localhost:5064/api/v1/demo/skills
```

## Connect React

In a **second terminal** (same repo root), set the frontend environment variable *before starting Next.js*:

```powershell
$env:NEXT_PUBLIC_YUNVIA_API_URL="http://localhost:5064"
npm run dev
```

Visit http://localhost:3000 → **Discover / Descubrir**.

- With that variable set, **the catalog is fetched from C#** and **discovery matches come from C#**. If the API fails, the UI displays an error instead of silently inventing local matches.
- Without the variable, the earlier offline prototype remains usable and makes its *browser-only* matching mode visible.
- Next.js embeds `NEXT_PUBLIC_` values at development startup, so restart `npm run dev` after changing them.
- Existing npm dependencies are unchanged: **no npm install is needed** when switching from the working prototype branch.

## Try automated checks

```powershell
dotnet build backend/Yunvia.Api/Yunvia.Api.csproj
dotnet run --project backend/Yunvia.Domain.Tests
npm run check
```

GitHub Actions runs both the .NET checks and the existing web checks independently.

## Current security and data limitations

This is **not a production user-data API**:

1. **No accounts or server-held records:** The browser sends a minimal, temporary snapshot of fictional needs, opted-in skills and projects. The backend computes matches but cannot independently verify whether a member really opted in.
2. **No PostgreSQL or EF Core yet.** They belong to the next persistence/auth slice. Introducing a database schema before the roles and membership rules are defined would create unsafe assumptions.
3. **No authenticated authorization:** Clients must never rely on these demo endpoints to enforce privacy or ownership. These endpoints are only mapped in ASP.NET **Development** mode.
4. **Privacy-conscious transport:** The frontend transmits only fields needed for matching — it does not send aliases, free-form descriptions, notes, experiences or contact details. In the sample this is HTTP to the local loopback server; real deployments require HTTPS and authenticated server-owned data.
5. **CORS is restricted to local frontend origins**. CORS does not replace authentication. Do not expose this service publicly.
6. **No payment, lending approval, or reservation write endpoints**. Those workflows remain browser-only simulations.

## Next backend slice

1. Decide identity and membership rules.
2. Add PostgreSQL and EF Core with migrations, audit and proper ownership.
3. Store skills/offers/needs in the database behind authenticated, authorized endpoints.
4. Make the matcher query **server-owned** data instead of accepting browser-generated records.
5. Integrate purchasing and lending state transitions with transactions and concurrency controls.

The completed backend need not be a microservice deployment: these projects are modules of one modular monolith.
