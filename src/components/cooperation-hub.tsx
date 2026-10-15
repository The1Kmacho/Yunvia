"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CONNECTED_DEMO, matchPayload, loadOpportunities } from "@/lib/backend-api";
import { SkillPicker } from "./skill-picker";
import { normalizeSkillSelection, taskLabel, type SkillTaskId, type ExperienceLevel, type ContributionMode } from "@/lib/skills";
import {
  advanceGroupBuy, advanceLoan, chooseQuote, findOpportunities, potentialGrossDifference,
  requestAsset, selectedQuote, setMyUnits, totalUnits,
  type CommunityNeed, type CooperationState, type NeedKind, type NeedTag, type SharedAsset, type GroupBuy, type Opportunity
} from "@/lib/cooperation";
import type { Language, Localized, Project } from "@/lib/model";

type HubTab = "discover" | "buying" | "sharing";
type Labels = Record<string, string>;

const wording: Record<Language, Labels> = {
  es: {
    eyebrow: "DONDE EMPIEZA LA COOPERACIÓN", title: "Descubre lo que podemos lograr.",
    subtitle: "Expresa lo que necesitas. Comparte lo que tienes. Yunvia conecta oportunidades para actuar juntos.",
    demo: "Demostración local: no se envían solicitudes reales, ni se guardan pagos.",
    discover: "Oportunidades", buying: "Compras colectivas", sharing: "Biblioteca de recursos",
    matches: "Oportunidades para tu comunidad", matchesCaption: "Reglas claras basadas en necesidades y recursos publicados voluntariamente.",
    howMatched: "Por qué aparece", loan: "Solicitar herramienta", buy: "Ver compra", project: "Colaborar con el proyecto",
    none: "No encontramos oportunidades por ahora. Publica una necesidad o capacidad para comenzar.",
    newNeed: "Publicar una necesidad", needPrompt: "¿Qué necesitas?", needPlaceholder: "Ej. Quiero usar un taladro este fin de semana",
    type: "Tipo", tool: "Herramienta", groceries: "Compra", skills: "Habilidad", typeItem: "Recurso o interés",
    publish: "Publicar", existingNeeds: "Necesidades compartidas", addSkill: "Compartir una habilidad",
    skillDesc: "Solo las actividades seleccionadas del catálogo generan coincidencias. La descripción no se usa para emparejar.",
    skillLabel: "Habilidad disponible", optedIn: "Visibilidad voluntaria", activeNeed: "Visible en esta comunidad",
    labelDrill: "Taladro", labelMower: "Cortadora de grama", labelRice: "Arroz", labelEggs: "Huevos", labelVegetables: "Vegetales", labelGardening: "Huertos", labelTutoring: "Tutorías",
    roleMember: "Participante", roleOrganizer: "Organizador", roleExplain: "Estas vistas simulan responsabilidades separadas; aún no hay permisos de servidor.",
    buyingFlow: "Así funciona la compra colectiva", step1: "1. Vecinos muestran interés", step2: "2. El organizador obtiene cotizaciones", step3: "3. Cada miembro confirma su cantidad al precio propuesto", step4: "4. Se alcanza el mínimo y se cierran compromisos", step5: "5. Pago externo, recogido y distribución",
    terms: "Detalles del producto", pickup: "Logística y recogido", memberCost: "Mi total estimado", committed: "Mi cantidad comprometida",
    organizerControls: "Acciones del organizador (simulación)", memberControls: "Participación voluntaria",
    quoteResetWarning: "Cambiar el suplidor/precio anula los compromisos anteriores; se solicitarán otra vez.",
    notePriceChange: "Cotización actualizada. Se reiniciaron los compromisos para proteger el consentimiento.",
    voluntary: "Puedes modificar o retirar tu compromiso mientras se reúnen participantes. Pagos fuera de Yunvia.",
    skillSelfReport: "La experiencia es autodeclarada y no equivale a una licencia o certificación verificada.",
    skillLevel: "Nivel de experiencia (declarado)", beginner: "Aprendiendo", experienced: "Con experiencia", professional: "Profesional (sin verificar)",
    skillMode: "Cómo quiero ayudar", volunteer: "Voluntariado", exchange: "Intercambio", paid: "Servicio pagado",
    skillConsent: "Acepto mostrar estas actividades a los miembros de esta comunidad (demo)",
    selectedSkillNotice: "Selecciona al menos una actividad del catálogo.",
    noteOptional: "Descripción adicional (opcional, no determina las coincidencias)",
    unindexedSkill: "Habilidad antigua sin clasificación; no se usa para coincidencias",
    sampleBuySpec: "Especificaciones del producto", sampleBuyPickup: "Plan de recogido o entrega",
    productCatalog: "Producto del catálogo", buySummary: "Resumen antes de comprometerte",
    noRealOrder: "No existe ningún pedido real: los números, pagos y suplidores son de ejemplo.",
    groupTitle: "Comprar mejor, juntos", groupSubtitle: "Agrupa demanda, compara cotizaciones y organiza una compra sin que Yunvia custodie dinero.",
    groupNo: "Aquí todavía no hay compras colectivas. Puedes proponer una.",
    price: "por unidad", quantity: "Unidades comprometidas", minimum: "Mínimo para proceder",
    quote: "Cotización seleccionada", alternatives: "Comparar suplidores", unitsMe: "Mi compromiso (unidades)",
    update: "Actualizar compromiso", locked: "Compromisos cerrados", collecting: "Reuniendo participantes", fulfilled: "Distribución completada",
    selectQuote: "Seleccionar cotización", confirm: "Cerrar compromisos", complete: "Marcar como completada",
    minimumHint: "Primero se debe alcanzar el mínimo con aportaciones voluntarias.",
    comparison: "Diferencia bruta estimada frente a precio de referencia", compareDisclaimer: "Solo demostración: cotizaciones y precio de referencia ficticios. Excluye transporte, impuestos y otros costos. No equivale a ahorro real.",
    noReference: "Sin precio de referencia para comparar", buyingDemo: "Los botones de coordinación representan acciones del organizador en esta demo; no hay dinero ni proveedores reales.",
    newBuy: "Proponer una compra", buyTitle: "Producto", supplier: "Suplidor (nombre de prueba)", quotePrice: "Precio unitario", basePrice: "Precio de referencia opcional", minQty: "Cantidad mínima", createBuy: "Crear compra",
    loanTitle: "Compartir para ahorrar", loanSubtitle: "Gestiona solicitudes, aprobaciones y devoluciones de artículos ofrecidos voluntariamente.",
    noAssets: "No hay recursos compartidos aquí. Publica uno para empezar.",
    available: "Disponible", requested: "Solicitud pendiente", approved: "Préstamo aprobado", returned: "Devuelto · disponible de nuevo",
    by: "Ofrecido por", ask: "Solicitar préstamo", approve: "Aprobar solicitud", return: "Registrar devolución",
    borrowedDemo: "En una aplicación real, aprobar y devolver requeriría permisos y confirmación de ambas partes.",
    addAsset: "Compartir una herramienta", assetName: "Nombre del artículo", assetDescription: "Reglas de préstamo / descripción", offer: "Publicar recurso",
    localOnly: "Lo que agregues quedará solo en este navegador.", explain: "Sin puntuaciones opacas: cada sugerencia explica los datos utilizados.",
    close: "Cancelar", save: "Guardar", needsProject: "Conectar con proyectos", helpNeeded: "Se busca ayuda",
    nothingHere: "No hay aportaciones compartidas todavía.",
    needPublished: "Necesidad publicada en esta comunidad", offerPublished: "Recurso publicado en esta comunidad",
    skillPublished: "Habilidad compartida en esta comunidad", buyPublished: "Compra colectiva creada",
    actionsNotice: "Los valores y acciones de esta pantalla son ficticios y solo sirven para probar los flujos."
  },
  en: {
    eyebrow: "WHERE COOPERATION BEGINS", title: "Discover what we can accomplish.",
    subtitle: "Share what you need. Offer what you have. Yunvia connects opportunities to act together.",
    demo: "Local demonstration: requests aren't sent to real people and no payments are handled.",
    discover: "Opportunities", buying: "Group buying", sharing: "Shared resources",
    matches: "Opportunities in your community", matchesCaption: "Transparent rules based on needs and resources people voluntarily shared.",
    howMatched: "Why this match", loan: "Request tool", buy: "See group purchase", project: "Help with this project",
    none: "No opportunities found yet. Post a need or a capability to get started.",
    newNeed: "Post a need", needPrompt: "What do you need?", needPlaceholder: "E.g. A drill for weekend repairs",
    type: "Type", tool: "Tool", groceries: "Buying", skills: "Skill", typeItem: "Resource or interest",
    publish: "Post", existingNeeds: "Shared needs", addSkill: "Share a skill",
    skillDesc: "Only selected catalog activities generate matches. Descriptions are not matching keys.",
    skillLabel: "Available skill", optedIn: "Shared voluntarily", activeNeed: "Visible in this community",
    labelDrill: "Drill", labelMower: "Lawn mower", labelRice: "Rice", labelEggs: "Eggs", labelVegetables: "Vegetables", labelGardening: "Gardening", labelTutoring: "Tutoring",
    roleMember: "Participant", roleOrganizer: "Organizer", roleExplain: "These views simulate separate responsibilities; no server permissions exist yet.",
    buyingFlow: "How group buying works", step1: "1. Neighbors express interest", step2: "2. Organizer collects supplier quotes", step3: "3. Each member confirms quantities against the price", step4: "4. The minimum is reached and commitments close", step5: "5. External payment, pickup and distribution",
    terms: "Product details", pickup: "Pickup and distribution", memberCost: "My estimated total", committed: "My committed quantity",
    organizerControls: "Organizer actions (simulation)", memberControls: "Voluntary participation",
    quoteResetWarning: "Changing supplier/price voids earlier commitments; people must agree again.",
    notePriceChange: "Supplier quote updated. Commitments reset to protect consent.",
    voluntary: "You can change or withdraw your commitment while the group is collecting members. Payments occur outside Yunvia.",
    skillSelfReport: "Experience is self-reported and does not constitute a verified license or certification.",
    skillLevel: "Experience level (self-reported)", beginner: "Learning", experienced: "Experienced", professional: "Professional (unverified)",
    skillMode: "How I want to help", volunteer: "Volunteer", exchange: "Exchange", paid: "Paid service",
    skillConsent: "I agree to show these activities to members of this community (demo)",
    selectedSkillNotice: "Choose at least one task from the catalog.",
    noteOptional: "Additional description (optional; not used for matching)",
    unindexedSkill: "Older unclassified skill; excluded from automatic matches",
    sampleBuySpec: "Product specifications", sampleBuyPickup: "Pickup or delivery plan",
    productCatalog: "Catalog product", buySummary: "Review before committing",
    noRealOrder: "No actual orders exist: quantities, suppliers and payments are fictional.",
    groupTitle: "Buy better, together", groupSubtitle: "Pool demand, compare quotes, and coordinate purchases without Yunvia holding anyone's money.",
    groupNo: "No group purchases here yet. You can propose one.",
    price: "per unit", quantity: "Committed units", minimum: "Minimum order",
    quote: "Selected quote", alternatives: "Compare suppliers", unitsMe: "My commitment (units)",
    update: "Update commitment", locked: "Commitments locked", collecting: "Collecting interest", fulfilled: "Distribution complete",
    selectQuote: "Choose quote", confirm: "Close commitments", complete: "Mark fulfilled",
    minimumHint: "Voluntary commitments must meet the minimum before proceeding.",
    comparison: "Estimated gross difference vs reference price", compareDisclaimer: "Demo only: supplier quotes and reference price are fictional. Excludes delivery, tax, and other costs. This is not verified savings.",
    noReference: "No reference price to compare", buyingDemo: "Coordinator buttons represent organizer actions in this demo; no real payments or suppliers.",
    newBuy: "Propose a purchase", buyTitle: "Product", supplier: "Sample supplier name", quotePrice: "Unit price", basePrice: "Optional reference price", minQty: "Minimum quantity", createBuy: "Create purchase",
    loanTitle: "Share more, spend less", loanSubtitle: "Manage requests, approvals and returns for voluntarily shared items.",
    noAssets: "No shared assets here yet. Add one to begin.",
    available: "Available", requested: "Request pending", approved: "Loan approved", returned: "Returned · available again",
    by: "Shared by", ask: "Request loan", approve: "Approve request", return: "Record return",
    borrowedDemo: "In a real app, approvals and returns would require permissions and confirmation by both parties.",
    addAsset: "Share a tool", assetName: "Item name", assetDescription: "Lending rules / description", offer: "List resource",
    localOnly: "Anything you add stays in this browser.", explain: "No opaque scores: every suggestion explains the input behind it.",
    close: "Cancel", save: "Save", needsProject: "Connect with projects", helpNeeded: "Help wanted",
    nothingHere: "No shared contributions yet.",
    needPublished: "Need shared with this demo community", offerPublished: "Resource shared with this demo community",
    skillPublished: "Skill shared with this demo community", buyPublished: "Group buying initiative created",
    actionsNotice: "The values and actions shown here are fictional and provided for workflow testing."
  }
};

const kindTags: Record<NeedKind, NeedTag[]> = {
  tool: ["drill", "mower"],
  buy: ["rice", "eggs", "vegetables"],
  skill: ["skill"]
};
function both(text: string): Localized { return { es: text, en: text }; }
function number(value: number, locale: Language) { return new Intl.NumberFormat(locale === "es" ? "es-PR" : "en-US", { maximumFractionDigits: 2 }).format(value); }
function money(value: number, locale: Language) { return new Intl.NumberFormat(locale === "es" ? "es-PR" : "en-US", { style: "currency", currency: "USD" }).format(value); }
function id() { return crypto.randomUUID(); }

export function CooperationHub({ language, communityId, projects, state, onChange, onOpenProject }: {
  language: Language;
  communityId: string;
  projects: Project[];
  state: CooperationState;
  onChange: (update: (previous: CooperationState) => CooperationState) => void;
  onOpenProject: (id: string) => void;
}) {
  const [tab, setTab] = useState<HubTab>("discover");
  const [form, setForm] = useState<"need" | "skill" | "asset" | "buy" | null>(null);
  const [needKind, setNeedKind] = useState<NeedKind>("tool");
  const [selectedTasks, setSelectedTasks] = useState<SkillTaskId[]>([]);
  const [buyRole, setBuyRole] = useState<"member" | "organizer">("member");
  const [unitsDraft, setUnitsDraft] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const t = (key: string) => wording[language][key] ?? key;
  // The matching request serializes only fields required by the server matcher.
  // Key the response to that precise snapshot to avoid showing stale community data.
  const snapshot = JSON.stringify(matchPayload(communityId, state, projects));
  const [remoteMatches, setRemoteMatches] = useState<{
    snapshot: string; items: Opportunity[]; error: string | null;
  } | null>(null);
  useEffect(() => {
    if (!CONNECTED_DEMO) return;
    const controller = new AbortController();
    void loadOpportunities(snapshot, controller.signal)
      .then((items) => setRemoteMatches({ snapshot, items, error: null }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setRemoteMatches({ snapshot, items: [], error: error instanceof Error ? error.message : "API unavailable" });
        }
      });
    return () => controller.abort();
  }, [snapshot]);
  const currentRemote = remoteMatches?.snapshot === snapshot ? remoteMatches : null;
  const opportunities = CONNECTED_DEMO ? currentRemote?.items ?? [] : findOpportunities(state, projects, communityId);
  const needs = state.needs.filter((need) => need.communityId === communityId && need.active);
  const buys = state.groupBuys.filter((buy) => buy.communityId === communityId);
  const assets = state.assets.filter((asset) => asset.communityId === communityId && asset.optedIn);
  const capabilities = state.capabilities.filter((cap) => cap.communityId === communityId && cap.optedIn);
  function update(action: (previous: CooperationState) => CooperationState, message?: string) {
    onChange(action);
    if (message) setNotice(message);
  }
  function showOpportunity(kind: "loan" | "buy" | "project", targetId: string) {
    if (kind === "project") { onOpenProject(targetId); return; }
    setTab(kind === "loan" ? "sharing" : "buying");
    window.setTimeout(() => document.getElementById("hub-item-" + targetId)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  }
  function needSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const note = String(data.get("note") ?? "").trim().slice(0, 260);
    const tag = String(data.get("tag") ?? "") as NeedTag;
    const tasks = normalizeSkillSelection(selectedTasks);
    if (needKind === "skill" && tasks.length === 0) { setNotice(t("selectedSkillNotice")); return; }
    if (needKind !== "skill" && !kindTags[needKind].includes(tag)) return;
    const title: Localized = needKind === "skill" ? {
      es: tasks.map((skill) => taskLabel(skill, "es")).join(", "),
      en: tasks.map((skill) => taskLabel(skill, "en")).join(", ")
    } : {
      es: ({ drill: "Taladro", mower: "Cortadora de grama", rice: "Arroz", eggs: "Huevos", vegetables: "Vegetales" } as Record<string, string>)[tag] ?? tag,
      en: ({ drill: "Drill", mower: "Lawn mower", rice: "Rice", eggs: "Eggs", vegetables: "Vegetables" } as Record<string, string>)[tag] ?? tag
    };
    const need: CommunityNeed = { id: id(), communityId, kind: needKind, tag: needKind === "skill" ? "skill" : tag,
      title, active: true, ...(needKind === "skill" ? { skillTaskIds: tasks } : {}), note };
    update((old) => ({ ...old, needs: [need, ...old.needs] }), t("needPublished"));
    setSelectedTasks([]);
    setForm(null);
  }

  function assetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const title = String(values.get("title") ?? "").trim();
    const description = String(values.get("description") ?? "").trim();
    const tag = String(values.get("tag")) as NeedTag;
    if (!title || !["drill", "mower"].includes(tag)) return;
    const asset: SharedAsset = { id: id(), communityId, tag, title: both(title), description: both(description),
      ownerAlias: language === "es" ? "Tú (demo)" : "You (demo)", optedIn: true, loan: null };
    update((old) => ({ ...old, assets: [asset, ...old.assets] }), t("offerPublished"));
    setForm(null);
  }
  function skillSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const tasks = normalizeSkillSelection(selectedTasks);
    if (tasks.length === 0 || values.get("consent") !== "yes") { setNotice(t("selectedSkillNotice")); return; }
    const experience = String(values.get("experience")) as ExperienceLevel;
    const mode = String(values.get("mode")) as ContributionMode;
    if (!["beginner", "experienced", "professional"].includes(experience) ||
      !["volunteer", "exchange", "paid"].includes(mode)) return;
    const note = String(values.get("note") ?? "").trim().slice(0, 260);
    update((old) => ({ ...old, capabilities: [{
      id: id(), communityId, tag: "skill",
      title: { es: tasks.map((task) => taskLabel(task, "es")).join(", "),
        en: tasks.map((task) => taskLabel(task, "en")).join(", ") },
      memberAlias: language === "es" ? "Tú (demo)" : "You (demo)", optedIn: true,
      skillTaskIds: tasks, experience, mode, note
    }, ...old.capabilities] }), t("skillPublished"));
    setSelectedTasks([]);
    setForm(null);
  }

  function buySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const product = String(values.get("product") ?? "");
    const supplier = String(values.get("supplier") ?? "").trim();
    const price = Number(values.get("price"));
    const min = Number(values.get("min"));
    const refRaw = String(values.get("reference") ?? "").trim();
    const referencePrice = refRaw === "" ? null : Number(refRaw);
    const spec = String(values.get("specification") ?? "").trim().slice(0, 160);
    const pickup = String(values.get("pickup") ?? "").trim().slice(0, 220);
    if (!["rice", "eggs", "vegetables"].includes(product) || !spec || !pickup || !supplier || !Number.isFinite(price) || price <= 0 ||
      !Number.isInteger(min) || min < 1 || min > 100 ||
      (referencePrice !== null && (!Number.isFinite(referencePrice) || referencePrice < 0))) return;
    const buy: GroupBuy = {
      id: id(), communityId, tag: product as NeedTag,
      title: {
        es: ({ rice: "Compra colectiva de arroz", eggs: "Compra colectiva de huevos", vegetables: "Compra colectiva de vegetales" } as Record<string, string>)[product],
        en: ({ rice: "Community rice purchase", eggs: "Community egg purchase", vegetables: "Community vegetable purchase" } as Record<string, string>)[product]
      },
      specification: both(spec), fulfillmentPlan: both(pickup),
      unit: both(language === "es" ? "unidad" : "unit"),
      supplierQuotes: [{ id: id(), supplier, pricePerUnit: price }], selectedQuoteId: "",
      referencePrice, minimumUnits: min, outsideUnits: 0, myUnits: 0, phase: "collecting"
    };
    buy.selectedQuoteId = buy.supplierQuotes[0].id;
    update((old) => ({ ...old, groupBuys: [buy, ...old.groupBuys] }), t("buyPublished"));
    setForm(null);
  }

  function renderForm() {
    if (!form) return null;
    const titleKey = form === "need" ? "newNeed" : form === "skill" ? "addSkill" : form === "asset" ? "addAsset" : "newBuy";
    return <div className="hub-form-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setForm(null); }}>
      <section role="dialog" aria-modal="true" aria-label={t(titleKey)} className="hub-form-card">
        <div className="hub-form-head"><h3>{t(titleKey)}</h3>
          <button type="button" onClick={() => setForm(null)} aria-label={t("close")}>×</button></div>
        <form className="hub-form-fields" onSubmit={form === "need" ? needSubmit : form === "skill" ? skillSubmit : form === "asset" ? assetSubmit : buySubmit}>
          {form === "need" && <label>{t("type")}<select value={needKind} onChange={(event) => { setNeedKind(event.target.value as NeedKind); setSelectedTasks([]); }}>
            <option value="tool">{t("tool")}</option><option value="buy">{t("groceries")}</option><option value="skill">{t("skills")}</option>
          </select></label>}
          {((form === "need" && needKind !== "skill") || form === "asset") && <label>{t("typeItem")}
            <select key={form + needKind} name="tag">
              {(form === "asset" ? kindTags.tool : kindTags[needKind]).map((tag) =>
                <option key={tag} value={tag}>{t("label" + tag[0].toUpperCase() + tag.slice(1))}</option>)}
            </select></label>}
          {(form === "skill" || (form === "need" && needKind === "skill")) &&
            <SkillPicker language={language} selected={selectedTasks} onChange={setSelectedTasks} />}
          {form === "asset" && <>
            <label>{t("assetName")}<input name="title" maxLength={110} required autoFocus /></label>
            <label>{t("assetDescription")}<textarea name="description" rows={3} maxLength={300}/></label>
          </>}
          {form === "skill" && <>
            <div className="hub-two-fields">
              <label>{t("skillLevel")}<select name="experience" defaultValue="beginner">
                {(["beginner","experienced","professional"] as ExperienceLevel[]).map((value) => <option value={value} key={value}>{t(value)}</option>)}
              </select></label>
              <label>{t("skillMode")}<select name="mode" defaultValue="volunteer">
                {(["volunteer","exchange","paid"] as ContributionMode[]).map((value) => <option value={value} key={value}>{t(value)}</option>)}
              </select></label>
            </div>
            <p className="hub-hint">{t("skillSelfReport")}</p>
            <label className="hub-checkline"><input required type="checkbox" name="consent" value="yes"/> {t("skillConsent")}</label>
          </>}
          {form === "need" || form === "skill" ? <label>{t("noteOptional")}
            <textarea name="note" rows={2} maxLength={260} placeholder={t("needPlaceholder")}/></label> : null}
          {form === "buy" && <>
            <label>{t("productCatalog")}<select name="product" defaultValue="rice">
              {kindTags.buy.map((tag) => <option key={tag} value={tag}>{t("label" + tag[0].toUpperCase() + tag.slice(1))}</option>)}
            </select></label>
            <label>{t("sampleBuySpec")}<input name="specification" maxLength={160} required placeholder={language === "es" ? "Ej. saco de 5 lb" : "E.g. 5 lb bag"} /></label>
            <label>{t("sampleBuyPickup")}<input name="pickup" maxLength={220} required placeholder={language === "es" ? "Ej. centro comunitario, sábado" : "E.g. community center, Saturday"} /></label>
            <label>{t("supplier")}<input name="supplier" maxLength={100} required/></label>
            <div className="hub-two-fields">
              <label>{t("quotePrice")}<input name="price" required type="number" min="0.01" step="0.01"/></label>
              <label>{t("minQty")}<input name="min" required type="number" min="1" max="100" step="1" defaultValue={5}/></label>
            </div>
            <label>{t("basePrice")}<input name="reference" type="number" min="0" step="0.01"/></label>
          </>}
          <p className="hub-hint">{t(form === "skill" ? "skillDesc" : "localOnly")}</p>
          <div className="hub-form-actions">
            <button type="button" className="hub-button outline" onClick={() => setForm(null)}>{t("close")}</button>
            <button type="submit" className="hub-button filled" disabled={(form === "skill" || (form === "need" && needKind === "skill")) && selectedTasks.length === 0}>{t("publish")}</button>
          </div>
        </form>
      </section>
    </div>;
  }
  return <div className="cooperation-hub">
    <header className="hub-header"><span className="hub-eyebrow">✳ {t("eyebrow")}</span><h1>{t("title")}</h1>
      <p>{t("subtitle")}</p><div className="hub-info">ⓘ {t("demo")}</div>
    </header>
    <nav className="hub-tabs" aria-label={t("title")}>
      {(["discover", "buying", "sharing"] as HubTab[]).map((value) => <button type="button" key={value} onClick={() => { setTab(value); setNotice(""); }}
        aria-current={tab === value ? "page" : undefined} className={tab === value ? "selected" : ""}>{t(value)}</button>)}
    </nav>
    {notice && <div role="status" className="hub-notice">{notice}</div>}
    {tab === "discover" && <>
      <div className="hub-heading-row"><div><h2>{t("matches")}</h2><p>{t("matchesCaption")}</p></div>
        <button className="hub-button filled" type="button" onClick={() => setForm("need")}>+ {t("newNeed")}</button></div>
      <div className="hub-source-label">
        {CONNECTED_DEMO
          ? (language === "es" ? "Coincidencias calculadas por ASP.NET Core (demostración)" : "Matching calculated by ASP.NET Core (demo)")
          : (language === "es" ? "Coincidencias locales de la demostración — conecta .NET para probar la API" : "Browser-only demo matching — connect .NET to test the API")}
      </div>
      {CONNECTED_DEMO && !currentRemote && <p role="status" className="hub-hint">
        {language === "es" ? "Consultando la API de oportunidades…" : "Checking the opportunities API…"}
      </p>}
      {CONNECTED_DEMO && currentRemote?.error && <p role="alert" className="hub-api-error">
        {language === "es"
          ? "No se pueden obtener coincidencias del servidor. Inicia la API .NET y verifica la conexión."
          : "Server matching is unavailable. Start the .NET API and verify the connection."} ({currentRemote.error})
      </p>}
      {opportunities.length ? <div className="hub-match-list">
        {opportunities.map((match) => <article className="hub-match" key={match.id}>
          <div className="hub-match-icon" aria-hidden="true">{match.kind === "loan" ? "🧰" : match.kind === "buy" ? "🛒" : "🌱"}</div>
          <div className="hub-match-main"><span className="hub-match-tag">{match.kind === "loan" ? t("sharing") : match.kind === "buy" ? t("buying") : t("needsProject")}</span>
            <h3>{match.title[language]}</h3><p><strong>{t("howMatched")}:</strong> {match.explanation[language]}</p>
          </div>
          <button type="button" className="hub-button outline" onClick={() => showOpportunity(match.kind, match.targetId)}>
            {t(match.kind)} <span aria-hidden="true">→</span></button>
        </article>)}
      </div> : (!CONNECTED_DEMO || (currentRemote && !currentRemote.error)) && <div className="hub-empty">{t("none")}</div>}
      <div className="hub-two-col">
        <section className="hub-surface"><div className="hub-heading-row small"><div><h2>{t("existingNeeds")}</h2><p>{t("activeNeed")}</p></div></div>
          {needs.length ? needs.map((need) => <div className="hub-simple-row" key={need.id}><span>◌</span><div><strong>{need.title[language]}</strong><small>{t(need.kind === "tool" ? "tool" : need.kind === "buy" ? "groceries" : "skills")}{need.note ? " · " + need.note : ""}</small></div></div>)
            : <p className="hub-hint">{t("nothingHere")}</p>}</section>
        <section className="hub-surface"><div className="hub-heading-row small"><div><h2>{t("addSkill")}</h2><p>{t("explain")}</p></div><button className="hub-button outline" type="button" onClick={() => setForm("skill")}>+ {t("publish")}</button></div>
          {capabilities.length ? capabilities.map((cap) => <div className="hub-simple-row" key={cap.id}>
        <span>✳</span><div><strong>{(cap.skillTaskIds ?? []).length ? cap.skillTaskIds!.map((task) => taskLabel(task, language)).join(", ") : t("unindexedSkill")}</strong>
        <small>{cap.memberAlias} · {t("optedIn")}{cap.experience ? " · " + t(cap.experience) : ""}{cap.mode ? " · " + t(cap.mode) : ""}</small>
        {cap.note && <small>{cap.note}</small>}</div></div>)
            : <p className="hub-hint">{t("nothingHere")}</p>}</section>
      </div>
    </>}
    {tab === "buying" && <>
      <div className="hub-heading-row"><div><h2>{t("groupTitle")}</h2><p>{t("groupSubtitle")}</p></div>
        <button className="hub-button filled" type="button" onClick={() => setForm("buy")}>+ {t("newBuy")}</button></div>
      <div className="hub-buying-guide">
        <h3>{t("buyingFlow")}</h3>
        <ol>{(["step1", "step2", "step3", "step4", "step5"] as const).map((key) => <li key={key}>{t(key)}</li>)}</ol>
      </div>
      <div className="hub-role-panel">
        <div className="hub-role-switch" aria-label={t("roleExplain")}>
          <button type="button" aria-pressed={buyRole === "member"} className={buyRole === "member" ? "selected" : ""} onClick={() => setBuyRole("member")}>{t("roleMember")}</button>
          <button type="button" aria-pressed={buyRole === "organizer"} className={buyRole === "organizer" ? "selected" : ""} onClick={() => setBuyRole("organizer")}>{t("roleOrganizer")}</button>
        </div><p className="hub-hint">{t("roleExplain")}</p>
      </div>
      <p className="hub-hint">{t("noRealOrder")}</p>
      {buys.length ? buys.map((buy) => {
        const quote = selectedQuote(buy);
        const gross = potentialGrossDifference(buy);
        const currentUnits = unitsDraft[buy.id] ?? String(buy.myUnits);
        return <article id={"hub-item-" + buy.id} key={buy.id} className="hub-operation">
          <div className="hub-op-head"><div><span className="hub-op-type">🛒 {t("buying")}</span><h3>{buy.title[language]}</h3></div>
            <span className={"hub-stage " + buy.phase}>{t(buy.phase)}</span></div>
          <div className="hub-buy-details">
            <div><strong>{t("terms")}</strong><span>{buy.specification?.[language] ?? buy.title[language]}</span></div>
            <div><strong>{t("pickup")}</strong><span>{buy.fulfillmentPlan?.[language] ?? t("buyingDemo")}</span></div>
          </div>
          <div className="hub-metrics">
            <div><strong>{totalUnits(buy)}</strong><span>{t("quantity")}</span></div>
            <div><strong>{buy.minimumUnits}</strong><span>{t("minimum")}</span></div>
            <div><strong>{quote ? money(quote.pricePerUnit, language) : "—"}</strong><span>{t("price")}</span></div>
          </div>
          <div className="hub-progress" aria-label={number(Math.min(100, 100 * totalUnits(buy) / buy.minimumUnits), language) + "%"}>
            <div style={{ width: Math.min(100, 100 * totalUnits(buy) / buy.minimumUnits) + "%" }}/></div>
          <div className="hub-buy-summary">
            <span>{t("quote")}: <strong>{quote?.supplier ?? "—"}</strong></span>
            <span>{t("committed")}: <strong>{buy.myUnits}</strong></span>
            <span>{t("memberCost")}: <strong>{quote ? money(quote.pricePerUnit * buy.myUnits, language) : "—"}</strong></span>
          </div>
          {buyRole === "member" ? <div className="hub-member-panel">
            <h4>{t("memberControls")}</h4>
            <p className="hub-hint">{t("voluntary")}</p>
            <div className="hub-workflow-controls">
              <label>{t("unitsMe")}<input type="number" min="0" max="100" step="1"
                disabled={buy.phase !== "collecting"} value={currentUnits}
                onChange={(event) => setUnitsDraft((old) => ({ ...old, [buy.id]: event.target.value }))}/></label>
              <button className="hub-button filled" type="button" disabled={buy.phase !== "collecting" ||
                !Number.isInteger(Number(currentUnits)) || currentUnits.trim() === "" ||
                Number(currentUnits) < 0 || Number(currentUnits) > 100}
                onClick={() => update((old) => setMyUnits(old, buy.id, Number(currentUnits)))}>{t("update")}</button>
            </div>
          </div> : <div className="hub-organizer-panel">
            <h4>{t("organizerControls")}</h4>
            <div className="hub-quote-area">
              <label>{t("alternatives")}<select value={buy.selectedQuoteId} disabled={buy.phase !== "collecting"}
                onChange={(event) => {
                  if (event.target.value === buy.selectedQuoteId) return;
                  update((old) => chooseQuote(old, buy.id, event.target.value), t("notePriceChange"));
                  setUnitsDraft((old) => ({ ...old, [buy.id]: "0" }));
                }}>
                {buy.supplierQuotes.map((item) => <option key={item.id} value={item.id}>{item.supplier} — {money(item.pricePerUnit, language)} / {buy.unit[language]}</option>)}
              </select></label>
              <div><small>{t("comparison")}</small><strong>{gross === null ? t("noReference") : money(gross, language)}</strong></div>
            </div>
            <p className="hub-hint">{t("quoteResetWarning")}</p>
            <p className="hub-hint">{t("compareDisclaimer")}</p>
            <div className="hub-workflow-controls">
              <button className="hub-button filled" type="button" disabled={buy.phase === "fulfilled" ||
                (buy.phase === "collecting" && totalUnits(buy) < buy.minimumUnits)}
                onClick={() => update((old) => advanceGroupBuy(old, buy.id))}>
                {buy.phase === "collecting" ? t("confirm") : buy.phase === "locked" ? t("complete") : t("fulfilled")}
              </button>
              {buy.phase === "collecting" && totalUnits(buy) < buy.minimumUnits && <p className="hub-hint">{t("minimumHint")}</p>}
            </div>
          </div>}
        </article>;
      }) : <div className="hub-empty">{t("groupNo")}</div>}
    </>}
    {tab === "sharing" && <>
      <div className="hub-heading-row"><div><h2>{t("loanTitle")}</h2><p>{t("loanSubtitle")}</p></div>
        <button className="hub-button filled" onClick={() => setForm("asset")} type="button">+ {t("addAsset")}</button></div>
      <p className="hub-hint">{t("borrowedDemo")}</p>
      {assets.length ? <div className="hub-assets">{assets.map((asset) => {
        const status = asset.loan?.status ?? "available";
        return <article id={"hub-item-" + asset.id} className="hub-asset" key={asset.id}>
          <div className="hub-asset-icon" aria-hidden="true">🧰</div><div className="hub-asset-copy">
            <span className={"hub-stage " + status}>{t(status)}</span><h3>{asset.title[language]}</h3><p>{asset.description[language]}</p>
            <small>{t("by")}: {asset.ownerAlias}</small></div>
          <button type="button" className="hub-button outline" onClick={() =>
              update((old) => status === "available" || status === "returned" ? requestAsset(old, asset.id) : advanceLoan(old, asset.id))}
            >{status === "available" || status === "returned" ? t("ask") : status === "requested" ? t("approve") : t("return")}</button>
        </article>;
      })}</div> : <div className="hub-empty">{t("noAssets")}</div>}
    </>}
    <p className="hub-footnote">{t("actionsNotice")}</p>
    {renderForm()}
  </div>;
}
