import type { DemoState } from "./model";

export const STORAGE_KEY = "yunvia-demo-v1";

export function initialDemoState(): DemoState {
  return {
    selectedCommunityId: "barrio-verde",
    myPledges: [],
    communities: [
      {
        id: "barrio-verde",
        name: "Barrio Verde",
        location: "San Juan, Puerto Rico",
        memberCount: 42,
        description: {
          es: "Vecinos creando soluciones juntos, una idea a la vez.",
          en: "Neighbors creating solutions together, one idea at a time."
        }
      },
      {
        id: "comunidad-sol",
        name: "Comunidad del Sol",
        location: "Bayamón, Puerto Rico",
        memberCount: 27,
        description: {
          es: "Compartimos lo que sabemos y construimos lo que necesitamos.",
          en: "We share what we know and build what we need."
        }
      }
    ],
    projects: [
      {
        id: "garden",
        communityId: "barrio-verde",
        title: { es: "Huerto comunitario", en: "Community garden" },
        description: {
          es: "Transformemos un espacio en un huerto donde crezcan alimentos y nuevas amistades.",
          en: "Turn an open space into a garden where food and friendships can grow."
        },
        category: "nature",
        stage: "active",
        members: 18,
        milestones: [
          { id: "g1", title: { es: "Reunir al equipo", en: "Gather the team" }, done: true },
          { id: "g2", title: { es: "Conseguir el espacio", en: "Find a space" }, done: true },
          { id: "g3", title: { es: "Diseñar el huerto", en: "Plan the garden" }, done: true },
          { id: "g4", title: { es: "Preparar la tierra", en: "Prepare the soil" }, done: false },
          { id: "g5", title: { es: "Sembrar juntos", en: "Plant together" }, done: false }
        ],
        needs: [
          { id: "g-volunteers", title: { es: "Voluntarios", en: "Volunteers" }, quantity: 4, pledged: 1 },
          { id: "g-watering", title: { es: "Regaderas", en: "Watering cans" }, quantity: 2, pledged: 0 }
        ]
      },
      {
        id: "tools",
        communityId: "barrio-verde",
        title: { es: "Biblioteca de herramientas", en: "Tool library" },
        description: {
          es: "Herramientas compartidas para que cada hogar pueda reparar, crear y ahorrar.",
          en: "Shared tools so every household can repair, create and save."
        },
        category: "sharing",
        stage: "planning",
        members: 12,
        milestones: [
          { id: "t1", title: { es: "Escuchar necesidades", en: "Collect community needs" }, done: true },
          { id: "t2", title: { es: "Hacer inventario", en: "Make an inventory" }, done: false },
          { id: "t3", title: { es: "Organizar préstamos", en: "Set up lending" }, done: false },
          { id: "t4", title: { es: "Abrir la biblioteca", en: "Open the library" }, done: false }
        ],
        needs: [
          { id: "t-drills", title: { es: "Taladros", en: "Drills" }, quantity: 3, pledged: 1 },
          { id: "t-shelves", title: { es: "Estantes", en: "Shelving" }, quantity: 2, pledged: 0 }
        ]
      },
      {
        id: "food",
        communityId: "barrio-verde",
        title: { es: "Compra colectiva de alimentos", en: "Community food buying" },
        description: {
          es: "Exploremos compras en grupo para que los alimentos rindan más.",
          en: "Explore group purchasing to make the grocery budget go further."
        },
        category: "food",
        stage: "planning",
        members: 16,
        milestones: [
          { id: "f1", title: { es: "Reunir hogares interesados", en: "Find interested households" }, done: true },
          { id: "f2", title: { es: "Comparar suplidores", en: "Compare suppliers" }, done: false },
          { id: "f3", title: { es: "Coordinar primera compra", en: "Coordinate the first order" }, done: false }
        ],
        needs: [
          { id: "f-families", title: { es: "Hogares participantes", en: "Participating households" }, quantity: 20, pledged: 16 },
          { id: "f-suppliers", title: { es: "Contactos de suplidores", en: "Supplier contacts" }, quantity: 2, pledged: 0 }
        ]
      },
      {
        id: "solar",
        communityId: "comunidad-sol",
        title: { es: "Taller de ahorro energético", en: "Energy savings workshop" },
        description: {
          es: "Intercambiar consejos prácticos para reducir el consumo de energía en casa.",
          en: "Share practical tips for reducing home energy use."
        },
        category: "sharing",
        stage: "planning",
        members: 9,
        milestones: [
          { id: "s1", title: { es: "Definir los temas", en: "Choose workshop topics" }, done: true },
          { id: "s2", title: { es: "Preparar el taller", en: "Prepare the workshop" }, done: false }
        ],
        needs: [{ id: "s-facilitators", title: { es: "Facilitadores", en: "Facilitators" }, quantity: 2, pledged: 0 }]
      }
    ]
  };
}
