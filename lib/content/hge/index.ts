import type { SubjectContent } from "@/lib/content/types";
import { chapters } from "./chapters";
import { lessons } from "./lessons";
import { questions } from "./questions";
import { formulas } from "./formulas";

export const content: SubjectContent = { chapters, lessons, questions, formulas };
