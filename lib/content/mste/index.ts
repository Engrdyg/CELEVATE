import type { SubjectContent } from "@/lib/content/types";
import { chapters } from "@/lib/content/mste/chapters";
import { lessons } from "@/lib/content/mste/lessons";
import { questions } from "@/lib/content/mste/questions";
import { formulas } from "@/lib/content/mste/formulas";

export const content: SubjectContent = { chapters, lessons, questions, formulas };
