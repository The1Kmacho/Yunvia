import { matchingTasks, taskLabel, normalizeSkillSelection, type SkillTaskId, type ExperienceLevel, type ContributionMode } from "./skills.ts";
import type { Localized, Project } from "./model";

export type NeedKind = "tool" | "buy" | "skill";
export type NeedTag = "drill" | "mower" | "rice" | "gardening" | "tutoring" | "skill";
export type CommunityNeed = {
  id: string;
  communityId: string;
  kind: NeedKind;
  tag: NeedTag;
  title: Localized;
  active: boolean;
  skillTaskIds?: SkillTaskId[];
  note?: string;
};

export type Capability = {
  id: string;
  communityId: string;
  tag: NeedTag;
  title: Localized;
  memberAlias: string;
  optedIn: boolean;
  skillTaskIds?: SkillTaskId[];
  experience?: ExperienceLevel;
  mode?: ContributionMode;
  note?: string;
};

export type LoanStatus = "requested" | "approved" | "returned";
export type SharedAsset = {
  id: string;
  communityId: string;
  tag: NeedTag;
  title: Localized;
  description: Localized;
  ownerAlias: string;
  optedIn: boolean;
  loan: null | { id: string; requesterAlias: string; status: LoanStatus };
};
export type SupplierQuote = {
  id: string;
  supplier: string;
  pricePerUnit: number;
};
export type GroupBuy = {
  id: string;
  communityId: string;
  tag: NeedTag;
  title: Localized;
  unit: Localized;
  supplierQuotes: SupplierQuote[];
  selectedQuoteId: string;
  referencePrice: number | null;
  minimumUnits: number;
  outsideUnits: number;
  myUnits: number;
  phase: "collecting" | "locked" | "fulfilled";
  specification?: Localized;
  fulfillmentPlan?: Localized;
};
export type CooperationState = {
  needs: CommunityNeed[];
  capabilities: Capability[];
  assets: SharedAsset[];
  groupBuys: GroupBuy[];
};
export type Opportunity = {
  id: string;
  kind: "loan" | "buy" | "project";
  needId: string;
  targetId: string;
  title: Localized;
  explanation: Localized;
};

export function initialCooperationState(): CooperationState {
  return {
    needs: [
      { id: "need-drill", communityId: "barrio-verde", kind: "tool", tag: "drill", title: { es: "Necesito un taladro para arreglos", en: "Need a drill for home repairs" }, active: true },
      { id: "need-rice", communityId: "barrio-verde", kind: "buy", tag: "rice", title: { es: "Comprar arroz en conjunto", en: "Buy rice with other households" }, active: true },
      { id: "need-garden", communityId: "barrio-verde", kind: "skill", tag: "gardening", skillTaskIds: ["gardening.planting"], title: { es: "Apoyo para sembrar el huerto", en: "Help planting the garden" }, active: true },
      { id: "need-mower", communityId: "comunidad-sol", kind: "tool", tag: "mower", title: { es: "Necesito una máquina de cortar grama", en: "Need a lawn mower" }, active: true }
    ],
    capabilities: [
      { id: "cap-garden", communityId: "barrio-verde", tag: "gardening", title: { es: "Experiencia con huertos", en: "Experience with gardens" }, memberAlias: "Vecina Ana (demo)", optedIn: true, skillTaskIds: ["gardening.planting", "gardening.soil"], experience: "experienced", mode: "volunteer" },
      { id: "cap-private", communityId: "comunidad-sol", tag: "tutoring", title: { es: "Tutorías disponibles", en: "Tutoring available" }, memberAlias: "Perfil privado", optedIn: false, skillTaskIds: ["tutoring.math"], experience: "experienced", mode: "volunteer" }
    ],
    assets: [
      { id: "asset-drill", communityId: "barrio-verde", tag: "drill", title: { es: "Taladro inalámbrico", en: "Cordless drill" }, description: { es: "Para reparaciones pequeñas; coordinar entrega.", en: "For small repairs; arrange pickup." }, ownerAlias: "Carlos (demo)", optedIn: true, loan: null },
      { id: "asset-mower", communityId: "comunidad-sol", tag: "mower", title: { es: "Cortadora de grama", en: "Lawn mower" }, description: { es: "Disponible para préstamos cortos.", en: "Available for short-term lending." }, ownerAlias: "María (demo)", optedIn: true, loan: null }
    ],
    groupBuys: [
      { id: "buy-rice", communityId: "barrio-verde", tag: "rice", title: { es: "Compra colectiva de arroz", en: "Community rice purchase" },
        unit: { es: "saco", en: "bag" },
        supplierQuotes: [{ id: "quote-a", supplier: "Suplidor A (ejemplo)", pricePerUnit: 4.25 }, { id: "quote-b", supplier: "Suplidor B (ejemplo)", pricePerUnit: 4.9 }],
        selectedQuoteId: "quote-a", referencePrice: 6, minimumUnits: 12, outsideUnits: 11, myUnits: 0, phase: "collecting", specification: { es: "Saco de arroz de 5 lb (ejemplo)", en: "5 lb bag of rice (example)" }, fulfillmentPlan: { es: "Recogido comunitario por acordar; pagos directamente con el organizador externo.", en: "Community pickup TBD; payments arranged externally with organizer." } }
    ]
  };
}

export function isCooperationState(value: unknown): value is CooperationState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<CooperationState>;
  return Array.isArray(state.needs) &&
    state.needs.every((n) => n && typeof n.id === "string" && typeof n.communityId === "string" && typeof n.tag === "string") &&
    Array.isArray(state.capabilities) &&
    state.capabilities.every((c) => c && typeof c.id === "string" && typeof c.optedIn === "boolean") &&
    Array.isArray(state.assets) &&
    state.assets.every((a) => a && typeof a.id === "string" && typeof a.optedIn === "boolean" && "loan" in a) &&
    Array.isArray(state.groupBuys) &&
    state.groupBuys.every((b) => b && typeof b.id === "string" && Array.isArray(b.supplierQuotes) && typeof b.myUnits === "number");
}

export function selectedQuote(buy: GroupBuy): SupplierQuote | undefined {
  return buy.supplierQuotes.find((quote) => quote.id === buy.selectedQuoteId);
}

export function totalUnits(buy: GroupBuy): number {
  return buy.outsideUnits + buy.myUnits;
}

export function potentialGrossDifference(buy: GroupBuy): number | null {
  const quote = selectedQuote(buy);
  if (buy.referencePrice === null || !quote) return null;
  return Math.round((buy.referencePrice - quote.pricePerUnit) * totalUnits(buy) * 100) / 100;
}

export function setMyUnits(state: CooperationState, buyId: string, units: number): CooperationState {
  if (!Number.isInteger(units) || units < 0 || units > 100) return state;
  return {
    ...state, groupBuys: state.groupBuys.map((buy) =>
      buy.id === buyId && buy.phase === "collecting" ? { ...buy, myUnits: units } : buy)
  };
}

export function chooseQuote(state: CooperationState, buyId: string, quoteId: string): CooperationState {
  // Quote changes invalidate every prior commitment: nobody agreed to the new terms.
  return { ...state, groupBuys: state.groupBuys.map((buy) =>
    buy.id === buyId && buy.phase === "collecting" && buy.supplierQuotes.some((quote) => quote.id === quoteId)
      ? buy.selectedQuoteId === quoteId ? buy
        : { ...buy, selectedQuoteId: quoteId, outsideUnits: 0, myUnits: 0 }
      : buy) };
}

export function advanceGroupBuy(state: CooperationState, buyId: string): CooperationState {
  return { ...state, groupBuys: state.groupBuys.map((buy) => {
    if (buy.id !== buyId) return buy;
    if (buy.phase === "collecting" && totalUnits(buy) >= buy.minimumUnits && selectedQuote(buy)) return { ...buy, phase: "locked" };
    if (buy.phase === "locked") return { ...buy, phase: "fulfilled" };
    return buy;
  }) };
}

export function requestAsset(state: CooperationState, assetId: string): CooperationState {
  return { ...state, assets: state.assets.map((asset) =>
    asset.id === assetId && asset.optedIn && (!asset.loan || asset.loan.status === "returned")
      ? { ...asset, loan: { id: "demo-" + asset.id, requesterAlias: "Tú (demo)", status: "requested" } } : asset) };
}
export function advanceLoan(state: CooperationState, assetId: string): CooperationState {
  return { ...state, assets: state.assets.map((asset) => {
    if (asset.id !== assetId || !asset.loan) return asset;
    if (asset.loan.status === "requested") return { ...asset, loan: { ...asset.loan, status: "approved" } };
    if (asset.loan.status === "approved") return { ...asset, loan: { ...asset.loan, status: "returned" } };
    return asset;
  }) };
}

export function findOpportunities(
  state: CooperationState, projects: Project[], communityId: string
): Opportunity[] {
  const matched: Opportunity[] = [];
  for (const need of state.needs) {
    if (!need.active || need.communityId !== communityId) continue;
    if (need.kind === "tool") {
      for (const asset of state.assets) {
        if (asset.communityId !== communityId || asset.tag !== need.tag || !asset.optedIn) continue;
        if (asset.loan && asset.loan.status !== "returned") continue;
        matched.push({ id: need.id + ":" + asset.id, kind: "loan", needId: need.id, targetId: asset.id,
          title: { es: "Hay una herramienta disponible", en: "A shared tool is available" },
          explanation: {
            es: "Solicitaste “" + need.title.es + "” y alguien ofreció “" + asset.title.es + "” en tu comunidad.",
            en: "You listed “" + need.title.en + "” and a member opted to share “" + asset.title.en + "” nearby."
          } });
      }
    }
    if (need.kind === "buy") {
      for (const buy of state.groupBuys) {
        if (buy.communityId !== communityId || buy.tag !== need.tag || buy.phase !== "collecting") continue;
        matched.push({ id: need.id + ":" + buy.id, kind: "buy", needId: need.id, targetId: buy.id,
          title: { es: "Puedes unirte a una compra colectiva", en: "A group purchase matches your need" },
          explanation: { es: "Solicitaste “" + need.title.es + "” y ya hay una compra colectiva organizándose.",
            en: "You listed “" + need.title.en + "” and a buying group is already organizing." }
        });
      }
    }
    if (need.kind === "skill" && need.skillTaskIds?.length) {
      // Human-written descriptions, experience claims and broad category tags are never matching keys.
      const eligible = state.capabilities.filter((cap) => cap.optedIn &&
        cap.communityId === communityId && matchingTasks(need.skillTaskIds, cap.skillTaskIds).length > 0);
      if (eligible.length === 0) continue;
      for (const project of projects) {
        if (project.communityId !== communityId) continue;
        const needed = project.needs.find((resource) => resource.pledged < resource.quantity &&
          matchingTasks(need.skillTaskIds, resource.skillTaskIds).length > 0 &&
          eligible.some((cap) => matchingTasks(resource.skillTaskIds, cap.skillTaskIds).length > 0));
        if (!needed) continue;
        const taskId = matchingTasks(need.skillTaskIds, needed.skillTaskIds)[0];
        matched.push({ id: need.id + ":" + project.id, kind: "project", needId: need.id, targetId: project.id,
          title: { es: "Hay colaboradores para este proyecto", en: "Potential project collaborators found" },
          explanation: {
            es: "La actividad “" + taskLabel(taskId, "es") + "” fue seleccionada explícitamente por quien ofrece ayuda y coincide con una necesidad de “" + project.title.es + "”.",
            en: "The task “" + taskLabel(taskId, "en") + "” was explicitly offered and matches an open need in “" + project.title.en + "”."
          } });
      }
    }
  }
  return matched;
}

/** Migrates older local-demo profiles conservatively: unknown, free-text skills remain unmatched. */
export function upgradeCooperationState(value: CooperationState): CooperationState {
  return {
    ...value,
    needs: value.needs.map((need) => need.id === "need-garden" && !need.skillTaskIds
      ? { ...need, skillTaskIds: ["gardening.planting"] as SkillTaskId[] } : need),
    capabilities: value.capabilities.map((cap) => ({
      ...cap,
      skillTaskIds: cap.id === "cap-garden" && !cap.skillTaskIds
        ? (["gardening.planting"] as SkillTaskId[])
        : normalizeSkillSelection(cap.skillTaskIds ?? [])
    }))
  };
}
