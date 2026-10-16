import type { Chapter, Lesson, LessonMeta } from "@/lib/content/types";
import { lessons } from "./lessons";

/** Strip a full Lesson down to the metadata shown in the chapter outline. */
function meta(id: string): LessonMeta {
  const lesson: Lesson | undefined = lessons.find((l) => l.id === id);
  if (!lesson) throw new Error(`psad: missing lesson ${id}`);
  const { title, summary, minutes, status, topics } = lesson;
  return { id, title, summary, minutes, status, topics };
}

export const chapters: Chapter[] = [
  {
    id: "psad-ch1",
    subjectId: "psad",
    number: 1,
    title: "Statics and Mechanics of Materials",
    summary:
      "Equilibrium of rigid bodies, support reactions, axial stress and strain, thermal stress and torsion of circular shafts.",
    lessons: [
      meta("psad-equilibrium-reactions"),
      {
        id: "psad-axial-thermal-stress",
        title: "Axial Stress, Strain and Thermal Effects",
        summary:
          "Normal stress, Hooke's law and axial deformation, statically indeterminate bars, and stresses caused by restrained thermal expansion.",
        minutes: 15,
        status: "in-preparation",
        topics: ["Normal stress", "Axial deformation", "Indeterminate axial members", "Thermal stress"],
      },
      {
        id: "psad-torsion-shafts",
        title: "Torsion of Circular Shafts",
        summary:
          "Shear stress and angle of twist in solid and hollow shafts, and power transmission by rotating shafts.",
        minutes: 12,
        status: "in-preparation",
        topics: ["Torsion formula", "Angle of twist", "Hollow shafts", "Power transmission"],
      },
    ],
  },
  {
    id: "psad-ch2",
    subjectId: "psad",
    number: 2,
    title: "Structural Analysis",
    summary:
      "Shear and moment diagrams, beam deflections by standard formulas, and member forces in statically determinate trusses.",
    lessons: [
      meta("psad-shear-moment-diagrams"),
      {
        id: "psad-beam-deflections",
        title: "Beam Deflections",
        summary:
          "Standard deflection formulas for simple and cantilever beams, superposition, and unit handling of flexural rigidity EI.",
        minutes: 14,
        status: "in-preparation",
        topics: ["Elastic curve", "Standard deflection formulas", "Superposition", "Flexural rigidity"],
      },
      {
        id: "psad-determinate-trusses",
        title: "Analysis of Determinate Trusses",
        summary:
          "Method of joints and method of sections for planar trusses, zero-force members and truss determinacy.",
        minutes: 14,
        status: "in-preparation",
        topics: ["Method of joints", "Method of sections", "Zero-force members", "Truss determinacy"],
      },
    ],
  },
  {
    id: "psad-ch3",
    subjectId: "psad",
    number: 3,
    title: "Reinforced Concrete and Steel Design",
    summary:
      "Strength design of reinforced concrete beams, shear reinforcement, and elastic buckling of steel columns.",
    lessons: [
      meta("psad-rc-singly-reinforced"),
      meta("psad-column-buckling"),
      {
        id: "psad-rc-beam-shear",
        title: "Shear Design of RC Beams",
        summary:
          "Concrete shear strength, stirrup spacing requirements and the critical section for shear in reinforced concrete beams.",
        minutes: 15,
        status: "in-preparation",
        topics: ["Concrete shear strength", "Stirrup design", "Critical section", "Spacing limits"],
      },
    ],
  },
  {
    id: "psad-ch4",
    subjectId: "psad",
    number: 4,
    title: "Construction Management and Methods",
    summary:
      "Project scheduling by the critical path method, quantity estimates for concrete work, and production rates of construction equipment.",
    lessons: [
      meta("psad-cpm-scheduling"),
      {
        id: "psad-quantity-estimates",
        title: "Quantity Estimates: Concrete, Formwork and Rebar",
        summary:
          "Concrete volumes and material factors, formwork contact areas, and reinforcing bar lengths and weights.",
        minutes: 15,
        status: "in-preparation",
        topics: ["Concrete volume", "Cement, sand and gravel", "Formwork area", "Rebar take-off"],
      },
      {
        id: "psad-equipment-productivity",
        title: "Equipment Productivity",
        summary:
          "Cycle time, bucket fill factor, job efficiency and hourly production of excavating and hauling equipment.",
        minutes: 12,
        status: "in-preparation",
        topics: ["Cycle time", "Fill factor", "Job efficiency", "Hourly production"],
      },
    ],
  },
];
