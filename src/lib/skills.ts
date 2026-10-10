import type { Language, Localized } from "./model";

export const SKILL_CATALOG = [
  {
    id: "agriculture", label: { es: "Agricultura y huertos", en: "Gardening and agriculture" },
    tasks: [
      { id: "gardening.planting", label: { es: "Sembrar y trasplantar", en: "Planting and transplanting" }, terms: ["sembrar", "plantar", "planting", "seedlings"] },
      { id: "gardening.soil", label: { es: "Preparar y cuidar el suelo", en: "Soil preparation and care" }, terms: ["tierra", "suelo", "soil", "compost"] },
      { id: "gardening.planning", label: { es: "Planificar un huerto", en: "Planning a garden" }, terms: ["diseñar huertos", "huerto", "garden planning"] }
    ]
  },
  {
    id: "education", label: { es: "Educación y enseñanza", en: "Education and tutoring" },
    tasks: [
      { id: "tutoring.math", label: { es: "Enseñar matemáticas", en: "Math tutoring" }, terms: ["mates", "matematicas", "maths", "algebra"] },
      { id: "tutoring.digital", label: { es: "Enseñar habilidades digitales", en: "Teaching digital skills" }, terms: ["computadora", "computers", "digital literacy"] }
    ]
  },
  {
    id: "repair", label: { es: "Reparación y tecnología", en: "Repair and technology" },
    tasks: [
      { id: "repair.computers", label: { es: "Diagnóstico de computadoras", en: "Computer troubleshooting" }, terms: ["pc", "windows", "laptop", "computadoras"] },
      { id: "repair.bicycles", label: { es: "Reparación básica de bicicletas", en: "Basic bicycle repair" }, terms: ["bicicleta", "bici", "bikes", "cycle"] }
    ]
  },
  {
    id: "community", label: { es: "Organización y apoyo", en: "Organization and assistance" },
    tasks: [
      { id: "community.events", label: { es: "Organizar eventos", en: "Event coordination" }, terms: ["eventos", "logistica", "events", "organizer"] },
      { id: "community.transport", label: { es: "Coordinar transporte", en: "Transportation coordination" }, terms: ["transporte", "rides", "transportation"] }
    ]
  },
  {
    id: "food", label: { es: "Alimentos y cocina", en: "Food and cooking" },
    tasks: [
      { id: "food.meals", label: { es: "Preparar comidas comunitarias", en: "Community meal preparation" }, terms: ["cocina", "cocinar", "cooking", "meal prep"] },
      { id: "food.preservation", label: { es: "Conservar alimentos", en: "Food preservation" }, terms: ["conservas", "fermentacion", "preserving", "canning"] }
    ]
  }
] as const satisfies ReadonlyArray<{
  id: string; label: Localized; tasks: ReadonlyArray<{ id: string; label: Localized; terms: ReadonlyArray<string> }>
}>;

export type SkillTaskId = (typeof SKILL_CATALOG)[number]["tasks"][number]["id"];
export type ExperienceLevel = "beginner" | "experienced" | "professional";
export type ContributionMode = "volunteer" | "exchange" | "paid";
export const ALL_SKILL_TASK_IDS: readonly SkillTaskId[] = SKILL_CATALOG.flatMap((group) => group.tasks.map((task) => task.id));

export function isSkillTaskId(value: string): value is SkillTaskId {
  return ALL_SKILL_TASK_IDS.some((item) => item === value);
}

export function taskLabel(id: SkillTaskId, language: Language): string {
  for (const group of SKILL_CATALOG) {
    const task = group.tasks.find((item) => item.id === id);
    if (task) return task.label[language];
  }
  return id;
}

function clean(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

/** Search uses curated bilingual names/synonyms, never submitted descriptions. */
export function searchSkills(query: string): SkillTaskId[] {
  const q = clean(query.trim());
  if (!q) return [...ALL_SKILL_TASK_IDS];
  return SKILL_CATALOG.flatMap((group) =>
    group.tasks.filter((task) =>
      [group.label.es, group.label.en, task.label.es, task.label.en, ...task.terms].some((term) => clean(term).includes(q))
    ).map((task) => task.id)
  );
}

export function normalizeSkillSelection(input: readonly string[]): SkillTaskId[] {
  return [...new Set(input.filter(isSkillTaskId))];
}

/** Human-readable notes are not part of matching. Only explicit, catalogued tasks are. */
export function matchingTasks(
  required: readonly SkillTaskId[] | undefined,
  offered: readonly SkillTaskId[] | undefined
): SkillTaskId[] {
  if (!required || !offered) return [];
  return normalizeSkillSelection(required).filter((id) => offered.includes(id));
}
