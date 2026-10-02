"use client";

import { useMemo } from "react";
import {
  cheatsheet,
  curriculum,
  interviewQuestions,
  playgroundExamples,
} from "@/lib/curriculum";
import {
  localizeCheatCategory,
  localizeDay,
  localizeInterviewQuestion,
  localizePlaygroundExample,
} from "./localize";
import { day1Bn } from "./bn/day1";
import { day2Bn } from "./bn/day2";
import { day3Bn } from "./bn/day3";
import { day4Bn } from "./bn/day4";
import { day5Bn } from "./bn/day5";
import { day6Bn } from "./bn/day6";
import { day7Bn } from "./bn/day7";
import { cheatsheetBn, examplesBn } from "./bn/cheatsheet";
import { interviewBn } from "./bn/interview";

import { useLang, type Lang } from "./lang";
import { ui, type UiStrings } from "./ui";

export { useLang, setLang, type Lang } from "./lang";
export { ui, type UiStrings } from "./ui";

const dayOverlays = [day1Bn, day2Bn, day3Bn, day4Bn, day5Bn, day6Bn, day7Bn];

/** Language + t() convenience: `const { lang, t } = useT()`. */
export function useT(): { lang: Lang; t: UiStrings; setLang: (l: Lang) => void } {
  const { lang, setLang } = useLang();
  return { lang, t: ui[lang], setLang };
}

/** The full curriculum with the active language's overlay applied. */
export function useLocalizedCurriculum() {
  const { lang } = useLang();
  return useMemo(
    () =>
      lang === "bn"
        ? curriculum.map((day, i) => localizeDay(day, dayOverlays[i]))
        : curriculum,
    [lang]
  );
}

export function useLocalizedInterview() {
  const { lang } = useLang();
  return useMemo(
    () =>
      lang === "bn"
        ? interviewQuestions.map((q) => localizeInterviewQuestion(q, interviewBn[q.id]))
        : interviewQuestions,
    [lang]
  );
}

export function useLocalizedCheatsheet() {
  const { lang } = useLang();
  return useMemo(
    () =>
      lang === "bn"
        ? cheatsheet.map((cat) => localizeCheatCategory(cat, cheatsheetBn[cat.id]))
        : cheatsheet,
    [lang]
  );
}

export function useLocalizedExamples() {
  const { lang } = useLang();
  return useMemo(
    () =>
      lang === "bn"
        ? playgroundExamples.map((ex) => localizePlaygroundExample(ex, examplesBn[ex.id]))
        : playgroundExamples,
    [lang]
  );
}
