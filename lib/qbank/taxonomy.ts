import taxonomyJson from "@/data/question-bank/taxonomy.json";
import examConfigJson from "@/data/question-bank/exam-config.json";

export interface TaxonomySubtopic {
  id: string;
  title: string;
}
export interface TaxonomyTopic {
  id: string;
  title: string;
  subtopics: TaxonomySubtopic[];
}
export interface TaxonomySubject {
  id: "mste" | "hge" | "psad";
  code: string;
  officialTitle: string;
  name: string;
  shortName: string;
  weight: number;
  displayOrder: number;
  topics: TaxonomyTopic[];
}
export interface Taxonomy {
  verification: { status: string; verifiedItems: string[]; unverifiedItems: string[]; sources: string[]; checkedAt: string };
  subjects: TaxonomySubject[];
}

export interface ExamPresetConfig {
  id: string;
  title: string;
  description: string;
  subjects: ("mste" | "hge" | "psad")[];
  questionCount: number;
  minutes: number;
  autoSubmit: boolean;
  revealSolutions: boolean;
  useDifficultyDistribution: boolean;
}
export interface ExamConfig {
  requireSmeApprovalToPublish: boolean;
  difficultyDistribution: { easy: number; moderate: number; difficult: number };
  subjectWeights: Record<"mste" | "hge" | "psad", number>;
  passingReference: { generalAverage: number; minimumSubjectGrade: number; verified: boolean; note: string };
  recentExclusionWindow: number;
  presets: ExamPresetConfig[];
}

export const taxonomy = taxonomyJson as unknown as Taxonomy;
export const examConfig = examConfigJson as unknown as ExamConfig;

const topicIndex = new Map<string, { subject: TaxonomySubject; topic: TaxonomyTopic }>();
const subtopicIndex = new Map<string, { subject: TaxonomySubject; topic: TaxonomyTopic; subtopic: TaxonomySubtopic }>();
for (const subject of taxonomy.subjects)
  for (const topic of subject.topics) {
    topicIndex.set(topic.id, { subject, topic });
    for (const subtopic of topic.subtopics) subtopicIndex.set(subtopic.id, { subject, topic, subtopic });
  }

export const getTopic = (id: string) => topicIndex.get(id)?.topic;
export const getSubtopic = (id: string) => subtopicIndex.get(id)?.subtopic;
export const topicTitle = (id: string) => topicIndex.get(id)?.topic.title ?? subtopicIndex.get(id)?.subtopic.title ?? id;
