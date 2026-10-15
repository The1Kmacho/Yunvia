import type { CooperationState, Opportunity } from "./cooperation";
import type { Project, Localized } from "./model";
import type { SkillTaskId } from "./skills";

export const API_URL = process.env.NEXT_PUBLIC_YUNVIA_API_URL?.replace(/\/$/, "") || "";
export const CONNECTED_DEMO = Boolean(API_URL);

export type RemoteSkillGroup = {
  id: string;
  label: Localized;
  tasks: { id: SkillTaskId; label: Localized; terms: string[] }[];
};

function isLocalized(value: unknown): value is Localized {
  return Boolean(value && typeof value === "object" &&
    typeof (value as Localized).es === "string" && typeof (value as Localized).en === "string");
}

export async function loadSkillCatalog(signal: AbortSignal): Promise<RemoteSkillGroup[]> {
  const response = await fetch(API_URL + "/api/v1/demo/skills", { signal, cache: "no-store" });
  if (!response.ok) throw new Error("Skill catalog request failed (" + response.status + ")");
  const body: unknown = await response.json();
  if (!body || typeof body !== "object" || !("groups" in body) || !Array.isArray(body.groups)) {
    throw new Error("Invalid skill catalog response");
  }
  const groups: RemoteSkillGroup[] = body.groups.map((group: unknown) => {
    if (!group || typeof group !== "object") throw new Error("Invalid skill group");
    const g = group as Record<string, unknown>;
    if (typeof g.id !== "string" || !isLocalized(g.label) || !Array.isArray(g.tasks)) throw new Error("Invalid skill group");
    const tasks = g.tasks.map((entry: unknown) => {
      if (!entry || typeof entry !== "object") throw new Error("Invalid skill task");
      const task = entry as Record<string, unknown>;
      if (typeof task.id !== "string" || !isLocalized(task.label) ||
        !Array.isArray(task.terms) || !task.terms.every((x) => typeof x === "string")) {
        throw new Error("Invalid skill task");
      }
      return { id: task.id as SkillTaskId, label: task.label, terms: task.terms as string[] };
    });
    return { id: g.id, label: g.label, tasks };
  });
  return groups;
}

/**
 * Intentionally send only matchmaking fields. Descriptions, names, aliases,
 * experience claims and optional notes are not necessary and are excluded.
 * This demo API accepts a client-provided snapshot, NOT trusted persistent data.
 */
export function matchPayload(communityId: string, data: CooperationState, projects: Project[]) {
  return {
    communityId,
    needs: data.needs.map((n) => ({
      id: n.id, communityId: n.communityId, kind: n.kind, tag: n.tag,
      title: n.title, active: n.active, skillTaskIds: n.skillTaskIds ?? []
    })),
    capabilities: data.capabilities.map((c) => ({
      id: c.id, communityId: c.communityId, optedIn: c.optedIn, skillTaskIds: c.skillTaskIds ?? []
    })),
    assets: data.assets.map((a) => ({
      id: a.id, communityId: a.communityId, tag: a.tag, title: a.title,
      optedIn: a.optedIn, loan: a.loan ? { status: a.loan.status } : null
    })),
    groupBuys: data.groupBuys.map((buy) => ({
      id: buy.id, communityId: buy.communityId, tag: buy.tag, phase: buy.phase
    })),
    projects: projects.map((p) => ({
      id: p.id, communityId: p.communityId, title: p.title,
      needs: p.needs.map((n) => ({
        quantity: n.quantity, pledged: n.pledged, skillTaskIds: n.skillTaskIds ?? []
      }))
    }))
  };
}

export async function loadOpportunities(requestJson: string, signal: AbortSignal): Promise<Opportunity[]> {
  const response = await fetch(API_URL + "/api/v1/demo/opportunities/match", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: requestJson, signal, cache: "no-store"
  });
  if (!response.ok) throw new Error("Matching API request failed (" + response.status + ")");
  const body: unknown = await response.json();
  if (!body || typeof body !== "object" || !("opportunities" in body) ||
    !Array.isArray(body.opportunities)) throw new Error("Invalid matching API response");
  return body.opportunities.map((item: unknown) => {
    if (!item || typeof item !== "object") throw new Error("Invalid opportunity");
    const o = item as Record<string, unknown>;
    if (typeof o.id !== "string" || typeof o.needId !== "string" ||
      typeof o.targetId !== "string" || !["loan", "buy", "project"].includes(String(o.kind)) ||
      !isLocalized(o.title) || !isLocalized(o.explanation)) throw new Error("Invalid opportunity");
    return o as Opportunity;
  });
}
