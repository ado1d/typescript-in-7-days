import type {
  CheatCategory,
  CodeExample,
  Day,
  InterviewQuestion,
  LessonSection,
  PlaygroundExample,
  QuizQuestion,
} from "@/lib/curriculum/types";

/* ------------------------------------------------------------------ */
/* Bengali overlay types. Overlays carry ONLY translatable prose —     */
/* code, ids, minutes and structure stay in the English source files   */
/* and are merged here. Untranslated fields fall back to English.      */
/* ------------------------------------------------------------------ */

export interface ExampleBn {
  title?: string;
  caption?: string;
  output?: string;
}

export interface SectionBn {
  title?: string;
  paragraphs?: string[];
  keyPoints?: string[];
  /** Matched by index with the section's callouts array */
  callouts?: { title: string; body: string }[];
  /** Matched by index with the section's examples array */
  examples?: ExampleBn[];
}

export interface QuizQnBn {
  question?: string;
  options?: string[];
  explanation?: string;
}

export interface DayBn {
  title?: string;
  subtitle?: string;
  hours?: string;
  goal?: string;
  intro?: string[];
  sections?: Record<string, SectionBn>;
  quiz?: Record<string, QuizQnBn>;
  practice?: {
    intro?: string;
    steps?: string[];
    solutionNote?: string;
  };
}

export interface InterviewQnBn {
  question?: string;
  shortAnswer?: string;
  detail?: string[];
  gotcha?: string;
}

export interface CheatCategoryBn {
  title?: string;
  /** Matched by index with the category's items array */
  items?: { title?: string; note?: string }[];
}

export interface PlaygroundExampleBn {
  title?: string;
  description?: string;
}

/* ------------------------------------------------------------------ */
/* Merge helpers                                                       */
/* ------------------------------------------------------------------ */

function mergeExamples(examples: CodeExample[], bn?: ExampleBn[]): CodeExample[] {
  if (!bn) return examples;
  return examples.map((ex, i) => {
    const b = bn[i];
    if (!b) return ex;
    return {
      ...ex,
      title: b.title ?? ex.title,
      caption: b.caption ?? ex.caption,
      output: b.output ?? ex.output,
    };
  });
}

function mergeSection(section: LessonSection, bn?: SectionBn): LessonSection {
  if (!bn) return section;
  return {
    ...section,
    title: bn.title ?? section.title,
    paragraphs: bn.paragraphs ?? section.paragraphs,
    keyPoints: bn.keyPoints ?? section.keyPoints,
    callouts: bn.callouts
      ? section.callouts?.map((c, i) => {
          const b = bn.callouts?.[i];
          return b ? { ...c, ...b } : c;
        })
      : section.callouts,
    examples: mergeExamples(section.examples, bn.examples),
  };
}

function mergeQuiz(q: QuizQuestion, bn?: QuizQnBn): QuizQuestion {
  if (!bn) return q;
  return {
    ...q,
    question: bn.question ?? q.question,
    options: bn.options ?? q.options,
    explanation: bn.explanation ?? q.explanation,
  };
}

/** Localize a Day with its Bengali overlay (falls back to English fields). */
export function localizeDay(day: Day, bn?: DayBn): Day {
  if (!bn) return day;
  return {
    ...day,
    title: bn.title ?? day.title,
    subtitle: bn.subtitle ?? day.subtitle,
    hours: bn.hours ?? day.hours,
    goal: bn.goal ?? day.goal,
    intro: bn.intro ?? day.intro,
    sections: day.sections.map((s) => mergeSection(s, bn.sections?.[s.id])),
    quiz: day.quiz.map((q) => mergeQuiz(q, bn.quiz?.[q.id])),
    practice: bn.practice
      ? {
          ...day.practice,
          intro: bn.practice.intro ?? day.practice.intro,
          steps: bn.practice.steps ?? day.practice.steps,
          solutionNote: bn.practice.solutionNote ?? day.practice.solutionNote,
        }
      : day.practice,
  };
}

export function localizeInterviewQuestion(
  q: InterviewQuestion,
  bn?: InterviewQnBn
): InterviewQuestion {
  if (!bn) return q;
  return {
    ...q,
    question: bn.question ?? q.question,
    shortAnswer: bn.shortAnswer ?? q.shortAnswer,
    detail: bn.detail ?? q.detail,
    gotcha: bn.gotcha ?? q.gotcha,
  };
}

export function localizeCheatCategory(
  cat: CheatCategory,
  bn?: CheatCategoryBn
): CheatCategory {
  if (!bn) return cat;
  return {
    ...cat,
    title: bn.title ?? cat.title,
    items: cat.items.map((item, i) => {
      const b = bn.items?.[i];
      if (!b) return item;
      return { ...item, title: b.title ?? item.title, note: b.note ?? item.note };
    }),
  };
}

export function localizePlaygroundExample(
  ex: PlaygroundExample,
  bn?: PlaygroundExampleBn
): PlaygroundExample {
  if (!bn) return ex;
  return {
    ...ex,
    title: bn.title ?? ex.title,
    description: bn.description ?? ex.description,
  };
}
