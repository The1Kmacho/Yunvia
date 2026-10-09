"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { initialDemoState, STORAGE_KEY } from "@/lib/demo-data";
import { translate } from "@/lib/copy";
import {
  localized,
  progress,
  projectStatus,
  type Category,
  type Community,
  type DemoState,
  type Language,
  type Project,
  type ResourceNeed
} from "@/lib/model";

type Page = "home" | "projects" | "resources" | "community";
type Modal = { type: "project" } | { type: "community" } | { type: "detail"; projectId: string } | null;
type IconName = "home" | "projects" | "resources" | "community" | "plus" | "arrow" | "close" | "check" | "leaf" | "pin" | "chevron" | "reset" | "heart" | "spark" | "menu";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></>,
    projects: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 9h8M8 13h8M8 17h4" /></>,
    resources: <><path d="M4 7h16v13H4zM2 7l3-4h14l3 4M12 7v13M4 13h16" /></>,
    community: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2zM17 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <><path d="M4 12h16m-7-7 7 7-7 7" /></>,
    close: <path d="M5 5l14 14M19 5 5 19" />,
    check: <path d="m5 12 4 4L19 6" />,
    leaf: <><path d="M19 4c-9 0-14 4-14 10a6 6 0 0 0 6 6c6 0 10-5 8-16Z" /><path d="M7 17c3-4 6-6 10-8" /></>,
    pin: <><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    chevron: <path d="m9 6 6 6-6 6" />,
    reset: <><path d="M4 9a8 8 0 1 1-1 6M4 4v5h5" /></>,
    heart: <path d="M20.8 8.7c0 5-8.8 11-8.8 11s-8.8-6-8.8-11a5 5 0 0 1 8.8-3 5 5 0 0 1 8.8 3Z" />,
    spark: <><path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2Z" /></>,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const glyphs: Record<Page, IconName> = { home: "home", projects: "projects", resources: "resources", community: "community" };
const categoryEmoji: Record<Category, string> = { nature: "🌱", sharing: "🧰", food: "🥬", other: "✳" };

function isDemoState(value: unknown): value is DemoState {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<DemoState>;
  return Array.isArray(data.communities) &&
    data.communities.every((c) => c && typeof c.id === "string" && typeof c.name === "string") &&
    Array.isArray(data.projects) &&
    data.projects.every((p) => p && typeof p.id === "string" && typeof p.communityId === "string" && p.title &&
      Array.isArray(p.milestones) && Array.isArray(p.needs) &&
      p.milestones.every((m) => m && typeof m.id === "string" && typeof m.done === "boolean") &&
      p.needs.every((n) => n && typeof n.id === "string" && typeof n.quantity === "number" && typeof n.pledged === "number")) &&
    Array.isArray(data.myPledges) && typeof data.selectedCommunityId === "string";
}

function field(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

function ProjectCard({ project, language, onOpen }: {
  project: Project;
  language: Language;
  onOpen: () => void;
}) {
  const t = (key: string) => translate(language, key);
  const percent = progress(project);
  const outstanding = project.needs.filter((need) => need.pledged < need.quantity).length;
  return (
    <button type="button" className="project-card" onClick={onOpen} aria-label={project.title[language] + " — " + t("viewProject")}>
      <div className={"project-art art-" + project.category}>
        <span className="art-halo" aria-hidden="true" />
        <span className="art-symbol" aria-hidden="true">{categoryEmoji[project.category]}</span>
        <span className="art-leaf-one" aria-hidden="true">✳</span>
        <span className="art-leaf-two" aria-hidden="true">✦</span>
      </div>
      <div className="project-card-body">
        <div className="card-eyebrow"><span className={"status-dot status-" + projectStatus(project)} />{t(projectStatus(project))} <span className="meta-divider">·</span> {t(project.category)}</div>
        <h3>{project.title[language]}</h3>
        <p className="clamp-two">{project.description[language]}</p>
        <div className="project-facts">
          <span><Icon name="community" size={16} /> {project.members} {t("peopleInvolved")}</span>
          <span>{outstanding} {t("projectNeedsShort")}</span>
        </div>
        <div className="progress-caption"><span>{t("progress")}</span><strong>{percent}%</strong></div>
        <div className="progress-track"><div className="progress-fill" style={{ width: percent + "%" }} /></div>
        <div className="card-action">{t("viewProject")} <Icon name="arrow" size={17} /></div>
      </div>
    </button>
  );
}

function ResourceRow({ need, project, language, pledgedByMe, onPledge }: {
  need: ResourceNeed;
  project: Project;
  language: Language;
  pledgedByMe: boolean;
  onPledge: () => void;
}) {
  const t = (key: string) => translate(language, key);
  const left = Math.max(0, need.quantity - need.pledged);
  return (
    <div className="resource-row">
      <div className={"resource-icon resource-" + project.category} aria-hidden="true">{categoryEmoji[project.category]}</div>
      <div className="resource-details">
        <strong>{need.title[language]}</strong>
        <span>{project.title[language]} <span className="meta-divider">·</span> {left} {t("remaining")}</span>
      </div>
      <button className={pledgedByMe ? "button button-pledged" : "button button-outline"} type="button"
        onClick={onPledge} disabled={left === 0 && !pledgedByMe}>
        {pledgedByMe ? <><Icon name="check" size={15} /> {t("pledged")}</> : left === 0 ? t("full") : t("offer")}
      </button>
    </div>
  );
}

function Dialog({ title, subtitle, children, onClose, language }: {
  title: string; subtitle?: string; children: ReactNode; onClose: () => void; language: Language;
}) {
  useEffect(() => {
    function escape(event: KeyboardEvent) { if (event.key === "Escape") onClose(); }
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [onClose]);
  return (
    <div className="dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="dialog-panel">
        <header className="dialog-header">
          <div><h2 id="dialog-title">{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
          <button className="icon-button" type="button" aria-label={translate(language, "close")} onClick={onClose}><Icon name="close" /></button>
        </header>
        <div className="dialog-content">{children}</div>
      </section>
    </div>
  );
}

export function YunviaApp() {
  const [language, setLanguage] = useState<Language>("es");
  const [page, setPage] = useState<Page>("home");
  const [demo, setDemo] = useState<DemoState>(initialDemoState);
  const [hydrated, setHydrated] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const t = (key: string) => translate(language, key);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isDemoState(parsed)) setDemo(parsed);
      }
      const savedLanguage = window.localStorage.getItem("yunvia-language");
      if (savedLanguage === "en" || savedLanguage === "es") setLanguage(savedLanguage);
    } catch {
      // Storage may be blocked, or old demo data may be malformed. The demo still works in memory.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demo)); }
    catch { /* Private browsing may disable local storage. */ }
  }, [demo, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = language;
    try { window.localStorage.setItem("yunvia-language", language); }
    catch { /* In-memory language setting is still usable. */ }
  }, [language, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const current = demo.communities.find((community) => community.id === demo.selectedCommunityId) ?? demo.communities[0];
  const communityProjects = demo.projects.filter((project) => project.communityId === current?.id);
  const openNeeds = communityProjects.flatMap((project) =>
    project.needs.filter((need) => need.pledged < need.quantity).map((need) => ({ project, need }))
  );
  const activeCount = communityProjects.filter((project) => projectStatus(project) !== "completed").length;
  const detailProject = modal?.type === "detail" ? demo.projects.find((project) => project.id === modal.projectId) : undefined;

  function navigate(next: Page) {
    setPage(next);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetDemo() {
    if (!window.confirm(t("resetConfirm"))) return;
    setDemo(initialDemoState());
    setPage("home");
    setModal(null);
    setToast(t("resetToast"));
  }

  function createCommunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = field(form, "name");
    const location = field(form, "location");
    const description = field(form, "description");
    if (!name || !location || !description) { setToast(t("required")); return; }
    const id = crypto.randomUUID();
    const community: Community = { id, name, location, description: localized(description), memberCount: 1 };
    setDemo((before) => ({
      ...before, communities: [...before.communities, community], selectedCommunityId: id
    }));
    setModal(null);
    setPage("community");
    setToast(t("createdCommunity"));
  }

  function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = field(form, "title");
    const description = field(form, "description");
    const category = field(form, "category") as Category;
    const needsText = field(form, "needs");
    if (!title || !description) { setToast(t("required")); return; }
    const needs: ResourceNeed[] = needsText.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 12)
      .map((name) => ({ id: crypto.randomUUID(), title: localized(name), quantity: 1, pledged: 0 }));
    const project: Project = {
      id: crypto.randomUUID(), communityId: current.id,
      title: localized(title), description: localized(description),
      category: ["nature", "sharing", "food", "other"].includes(category) ? category : "other",
      stage: "planning", members: 1,
      milestones: [{ id: crypto.randomUUID(), title: localized(language === "es" ? "Organizar el primer encuentro" : "Plan the first meetup"), done: false }],
      needs
    };
    setDemo((before) => ({ ...before, projects: [project, ...before.projects] }));
    setModal({ type: "detail", projectId: project.id });
    setPage("projects");
    setToast(t("createdProject"));
  }

  function togglePledge(projectId: string, needId: string) {
    let changed = false;
    let removing = false;
    setDemo((before) => {
      const already = before.myPledges.includes(needId);
      removing = already;
      const projects = before.projects.map((project) => project.id !== projectId ? project : ({
        ...project,
        needs: project.needs.map((need) => {
          if (need.id !== needId) return need;
          if (!already && need.pledged >= need.quantity) return need;
          changed = true;
          return { ...need, pledged: Math.max(0, need.pledged + (already ? -1 : 1)) };
        })
      }));
      if (!changed) return before;
      return {
        ...before, projects,
        myPledges: already ? before.myPledges.filter((id) => id !== needId) : [...before.myPledges, needId]
      };
    });
    // React may schedule state updates; feedback reflects the user's requested action.
    setToast(removing ? t("unpledgedToast") : t("pledgedToast"));
  }

  function toggleMilestone(projectId: string, milestoneId: string) {
    setDemo((before) => ({
      ...before, projects: before.projects.map((project) => project.id !== projectId ? project : ({
        ...project, milestones: project.milestones.map((m) => m.id === milestoneId ? { ...m, done: !m.done } : m)
      }))
    }));
    setToast(t("savedToast"));
  }

  function addNeed(event: FormEvent<HTMLFormElement>, projectId: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = field(form, "need");
    if (!title) return;
    const need: ResourceNeed = { id: crypto.randomUUID(), title: localized(title), quantity: 1, pledged: 0 };
    setDemo((before) => ({
      ...before, projects: before.projects.map((project) => project.id === projectId ?
        { ...project, needs: [...project.needs, need] } : project)
    }));
    event.currentTarget.reset();
    setToast(t("needAdded"));
  }

  function renderProjects(projects: Project[]) {
    return projects.length ? <div className="project-grid">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} language={language}
          onOpen={() => setModal({ type: "detail", projectId: project.id })} />
      ))}
    </div> : <div className="empty-state"><span aria-hidden="true">🌿</span><p>{t("noProjects")}</p>
      <button className="button button-primary" onClick={() => setModal({ type: "project" })}><Icon name="plus" size={17} />{t("start")}</button>
    </div>;
  }

  function renderNeeds(limit?: number) {
    const items = limit ? openNeeds.slice(0, limit) : openNeeds;
    return items.length ? <div className="resource-list">
      {items.map(({ project, need }) => <ResourceRow key={need.id} need={need} project={project}
        language={language} pledgedByMe={demo.myPledges.includes(need.id)}
        onPledge={() => togglePledge(project.id, need.id)} />)}
    </div> : <div className="empty-state compact"><span aria-hidden="true">✨</span><p>{t("noResources")}</p></div>;
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">{t("home")}</a>
      <aside className={"sidebar" + (mobileMenu ? " sidebar-open" : "")}>
        <div className="brand"><div className="brand-mark"><Icon name="leaf" size={25} /></div>
          <div><div className="brand-word">yunvia<span>.</span></div><div className="brand-line">{t("tagline")}</div></div>
        </div>
        <div className="sidebar-label">{t("navHeading")}</div>
        <nav aria-label={t("navHeading")} className="sidebar-nav">
          {(["home", "projects", "resources", "community"] as Page[]).map((item) =>
            <button type="button" key={item} className={"nav-item" + (page === item ? " nav-active" : "")}
              aria-current={page === item ? "page" : undefined} onClick={() => navigate(item)}>
              <Icon name={glyphs[item]} size={20} /> {t(item)}
              {item === "projects" && <span className="nav-count">{communityProjects.length}</span>}
            </button>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-community-icon"><Icon name="heart" size={20} /></div>
          <strong>{t("communityBadge")}</strong>
          <p>{t("communityHelp")}</p>
          <button className="sidebar-community-button" type="button" onClick={() => setModal({ type: "community" })}>
            <Icon name="plus" size={16} /> {t("createCommunity")}
          </button>
        </div>
        <button className="reset-action" type="button" onClick={resetDemo}><Icon name="reset" size={16} /> {t("reset")}</button>
      </aside>
      {mobileMenu && <button type="button" className="mobile-scrim" onClick={() => setMobileMenu(false)} aria-label={t("close")} />}
      <div className="main-shell">
        <header className="topbar">
          <button className="menu-toggle icon-button" onClick={() => setMobileMenu(true)} aria-label={t("community")}><Icon name="menu" /></button>
          <div className="crumb"><span className="crumb-dot" /> {t("home")} <Icon name="chevron" size={14} /> <strong>{t(page)}</strong></div>
          <div className="top-actions">
            <label className="community-select-label"><span>{t("switchCommunity")}</span>
              <select value={current?.id ?? ""} onChange={(event) => setDemo((before) => ({ ...before, selectedCommunityId: event.target.value }))}>
                {demo.communities.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
              </select>
            </label>
            <div className="language-switch" aria-label={t("language")}>
              <button type="button" className={language === "es" ? "chosen" : ""} onClick={() => setLanguage("es")} aria-pressed={language === "es"}>ES</button>
              <button type="button" className={language === "en" ? "chosen" : ""} onClick={() => setLanguage("en")} aria-pressed={language === "en"}>EN</button>
            </div>
            <div className="avatar" title={t("demo")}>Y</div>
          </div>
        </header>

        <main id="main" className="main-content">
          <div className="demo-banner"><span className="demo-pill">● {t("demo")}</span><span>{t("demoNotice")}</span></div>

          {page === "home" && <>
            <div className="greeting-row">
              <div><p className="overline">{current?.name} <span className="tiny-separator">·</span> {current?.location}</p>
                <h1>{t("greeting")}</h1><p className="muted large">{t("greetingCopy")}</p>
              </div>
              <button className="button button-primary desktop-cta" type="button" onClick={() => setModal({ type: "project" })}><Icon name="plus" size={17} />{t("start")}</button>
            </div>

            <section className="hero-panel" aria-labelledby="hero-title">
              <div className="hero-content">
                <div className="hero-eyebrow"><Icon name="spark" size={16} /> {t("heroEyebrow")}</div>
                <h2 id="hero-title">{t("heroTitle")}</h2>
                <p>{t("heroBody")}</p>
                <button className="button button-cream" type="button" onClick={() => navigate("projects")}>{t("explore")} <Icon name="arrow" size={17} /></button>
              </div>
              <div className="hero-art" aria-hidden="true">
                <div className="hero-sun" />
                <div className="hero-hill hill-back" /><div className="hero-hill hill-front" />
                <div className="hero-flower flower-one">✳</div><div className="hero-flower flower-two">✳</div><div className="hero-flower flower-three">✳</div>
                <div className="hero-note"><div className="note-icons">🌱 🫶 🏡</div><strong>{t("heroMini")}</strong><span>{t("heroMembers")}</span></div>
              </div>
            </section>

            <div className="stats-grid">
              <div className="stat-card"><span className="stat-icon icon-sage"><Icon name="projects" size={20} /></span><div><strong>{activeCount}</strong><span>{t("projectsInMotion")}</span></div></div>
              <div className="stat-card"><span className="stat-icon icon-peach"><Icon name="community" size={20} /></span><div><strong>{current?.memberCount ?? 0}</strong><span>{t("communityMembers")}</span></div></div>
              <div className="stat-card"><span className="stat-icon icon-blue"><Icon name="heart" size={20} /></span><div><strong>{openNeeds.length}</strong><span>{t("waysToHelp")}</span></div></div>
            </div>

            <section className="section-block" aria-labelledby="featured-title">
              <div className="section-heading"><div><p className="overline">{t("communityTag")}</p><h2 id="featured-title">{t("featured")}</h2><p className="muted">{t("featuredCopy")}</p></div>
                <button type="button" className="text-action" onClick={() => navigate("projects")}>{t("seeAll")} <Icon name="arrow" size={17} /></button>
              </div>
              {renderProjects(communityProjects.slice(0, 3))}
            </section>

            <div className="bottom-columns">
              <section className="section-block resources-preview" aria-labelledby="need-title">
                <div className="section-heading"><div><p className="overline">{t("helping")}</p><h2 id="need-title">{t("openNeeds")}</h2><p className="muted">{t("openNeedsCopy")}</p></div></div>
                {renderNeeds(3)}
                <button type="button" className="text-action needs-link" onClick={() => navigate("resources")}>{t("viewNeeds")} <Icon name="arrow" size={17} /></button>
              </section>
              <section className="how-card" aria-labelledby="how-title">
                <p className="overline">{t("communityBadge")}</p><h2 id="how-title">{t("how")}</h2><p className="muted">{t("howCopy")}</p>
                <ol>
                  {(["One", "Two", "Three"] as const).map((number, index) =>
                    <li key={number}><span>{index + 1}</span><div><strong>{t("how" + number + "Title")}</strong><p>{t("how" + number)}</p></div></li>
                  )}
                </ol>
              </section>
            </div>
          </>}

          {page === "projects" && <>
            <div className="page-head"><div><p className="overline">{current?.name}</p><h1>{t("projectsTitle")}</h1><p className="muted large">{t("projectsCopy")}</p></div>
              <button className="button button-primary" type="button" onClick={() => setModal({ type: "project" })}><Icon name="plus" size={17} />{t("start")}</button>
            </div>
            {renderProjects(communityProjects)}
          </>}

          {page === "resources" && <>
            <div className="page-head"><div><p className="overline">{current?.name}</p><h1>{t("resourcesTitle")}</h1><p className="muted large">{t("resourcesCopy")}</p></div></div>
            <div className="resource-panel"><div className="resource-panel-head"><h2>{t("openNeeds")}</h2><span className="count-pill">{openNeeds.length} {t("waysToHelp")}</span></div>{renderNeeds()}</div>
            <section className="contributions-panel"><div className="section-heading"><div><h2>{t("yourContributions")}</h2><p className="muted">{demo.myPledges.length} {t("pledgedCount")}</p></div></div>
              {demo.myPledges.length ? demo.projects.flatMap((project) => project.needs.filter((need) => demo.myPledges.includes(need.id)).map((need) =>
                <ResourceRow key={need.id} need={need} project={project} language={language} pledgedByMe onPledge={() => togglePledge(project.id, need.id)} />
              )) : <p className="muted">{t("noPledges")}</p>}
            </section>
          </>}

          {page === "community" && <>
            <div className="page-head"><div><p className="overline">{t("communityBadge")}</p><h1>{t("communityTitle")}</h1><p className="muted large">{t("communityCopy")}</p></div>
              <button className="button button-primary" type="button" onClick={() => setModal({ type: "community" })}><Icon name="plus" size={17} />{t("createCommunity")}</button>
            </div>
            <div className="community-spotlight"><div className="community-art" aria-hidden="true"><Icon name="leaf" size={48} /></div>
              <div><p className="overline">{t("communityTag")}</p><h2>{current.name}</h2><p className="muted">{current.description[language]}</p>
                <div className="community-meta"><span><Icon name="pin" size={16} /> {current.location}</span><span><Icon name="community" size={16} /> {current.memberCount} {t("people")}</span></div>
              </div>
            </div>
            <section className="section-block"><div className="section-heading"><div><h2>{t("communityProjects")}</h2></div>
              <button type="button" className="text-action" onClick={() => navigate("projects")}>{t("seeAll")} <Icon name="arrow" size={16} /></button></div>
              {renderProjects(communityProjects)}
            </section>
            <section className="section-block"><div className="section-heading"><div><h2>{t("communitiesHere")}</h2></div></div>
              <div className="community-list">{demo.communities.map((community) =>
                <div key={community.id} className="community-row">
                  <div className="community-bubble"><Icon name="community" size={21} /></div>
                  <div><strong>{community.name}</strong><span>{community.location} · {community.memberCount} {t("people")}</span></div>
                  <button type="button" className={community.id === current.id ? "button button-pledged" : "button button-outline"}
                    disabled={community.id === current.id} onClick={() => { setDemo((before) => ({ ...before, selectedCommunityId: community.id })); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                    {community.id === current.id ? t("selected") : t("changeTo")}
                  </button>
                </div>)}
              </div>
            </section>
          </>}

          <footer className="site-footer"><span>yunvia<span className="logo-period">.</span></span>{t("footer")}</footer>
        </main>
      </div>

      {toast && <div className="toast" role="status" aria-live="polite"><Icon name="check" size={18} />{toast}</div>}

      {modal?.type === "project" && <Dialog title={t("projectTitle")} subtitle={t("projectHint")} language={language} onClose={() => setModal(null)}>
        <form className="form-stack" onSubmit={createProject}>
          <label>{t("name")} <span aria-hidden="true">*</span><input name="title" maxLength={90} required autoFocus placeholder={t("titlePlaceholder")} /></label>
          <label>{t("description")} <span aria-hidden="true">*</span><textarea name="description" maxLength={700} rows={4} required placeholder={t("descriptionPlaceholder")} /></label>
          <label>{t("category")}<select name="category" defaultValue="nature">
            {(["nature", "sharing", "food", "other"] as Category[]).map((value) => <option key={value} value={value}>{t(value)}</option>)}
          </select></label>
          <label>{t("projectNeeds")} <small>{t("optional")}</small><input name="needs" maxLength={300} placeholder={t("needsPlaceholder")} /><small>{t("needsHelp")}</small></label>
          <div className="form-actions"><button type="button" className="button button-outline" onClick={() => setModal(null)}>{t("cancel")}</button><button type="submit" className="button button-primary">{t("publishProject")} <Icon name="arrow" size={16} /></button></div>
        </form>
      </Dialog>}

      {modal?.type === "community" && <Dialog title={t("communityFormTitle")} subtitle={t("communityFormHint")} language={language} onClose={() => setModal(null)}>
        <form className="form-stack" onSubmit={createCommunity}>
          <label>{t("name")} <span aria-hidden="true">*</span><input name="name" maxLength={80} required autoFocus placeholder={t("communityNamePlaceholder")} /></label>
          <label>{t("location")} <span aria-hidden="true">*</span><input name="location" maxLength={100} required placeholder={t("locationPlaceholder")} /></label>
          <label>{t("description")} <span aria-hidden="true">*</span><textarea name="description" maxLength={500} rows={3} required placeholder={t("communityDescriptionPlaceholder")} /></label>
          <div className="form-actions"><button type="button" className="button button-outline" onClick={() => setModal(null)}>{t("cancel")}</button><button type="submit" className="button button-primary">{t("create")} <Icon name="arrow" size={16} /></button></div>
        </form>
      </Dialog>}

      {detailProject && <Dialog title={detailProject.title[language]} subtitle={t(projectStatus(detailProject)) + " · " + t(detailProject.category)} language={language} onClose={() => setModal(null)}>
        <div className="detail-cover"><div className={"project-art art-" + detailProject.category}><span className="art-symbol" aria-hidden="true">{categoryEmoji[detailProject.category]}</span></div></div>
        <div className="detail-layout">
          <section><h3>{t("detailDescription")}</h3><p className="muted">{detailProject.description[language]}</p></section>
          <section><div className="detail-section-heading"><h3>{t("detailMilestones")}</h3><span className="count-pill">{detailProject.milestones.filter((m) => m.done).length}/{detailProject.milestones.length} {t("doneCount")}</span></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: progress(detailProject) + "%" }} /></div>
            <div className="milestone-list">{detailProject.milestones.map((milestone) =>
              <button type="button" key={milestone.id} className={"milestone" + (milestone.done ? " milestone-done" : "")}
                onClick={() => toggleMilestone(detailProject.id, milestone.id)} aria-label={milestone.title[language] + " — " + t(milestone.done ? "markPending" : "markDone")}>
                <span className="milestone-check">{milestone.done && <Icon name="check" size={14} />}</span>
                {milestone.title[language]}</button>
            )}</div>
          </section>
          <section><h3>{t("detailResources")}</h3>
            {detailProject.needs.length ? <div className="detail-needs">{detailProject.needs.map((need) =>
              <ResourceRow key={need.id} project={detailProject} need={need} language={language} pledgedByMe={demo.myPledges.includes(need.id)}
                onPledge={() => togglePledge(detailProject.id, need.id)} />
            )}</div> : <p className="muted">{t("noNeeds")}</p>}
            <form className="inline-need-form" onSubmit={(event) => addNeed(event, detailProject.id)}>
              <label htmlFor="new-need">{t("addNeed")}</label><div><input id="new-need" name="need" required maxLength={100} placeholder={t("needPlaceholder")} /><button type="submit" className="button button-outline"><Icon name="plus" size={17} />{t("addNeed")}</button></div>
            </form>
          </section>
        </div>
      </Dialog>}
    </div>
  );
}
