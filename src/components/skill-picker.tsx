"use client";

import { useState } from "react";
import { SKILL_CATALOG, searchSkills, type SkillTaskId } from "@/lib/skills";
import type { Language } from "@/lib/model";

export function SkillPicker({ language, selected, onChange }: {
  language: Language;
  selected: SkillTaskId[];
  onChange: (value: SkillTaskId[]) => void;
}) {
  const [search, setSearch] = useState("");
  const visible = searchSkills(search);
  return <fieldset className="skill-picker">
    <legend>{language === "es" ? "Elige actividades específicas" : "Choose specific activities"}</legend>
    <label className="skill-search-label">
      {language === "es" ? "Buscar habilidades (español o inglés)" : "Search skills (Spanish or English)"}
      <input value={search} type="search" onChange={(event) => setSearch(event.target.value)}
        placeholder={language === "es" ? "Ej. huerto, matemática, bicicletas…" : "E.g. gardening, math, bicycles…"} />
    </label>
    <div className="skill-groups">
      {SKILL_CATALOG.map((group) => {
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
      {visible.length === 0 && <p className="hub-hint">{language === "es"
        ? "No existe esa actividad en el catálogo. Puedes sugerirla para una revisión futura; no se utilizará para coincidencias automáticas todavía."
        : "That activity isn't in the catalog yet. It can be proposed for future review but won't trigger automatic matching."}</p>}
    </div>
    <p className="hub-hint">{language === "es"
      ? "Solo las actividades seleccionadas se utilizan para buscar coincidencias. Los comentarios libres no alteran esa selección."
      : "Only explicitly selected activities drive matching. Free-form notes cannot alter the selection."}</p>
  </fieldset>;
}
