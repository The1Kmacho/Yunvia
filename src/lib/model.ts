import type { CooperationState, NeedTag } from "./cooperation";

export type Language = "es" | "en";
export type Localized = { es: string; en: string };
export type Stage = "active" | "planning" | "completed";
export type Category = "nature" | "sharing" | "food" | "other";

export type Community = {
  id: string;
  name: string;
  location: string;
  description: Localized;
  memberCount: number;
};

export type Milestone = {
  id: string;
  title: Localized;
  done: boolean;
};

export type ResourceNeed = {
  id: string;
  title: Localized;
  quantity: number;
  pledged: number;
  tags?: NeedTag[];
};

export type Project = {
  id: string;
  communityId: string;
  title: Localized;
  description: Localized;
  category: Category;
  stage: Stage;
  members: number;
  milestones: Milestone[];
  needs: ResourceNeed[];
};

export type DemoState = {
  communities: Community[];
  projects: Project[];
  selectedCommunityId: string;
  myPledges: string[];
  cooperation: CooperationState;
};

export function localized(value: string): Localized {
  return { es: value, en: value };
}

export function progress(project: Project): number {
  if (project.milestones.length === 0) return 0;
  return Math.round(100 * project.milestones.filter((m) => m.done).length / project.milestones.length);
}

export function projectStatus(project: Project): Stage {
  if (project.milestones.length > 0 && project.milestones.every((m) => m.done)) return "completed";
  return project.stage;
}
