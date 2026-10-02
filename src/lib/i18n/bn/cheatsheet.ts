import type { CheatCategoryBn, PlaygroundExampleBn } from "../localize";

/** Bengali overlays for the cheatsheet categories. */
export const cheatsheetBn: Record<string, CheatCategoryBn> = {
  "cheat-types": {
    title: "প্রিমিটিভ ও ঘোষণা",
    items: [
      { title: "বেসিক অ্যানোটেশন" },
      { title: "স্পেশাল টাইপ", note: "সীমানায় unknown, অগম্য কোডে never।" },
      { title: "লিটারেল ইউনিয়ন আর enum", note: "আধুনিক কোডে লিটারেল ইউনিয়নই ভালো — রানটাইম কোড শূন্য।" },
    ],
  },
  "cheat-functions": {
    title: "ফাংশন",
    items: [
      { title: "স্বাক্ষরের গঠন" },
      { title: "অপশনাল / rest" },
      { title: "ইউনিয়নে overload" },
    ],
  },
  "cheat-objects": {
    title: "অবজেক্ট ও ইন্টারফেস",
    items: [
      { title: "আকার" },
      { title: "interface বনাম type" },
    ],
  },
  "cheat-unions": {
    title: "ইউনিয়ন ও ন্যারোয়িং",
    items: [
      { title: "বিল্ট-ইন চার চেক" },
      { title: "Discriminated union", note: "exhaustiveness-র জন্য default-এ never অ্যাসাইন করুন।" },
      { title: "নিরাপদ অপারেটর" },
    ],
  },
  "cheat-generics": {
    title: "জেনেরিক",
    items: [
      { title: "ফাংশন ও ক্লাস" },
      { title: "constraint আর keyof" },
      { title: "ভ্যালু থেকে উপজাত" },
    ],
  },
  "cheat-utilities": {
    title: "Utility টাইপ",
    items: [
      { title: "বড় ছয়টা" },
      { title: "রিফ্লেকশন পরিবার" },
    ],
  },
  "cheat-classes": {
    title: "ক্লাস ও মডিউল",
    items: [
      { title: "ক্লাসের গঠন" },
      { title: "মডিউল প্যাটার্ন" },
    ],
  },
  "cheat-config": {
    title: "কনফিগ ও async",
    items: [
      { title: "tsconfig-এর প্রাণ", note: "strict = strictNullChecks + noImplicitAny + আরও।" },
      { title: "টাইপ-করা fetch রেসিপি" },
    ],
  },
};

/** Bengali overlays for the playground example list. */
export const examplesBn: Record<string, PlaygroundExampleBn> = {
  "pg-hello": {
    title: "Hello TypeScript",
    description: "আপনার প্রথম কম্পাইল-করা রান: অ্যানোটেশন, ইনফারেন্স, আর কনসোল আউটপুট।",
  },
  "pg-primitives": {
    title: "টাইপ ভাঙুন (দিন ১)",
    description: "ইচ্ছে করে ভাঙা কোড — আসল কম্পাইলার এরর পড়ুন, তারপর ঠিক করুন।",
  },
  "pg-interfaces": {
    title: "ডোমেইন মডেল (দিন ২)",
    description: "ইন্টারফেস, অপশনাল প্রপার্টি, আর আপনার মডেলের ওপর একটা ফাংশন।",
  },
  "pg-narrowing": {
    title: "ইউনিয়ন ন্যারো করুন (দিন ৩)",
    description: "typeof ন্যারোয়িং, নিরাপদ অপারেটর, আর || বনাম ??-এর ফাঁদ।",
  },
  "pg-discriminated": {
    title: "Discriminated union (দিন ৩)",
    description: "রিকোয়েস্ট-স্টেট মেশিন — যেটা আজীবন লিখতে থাকবেন।",
  },
  "pg-generics": {
    title: "জেনেরিক ল্যাব (দিন ৪)",
    description: "Stack<T>, constraint, আর keyof-চালিত getter।",
  },
  "pg-utilities": {
    title: "বানিয়ে বানিয়ে লেখা নয়, বের করুন (দিন ৫)",
    description: "একটাই User ইন্টারফেস, তিনটা উপজাত আকার, শূন্য ডুপ্লিকেশন।",
  },
  "pg-classes": {
    title: "ক্লাস ও async (দিন ৬)",
    description: "প্যারামিটার প্রপার্টি, abstract ক্লাস, আর টাইপ-করা প্রমিস।",
  },
  "pg-interview": {
    title: "ইন্টারভিউ হোয়াইটবোর্ড (দিন ৭)",
    description: "ছোট্ট সেই উদাহরণগুলো — মুখস্থ করে লিখতে পারা উচিত।",
  },
};
