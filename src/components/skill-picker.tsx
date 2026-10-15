"use client";

import { useEffect, useState } from "react";
import { CONNECTED_DEMO, loadSkillCatalog, type RemoteSkillGroup } from "@/lib/backend-api";
import { SKILL_CATALOG, searchSkills, type SkillTaskId } from "@/lib/skills";
import type { Language } from "@/lib/model";

export function SkillPicker({ language, selected, onChange }: {
  language: Language;
  selected: SkillTaskId[];
  onChange: (value: SkillTaskId[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [remote, setRemote] = useState<{ groups: RemoteSkillGroup[]; error: string | null } | null>(null);
  useEffect(() => {
    if (!CONNECTED_DEMO) return;
    const controller = new AbortController();
    void loadSkillCatalog(controller.signal)
      .then((groups) => setRemote({ groups, error: null }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setRemote({ groups: [], error: error instanceof Error ? error.message : "API unavailable" });
        }
      });
    return () => controller.abort();
  }, []);
  const catalog = CONNECTED_DEMO ? remote?.groups ?? [] : SKILL_CATALOG;
  const normalizedQuery = search.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().trim();
  const visible = CONNECTED_DEMO
    ? catalog.flatMap((group) => group.tasks.filter((task) =>
      !normalizedQuery || [group.label.es, group.label.en, task.label.es, task.label.en, ...task.terms]
        .some((term) => term.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().includes(normalizedQuery))
    ).map((task) => task.id))
    : searchSkills(search);
  return <fieldset className="skill-picker">
    <legend>{language === "es" ? "Elige actividades específicas" : "Choose specific activities"}</legend>
    <label className="skill-search-label">
      {language === "es" ? "Buscar habilidades (español o inglés)" : "Search skills (Spanish or English)"}
      <input value={search} type="search" onChange={(event) => setSearch(event.target.value)}
        placeholder={language === "es" ? "Ej. huerto, matemática, bicicletas…" : "E.g. gardening, math, bicycles…"} />
    </label>
    <div className="skill-groups">
      {CONNECTED_DEMO && !remote && <p className="hub-hint">{language === "es" ? "Cargando catálogo desde el API…" : "Loading catalog from API…"}</p>}
      {CONNECTED_DEMO && remote?.error && <p role="alert" className="hub-api-error">{language === "es" ? "No se pudo cargar el catálogo. Inicia la API .NET." : "Skill catalog unavailable. Start the .NET API."} ({remote.error})</p>}
      {catalog.map((group) => {
        const tasks = group.tasks.filter((task) => visible.includes(task.id));
        return tasks.length ? <div className="skill-group" key={group.id}>
          <strong>{group.label[language]}</strong>
          {tasks.map((task) => <label className="skill-option" key={task.id}>
            <input type="checkbox" checked={selected.includes(task.id)}
              onChange={(event) => onChange(event.target.checked ? [...selected, task.id] : selected.filter((id) => id !== task.id))}/>
            <span>{task.label[language]}</span>
          </label>)}
        </div> : null;
      })}
      {visible.length === 0 && (!CONNECTED_DEMO || Boolean(remote && !remote.error)) && <p className="hub-hint">{language === "es"
        ? "No existe esa actividad en el catálogo. Puedes sugerirla para una revisión futura; no se utilizará para coincidencias automáticas todavía."
        : "That activity isn't in the catalog yet. It can be proposed for future review but won't trigger automatic matching."}</p>}
    </div>
    <p className="hub-hint">{language === "es"
      ? "Solo las actividades seleccionadas se utilizan para buscar coincidencias. Los comentarios libres no alteran esa selección."
      : "Only explicitly selected activities drive matching. Free-form notes cannot alter the selection."}</p>
  </fieldset>;
}
