import type { Chapter, Lesson, LessonMeta } from "@/lib/content/types";
import { lessons } from "./lessons";

function metaOf(id: string): LessonMeta {
  const l: Lesson | undefined = lessons.find((x) => x.id === id);
  if (!l) throw new Error(`HGE lesson not found: ${id}`);
  return { id: l.id, title: l.title, summary: l.summary, minutes: l.minutes, status: l.status, topics: l.topics };
}

export const chapters: Chapter[] = [
  {
    id: "hge-ch1",
    subjectId: "hge",
    number: 1,
    title: "Fluid Properties & Hydrostatics",
    summary:
      "Properties of fluids, pressure in static liquids, manometers, forces on submerged surfaces, and buoyancy.",
    lessons: [
      metaOf("hge-l-fluid-pressure"),
      metaOf("hge-l-hydrostatic-force-plane"),
      {
        id: "hge-l-buoyancy-stability",
        title: "Buoyancy & Stability of Floating Bodies",
        summary:
          "Archimedes' principle, apparent weight, draft of floating bodies, and stability using the metacentric height.",
        minutes: 15,
        status: "in-preparation",
        topics: ["Archimedes' principle", "Floating bodies", "Metacentric height"],
      },
    ],
  },
  {
    id: "hge-ch2",
    subjectId: "hge",
    number: 2,
    title: "Fluid Flow & Pipe Systems",
    summary:
      "Continuity and energy in pipe flow, friction and minor losses, pipes in series and parallel, and flow measurement.",
    lessons: [
      metaOf("hge-l-energy-equation"),
      {
        id: "hge-l-pipes-series-parallel",
        title: "Pipes in Series & Parallel",
        summary:
          "Equivalent pipes, flow division between parallel branches, minor losses, and three-reservoir problems.",
        minutes: 18,
        status: "in-preparation",
        topics: ["Pipes in series", "Pipes in parallel", "Minor losses", "Three-reservoir problem"],
      },
      {
        id: "hge-l-flow-measurement",
        title: "Orifices, Venturi Meters & Weirs",
        summary:
          "Flow through orifices and nozzles, venturi and pitot measurements, and discharge over sharp-crested weirs.",
        minutes: 15,
        status: "in-preparation",
        topics: ["Orifice coefficients", "Venturi meter", "Weirs"],
      },
    ],
  },
  {
    id: "hge-ch3",
    subjectId: "hge",
    number: 3,
    title: "Soil Properties & Classification",
    summary:
      "Phase relationships, Atterberg limits, soil classification systems, and permeability of soils.",
    lessons: [
      metaOf("hge-l-soil-phase-relationships"),
      {
        id: "hge-l-atterberg-classification",
        title: "Atterberg Limits & Soil Classification",
        summary:
          "Liquid, plastic and shrinkage limits, plasticity and liquidity indices, and classifying soils by USCS and AASHTO.",
        minutes: 16,
        status: "in-preparation",
        topics: ["Atterberg limits", "Plasticity index", "USCS", "AASHTO"],
      },
      {
        id: "hge-l-permeability-seepage",
        title: "Permeability & Seepage",
        summary:
          "Darcy's law, constant- and falling-head tests, equivalent permeability of layered soils, and flow nets.",
        minutes: 15,
        status: "in-preparation",
        topics: ["Darcy's law", "Permeability tests", "Layered soils", "Flow nets"],
      },
    ],
  },
  {
    id: "hge-ch4",
    subjectId: "hge",
    number: 4,
    title: "Soil Mechanics & Foundations",
    summary:
      "Effective stress, consolidation settlement, shear strength, and the bearing capacity of shallow foundations.",
    lessons: [
      metaOf("hge-l-effective-stress"),
      {
        id: "hge-l-consolidation-settlement",
        title: "Consolidation Settlement",
        summary:
          "Normally and over-consolidated clays, compression and swell indices, settlement computation, and time rate of consolidation.",
        minutes: 18,
        status: "in-preparation",
        topics: ["Compression index", "Preconsolidation pressure", "Settlement", "Time factor"],
      },
      {
        id: "hge-l-shear-strength-bearing",
        title: "Shear Strength & Bearing Capacity",
        summary:
          "Mohr–Coulomb strength, direct shear and triaxial tests, and Terzaghi's bearing capacity for shallow footings.",
        minutes: 18,
        status: "in-preparation",
        topics: ["Mohr–Coulomb criterion", "Triaxial test", "Terzaghi bearing capacity"],
      },
    ],
  },
];
