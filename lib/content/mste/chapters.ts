import type { Chapter, Lesson, LessonMeta } from "@/lib/content/types";
import { lessons } from "@/lib/content/mste/lessons";

/** Strip a full Lesson down to the outline metadata used inside chapters. */
function meta(id: string): LessonMeta {
  const lesson: Lesson | undefined = lessons.find((l) => l.id === id);
  if (!lesson) throw new Error(`Unknown MSTE lesson: ${id}`);
  const { title, summary, minutes, status, topics } = lesson;
  return { id, title, summary, minutes, status, topics };
}

export const chapters: Chapter[] = [
  {
    id: "mste-ch1",
    subjectId: "mste",
    number: 1,
    title: "Algebra, Trigonometry & Analytic Geometry",
    summary:
      "Solving right and oblique triangles, heights and distances, and the equations and properties of conic sections.",
    lessons: [
      meta("mste-l-solution-of-triangles"),
      {
        id: "mste-l-conic-sections",
        title: "Conic Sections",
        summary:
          "Circle, parabola, ellipse and hyperbola in standard form: centers, foci, eccentricity, directrices and latus rectum.",
        minutes: 15,
        status: "in-preparation",
        topics: ["Circle", "Parabola", "Ellipse", "Hyperbola", "Eccentricity"],
      },
    ],
  },
  {
    id: "mste-ch2",
    subjectId: "mste",
    number: 2,
    title: "Calculus & Engineering Mathematics",
    summary:
      "Derivatives and optimization, integration for areas, and the probability tools that appear in engineering mathematics problems.",
    lessons: [
      meta("mste-l-derivatives-optimization"),
      {
        id: "mste-l-integration-areas",
        title: "Integration for Areas and Volumes",
        summary:
          "Definite integrals, area between curves, and volumes of revolution by the disk and shell methods.",
        minutes: 14,
        status: "in-preparation",
        topics: ["Definite integrals", "Area between curves", "Volumes of revolution"],
      },
      {
        id: "mste-l-probability-basics",
        title: "Probability Basics",
        summary:
          "Counting principles, permutations and combinations, conditional probability, and the binomial distribution.",
        minutes: 12,
        status: "in-preparation",
        topics: ["Permutations", "Combinations", "Conditional probability", "Binomial distribution"],
      },
    ],
  },
  {
    id: "mste-ch3",
    subjectId: "mste",
    number: 3,
    title: "Surveying",
    summary:
      "Distance measurement and taping corrections, differential leveling, and traverse computations from latitudes and departures to area by coordinates.",
    lessons: [
      {
        id: "mste-l-taping-corrections",
        title: "Distance Measurement and Taping Corrections",
        summary:
          "Corrections for temperature, tension, sag, slope and incorrect tape length, and when each is added or subtracted.",
        minutes: 13,
        status: "in-preparation",
        topics: ["Temperature correction", "Pull correction", "Sag correction", "Slope correction"],
      },
      meta("mste-l-differential-leveling"),
      {
        id: "mste-l-traverse-computations",
        title: "Traverse Computations",
        summary:
          "Bearings and azimuths, latitudes and departures, error of closure, compass-rule adjustment, and area by coordinates.",
        minutes: 16,
        status: "in-preparation",
        topics: ["Latitudes and departures", "Error of closure", "Compass rule", "Area by coordinates"],
      },
    ],
  },
  {
    id: "mste-ch4",
    subjectId: "mste",
    number: 4,
    title: "Transportation & Highway Engineering",
    summary:
      "Horizontal simple curves, parabolic vertical curves, stopping sight distance, and the fundamentals of traffic flow.",
    lessons: [
      meta("mste-l-horizontal-simple-curves"),
      {
        id: "mste-l-vertical-parabolic-curves",
        title: "Vertical Parabolic Curves",
        summary:
          "Symmetrical summit and sag curves: grade change, curve elevations, and the location of the highest or lowest point.",
        minutes: 14,
        status: "in-preparation",
        topics: ["Grades", "Curve elevations", "High and low points"],
      },
      {
        id: "mste-l-sight-distance-traffic-flow",
        title: "Sight Distance and Traffic Flow",
        summary:
          "Stopping sight distance on level and graded roads, and the flow–density–speed relationship with headway and spacing.",
        minutes: 12,
        status: "in-preparation",
        topics: ["Stopping sight distance", "Flow, density and speed", "Headway and spacing"],
      },
    ],
  },
];
