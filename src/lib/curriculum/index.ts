import type { Day } from "./types";
import { day1 } from "./day1";
import { day2 } from "./day2";
import { day3 } from "./day3";
import { day4 } from "./day4";
import { day5 } from "./day5";
import { day6 } from "./day6";
import { day7 } from "./day7";
import { interviewQuestions, interviewCategories } from "./interview";
import { cheatsheet } from "./cheatsheet";
import { playgroundExamples, defaultPlaygroundCode } from "./examples";

export { day1, day2, day3, day4, day5, day6, day7 };
export { interviewQuestions, interviewCategories };
export { cheatsheet };
export { playgroundExamples, defaultPlaygroundCode };
export * from "./types";

export const curriculum: Day[] = [day1, day2, day3, day4, day5, day6, day7];

export const totalSections = curriculum.reduce((sum, d) => sum + d.sections.length, 0);
export const totalQuizQuestions = curriculum.reduce((sum, d) => sum + d.quiz.length, 0);
export const totalCodeExamples = curriculum.reduce(
  (sum, d) => sum + d.sections.reduce((s, sec) => s + sec.examples.length, 0),
  0
);

export const totalMinutes = curriculum.reduce(
  (sum, d) => sum + d.sections.reduce((s, sec) => s + sec.minutes, 0),
  0
);

export const courseStats = [
  { label: "days", value: curriculum.length },
  { label: "lessons", value: totalSections },
  { label: "code examples", value: totalCodeExamples },
  { label: "quiz questions", value: totalQuizQuestions },
];
