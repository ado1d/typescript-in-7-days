export type CodeVariant = "good" | "bad" | "neutral";

export type CodeLanguage = "typescript" | "javascript" | "bash" | "json" | "tsx" | "text";

export interface CodeExample {
  code: string;
  title?: string;
  /** good = compiles, bad = deliberately broken (shows the real error), neutral = commands/output */
  variant?: CodeVariant;
  language?: CodeLanguage;
  /** Realistic TypeScript compiler error for `bad` examples */
  tsError?: string;
  /** What this prints when run */
  output?: string;
  caption?: string;
}

export interface Callout {
  kind: "tip" | "warning" | "info" | "interview";
  title: string;
  body: string;
}

export interface LessonSection {
  id: string;
  title: string;
  minutes: number;
  /** Paragraphs; `backtick` spans render as inline code */
  paragraphs: string[];
  examples: CodeExample[];
  keyPoints?: string[];
  callouts?: Callout[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface PracticeTask {
  intro: string;
  steps: string[];
  starter?: string;
  solution?: string;
  solutionNote?: string;
}

export interface Day {
  id: number;
  title: string;
  subtitle: string;
  hours: string;
  goal: string;
  icon: "setup" | "braces" | "gitbranch" | "boxes" | "wand" | "layers" | "target";
  intro: string[];
  sections: LessonSection[];
  quiz: QuizQuestion[];
  practice: PracticeTask;
}

export interface InterviewQuestion {
  id: string;
  number: number;
  category: string;
  question: string;
  /** The 2-3 sentence model answer you should be able to say out loud */
  shortAnswer: string;
  /** Deeper explanation for study mode */
  detail: string[];
  code?: string;
  codeLanguage?: CodeLanguage;
  gotcha?: string;
}

export interface CheatItem {
  title: string;
  code: string;
  note?: string;
}

export interface CheatCategory {
  id: string;
  title: string;
  icon: "types" | "functions" | "objects" | "unions" | "generics" | "utilities" | "classes" | "config";
  items: CheatItem[];
}

export interface PlaygroundExample {
  id: string;
  title: string;
  description: string;
  day: number;
  code: string;
}
