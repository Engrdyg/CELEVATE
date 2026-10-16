/**
 * CELE examination configuration.
 *
 * Subject labels, codes and weights are kept here so they can be aligned with
 * the applicable PRC syllabus / Board of Civil Engineering resolution without
 * touching UI code. Always verify against the latest official PRC issuance.
 */
export const CELE_SUBJECTS = {
  mste: {
    code: "MSTE",
    name: "Mathematics, Surveying and Transportation Engineering",
    shortName: "Math, Surveying & Transpo",
    weight: 0.35,
  },
  hge: {
    code: "HGE",
    name: "Hydraulics and Geotechnical Engineering",
    shortName: "Hydraulics & Geotech",
    weight: 0.3,
  },
  psad: {
    code: "PSAD",
    name: "Structural Engineering and Construction",
    shortName: "Structural & Construction",
    weight: 0.35,
  },
} as const;

export type SubjectId = keyof typeof CELE_SUBJECTS;
export const SUBJECT_IDS = Object.keys(CELE_SUBJECTS) as SubjectId[];

/** Commonly cited rating rules. Treat as configurable reference values. */
export const CELE_RULES = {
  passingAverage: 70,
  minimumSubjectGrade: 50,
  note: "Rating rules shown for orientation only. Confirm current requirements with the Professional Regulation Commission (PRC).",
};
