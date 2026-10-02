import type { DayBn } from "../localize";

/** Bengali overlay for Day 5. */
export const day5Bn: DayBn = {
  title: "Utility ও Mapped টাইপ",
  subtitle: "একই আকারের বানানো বানিয়ে বানিয়ে লেখা বন্ধ করুন — বরং উপজাত বানান",
  hours: "প্রায় ২.৫ ঘণ্টা",
  goal: "একটাই User ইন্টারফেস থেকে UserUpdate, UserPreview আর UserMap বের করা বিল্ট-ইন utility টাইপ দিয়ে — আর অন্যের mapped/conditional টাইপ ভয় ছাড়া পড়তে পারা।",
  intro: [
    "আসল কোডবেস কখনোই হাতে প্রতিটা আকার লেখে না। patch পেলোড মানে সব ফিল্ড অপশনালওয়ালা মডেল। লিস্ট আইটেম মানে ভারী ফিল্ডগুলো বাদ-দেওয়া মডেল। লুকআপ টেবিল মানে id-কী-ওয়ালা মডেল। TypeScript ~২০টা বিল্ট-ইন utility টাইপ দেয় যারা সত্যের একটাই উৎস থেকে এই সব উপজাত হিসাব করে — তাই মডেলে ফিল্ড যোগ করলে প্রতিটা উপজাত আকারে নিজে-থেকেই চলে আসে।",
    "আজ শিখবেন বেশি-চালিত সাতটা (Partial, Required, Readonly, Pick, Omit, Record, আর ফাংশন-রিফ্লেকশন ত্রয়ী) আর mapped/conditional টাইপ ঠিক ততটুকুই যতটুকু অন্যের কোড পড়তে লাগে — ঠিক পরিকল্পনার নির্ধারিত গভীরতা: চিনবেন, পুনর্নির্মাণ করবেন না।",
  ],
  sections: {
    "d5-partial-family": {
      title: "Partial, Required, Readonly",
      paragraphs: [
        "এই তিনটা বদলায় *পরিবর্তনযোগ্যতা*। `Partial<T>` প্রতিটা প্রপার্টিকে অপশনাল বানায় — update/patch পেলোডের হুবহু আকার। `Required<T>` তার উল্টো — যখন চওড়া টাইপ অপশনাল দিয়েছে কিন্তু আপনার কোড-পথ সবগুলোই চায়। `Readonly<T>` প্রতিটা প্রপার্টি readonly বানায় — যে প্যারামিটার বদলাবেন না বা frozen স্টেট অবজেক্টের জন্য পারফেক্ট।",
        "দিন ৫ সহজ করে দেওয়া মানসিক মডেল: প্রতিটা utility একটা টাইপ → টাইপ ফাংশন। একটা আকার খাওয়ায়, হিসাব-করা আকার ফেরায়। নতুন ফিল্ড নেই, নতুন তথ্য নেই — উৎস টাইপেরই নিয়মমাফিক রূপান্তর।",
      ],
      keyPoints: [
        "`Partial<T>` = সব প্রপার্টি অপশনাল — patch/update পেলোডের আকার।",
        "`Required<T>` আর `Readonly<T>` তার ভাই: উল্টো আর জমাট।",
        "তিনটাই উৎস থেকে হিসাব-হয়: User-এ ফিল্ড যোগ করলে UserUpdate-এ আপনা-আপনি ঢোকে।",
      ],
      callouts: [
        {
          title: "ইন্টারভিউ প্রশ্ন #৭ আক্ষরিকভাবেই এই সেকশন",
          body: "\"Partial, Pick, Omit, Record ব্যাখ্যা করুন\" — প্রতিটা কী রূপান্তর করে বলুন আর এক লাইনের ব্যবহার দিন: patch পেলোড, ফিল্ডের সাবসেট, ফিল্ড বাদ, লুকআপ টেবিল।",
        },
      ],
      examples: [
        { title: "Partial<T> — patch-এর প্যাটার্ন", output: "updating #1 with { name: 'Ada L.' }\nupdating #2 with { email: 'g@example.com' }\n{ id: 1, name: 'ada', email: 'a@example.com', avatarUrl: '/a.png' }" },
        {
          title: "Readonly<T> — রীতি-হিসেবে অপরিবর্তনীয়তা",
          output: "ada <a@x.com>",
          caption: "Readonly শুধু কম্পাইল-টাইমের — রানটাইম অবজেক্ট বদলানো-যোগ্য JavaScript-ই। গভীর অপরিবর্তনীয়তায় লাগে রিকার্সিভ mapped টাইপ (লাইব্রেরিগুলো `DeepReadonly` দেয়) বা রানটাইমে Object.freeze।",
        },
      ],
    },
    "d5-subsetting": {
      title: "Pick, Omit, Record",
      paragraphs: [
        "এই তিনটা বদলায় *সদস্যপদ*। `Pick<T, K>` শুধু তালিকার কীগুলো রাখে — বড় মডেল থেকে খোদাই-করা preview/list-আইটেম আকার। `Omit<T, K>` উল্টো — তালিকার কীগুলো ফেলে দেয় (\"সার্ভার যে id বানাবে, সেটা বাদে বাকি মডেল\"-এ দারুণ)। `Record<K, V>` K-কী আর V-ভ্যালু-ওয়ালা অবজেক্ট টাইপ বানায় — লুকআপ টেবিলের ক্যানোনিক্যাল টাইপ, আর ঢিলা `{ [key: string]: V }`-এর চেয়ে কড়া আপগ্রেড।",
        "Pick আর Omit নিছক সুবিধা — দুটোই হাতে লেখা যায়, কিন্তু utility ভার্সন মডেলের সাথে সিঙ্কে থাকে। Record জৌলুস দেখায় লিটারেল-ইউনিয়ন কীতে: `Record<\"http\" | \"https\", number>` এমন অবজেক্ট বর্ণনা করে যার ঠিক ওই দুটো কী-ই থাকতে হবে।",
      ],
      keyPoints: [
        "`Pick<T, K>` তালিকার কী রাখে; `Omit<T, K>` ফেলে দেয় — একটাই উৎস থেকে সাবসেট।",
        "`Record<K, V>` = K-কী, V-ভ্যালুর অবজেক্ট; লিটারেল ইউনিয়নে কী-সেট সম্পূর্ণ আর টাইপো-প্রতিরোধী।",
        "utility-গুলো কম্পোজ করে: `Record<number, Pick<User, ...>>` ভেতর-থেকে-বাইরে নেস্টেড কলের মতোই পড়ুন।",
      ],
      examples: [
        { title: "Pick আর Omit — আকার খোদাই", output: "{ id: 1, name: 'ada' } { name: 'ada', email: 'a@example.com', passwordHash: '…' }" },
        {
          title: "Record — কড়া লুকআপ টেবিল",
          output: "30 1",
          caption: "লিটারেল-ইউনিয়ন কী-সহ Record আপনাকে দেয় সম্পূর্ণ, টাইপো-নিরাপদ কী-সেট। দিন ৪-এর `keyof typeof endpoints` ঠিক এটারই প্রস্তুতি।",
        },
        { title: "utility মেশানো — আসল শক্তি", output: "ada" },
      ],
    },
    "d5-function-reflection": {
      title: "ReturnType, Parameters, NonNullable, Awaited",
      paragraphs: [
        "এই চারটা *ফাংশন আর async ভ্যালু* নিয়ে চিন্তা করে — আগে থেকে থাকা কোড থেকেই টাইপ বের করে। `ReturnType<F>` ফাংশন যা ফেরায় সেটা টেনে আনে — যখন ফ্যাক্টরি ফাংশনটাই সত্যের উৎস, আর আপনি তার ফলের টাইপ আবার ঘোষণা করতে চান না। `Parameters<F>` প্যারামিটার টাপল বের করে। `NonNullable<T>` ইউনিয়ন থেকে null/undefined ছাড়ায় — `??`-এর টাইপ-লেভেল রূপ। `Awaited<T>` প্রমিস (যত গভীরই হোক) খুলে রেজোলিউশন টাইপ দেয়।",
        "React/Node কাজে এদের জৌলুস: ফাংশনের ফল থেকে শুরু-হওয়া স্টেট টাইপ করা, হ্যান্ডলারের প্যারাম মোড়া, বা প্রমিসের টাইপ হিসাব-করা হলে `await`-এর ফল টাইপ করা।",
      ],
      keyPoints: [
        "`ReturnType<typeof fn>` / `Parameters<typeof fn>` — আসল ফাংশন থেকে উপজাত টাইপ, কখনো পুনর্ঘোষিত নয়।",
        "`NonNullable<T>` টাইপ-লেভেলে null আর undefined ছাড়ায়।",
        "`Awaited<T>` প্রমিস খোলে — `Awaited<ReturnType<typeof fetcher>>` async ফল টাইপ করে।",
      ],
      examples: [
        {
          title: "ঘোষণার বদলে উপজাত",
          output: "ada a@example.com",
          caption: "`ReturnType<typeof createUser>` — ছোট হাতের typeof রানটাইম ভ্যালুকে তার টাইপে বদলাচ্ছে, দিন ৪-এ যেমন শিখলেন। ফাংশন বদলালে User টাইপ নিজে-থেকেই ফলো করে।",
        },
        { title: "NonNullable আর Awaited", output: "1 ada fallback fallback" },
      ],
    },
    "d5-indexed-access": {
      title: "Indexed access টাইপ — User[\"name\"]",
      paragraphs: [
        "টাইপের ওপর বর্গ-বন্ধনী একটা প্রপার্টির টাইপ টেনে আনে: `User[\"email\"]` মানে `string`। এটা ইন্টারফেসে চলে, ইউনিয়নে চলে (`T[K]` — দিন ৪), এমনকি অ্যারেতেও — `User[]`-কে `number` দিয়ে ইনডেক্স করলে `User`। `keyof`-এর সাথে মিললে \"সব ফিল্ড টাইপের ইউনিয়ন\" লেখা যায় `User[keyof User]` হয়ে।",
        "যেখানে এটা সোনা ফেরায়: নেস্টেড config টাইপের ভেতরে ঢোকা, অ্যারে-টাইপড ভ্যালু থেকে এলিমেন্ট টাইপ টানা (`typeof items[number]`), আর getter-এর নিখুঁত রিটার্ন টাইপ বানানো।",
      ],
      keyPoints: [
        "`T[\"prop\"]` একটা প্রপার্টির টাইপ টানে; `T[keyof T]` সব প্রপার্টি টাইপের ইউনিয়ন।",
        "`T['arrayProp'][number]` অ্যারে প্রপার্টির এলিমেন্ট টাইপ দেয়।",
        "রানটাইম অ্যাক্সেসের বর্গ-বন্ধনী মানসিক মডেলই — শুধু টাইপ-লেভেলে।",
      ],
      examples: [
        { title: "টাইপ-লেভেল প্রপার্টি অ্যাক্সেস", output: "(শুধু টাইপ — এই স্নিপেটের নিজস্ব রানটাইম আউটপুট নেই)" },
      ],
    },
    "d5-mapped-conditional": {
      title: "ঠিক ততটুকুই: mapped টাইপ আর conditional টাইপ",
      paragraphs: [
        "এই সেকশন ইচ্ছাকৃতভাবে চেনা-লেভেলের, পরিকল্পনা মেনেই: জটিল conditional টাইপে গভীরে যাবেন না — প্রধানত অন্যের কোডে এগুলো *পড়তে* হবে। Mapped টাইপ কী-এর ওপর লুপ: `{ [K in keyof T]: ... }` হলো টাইপ সিস্টেমের for-লুপ — Partial আক্ষরিকভাবেই এভাবেই ইমপ্লিমেন্ট করা। Conditional টাইপ শাখা কাটে: `T extends U ? X : Y` পড়ুন টাইপ-লেভেলের if/else হিসেবে।",
        "লাইব্রেরির `.d.ts` ফাইলে এগুলো অবিরাম দেখবেন: `Partial<T> = { [K in keyof T]?: T[K] }`, রিকার্শনে ইমপ্লিমেন্ট করা `Awaited`, conditional-ওয়ালা `Exclude`। নিচের দুটো আকার জানলেই ভীতিকর লাইব্রেরি টাইপ পড়া-যোগ্য হয়ে যায়।",
      ],
      keyPoints: [
        "Mapped টাইপ `{ [K in keyof T]: X }` = প্রতি-কী লুপ; Partial/Pick/Record এভাবেই বানানো।",
        "Conditional `T extends U ? X : Y` = টাইপ-লেভেলের if/else; কোনো শাখায় `never` মানে সেই মেম্বার মুছে ফেলা।",
        "লক্ষ্য: চেনা, পুনর্নির্মাণ নয়। template literal টাইপ বা গভীর রিকার্শনের পেছনে ছুটবেন না — পরিকল্পনা স্পষ্টভাবেই পার্ক করে রেখেছে।",
      ],
      callouts: [
        {
          title: "পরিকল্পনা যে খরগোশের-গর্তের সতর্কবাণী দেয়",
          body: "জটিল conditional টাইপ, template literal টাইপ, decorator — জুনিয়র/মিড ইন্টারভিউতে কার্যত আসে না। ওপরের দুটো আকার পড়তে পারলেই যথেষ্ট — বরং দিন ৬-এর ক্লাস অনুশীলন করুন।",
        },
      ],
      examples: [
        {
          title: "চেনার দুটো আকার",
          caption: "Mapped = লুপ, conditional = শাখা, কোনো শাখায় `never` = \"এই মেম্বার মুছে দাও\"। এই তিনটা তথ্যেই বেশির ভাগ লাইব্রেরি টাইপ পড়া-যোগ্য।",
        },
        { title: "হাতে-গড়া একটা utility (পড়ার আত্মবিশ্বাসে)", output: "8080" },
      ],
    },
  },
  quiz: {
    "d5-q1": {
      question: "PATCH endpoint-এর request body-র জন্য কোন utility টাইপ ব্যবহার করবেন?",
      options: ["Readonly<User>", "Partial<User>", "Record<User, string>", "Required<User>"],
      explanation:
        "patch পাঠায় শুধু যে ফিল্ড বদলাচ্ছে — সব প্রপার্টি অপশনাল মানেই `Partial<User>`। (শুধু কিছু ফিল্ড patch-করা গেলে `Partial<Pick<User, \"name\" | \"email\">>`-ও চলে।)",
    },
    "d5-q2": {
      question: "`type X = Omit<User, \"id\">` বানায়…",
      options: [
        "User — id রিকোয়ার্ড, বাকি সব অপশনাল",
        "id প্রপার্টি বাদ-দেওয়া User",
        "শুধু id প্রপার্টি",
        "এরর — Omit-কে সব কী-এর ইউনিয়ন দিতে হয়",
      ],
      explanation:
        "Omit তালিকার কীগুলো ফেলে দেয়। তালিকার কী শুধু রাখে Pick। সার্ভার id বানায় এমন create-পেলোডে Omit-ই স্বাভাবিক পছন্দ।",
    },
    "d5-q3": {
      question: "`Record<\"a\" | \"b\", number>` আর `{ [key: string]: number }` — পার্থক্য কী?",
      options: [
        "কোনো পার্থক্য নেই — Record শুধু ছোট সিনট্যাক্স",
        "Record-এ ঠিক \"a\" আর \"b\"-ই লাগবে (দুটোই থাকতে হবে, বাড়তি চলবে না); ইনডেক্স সিগনেচার যেকোনো string কী নেয়",
        "Record শুধু রানটাইমে কাজ করে",
        "ইনডেক্স সিগনেচারটাই বেশি কড়া",
      ],
      explanation:
        "লিটারেল-ইউনিয়ন কী-সেট-সহ Record সম্পূর্ণ: কী মিসিং বা অজানা — দুটোই কম্পাইল এরর। ইনডেক্স সিগনেচার ঢিলা, ছুটিয়ে-দেওয়া বানান।",
    },
    "d5-q4": {
      question: "`type R = ReturnType<typeof createUser>` — R কী বর্ণনা করে?",
      options: [
        "\"createUser\" স্ট্রিংটা হুবহু",
        "createUser-এর প্যারামিটারের টাইপ",
        "createUser যে ভ্যালু রিটার্ন করে তার টাইপ",
        "রিটার্ন টাইপের একটা Promise",
      ],
      explanation:
        "ReturnType ফাংশন টাইপের রিটার্ন টাইপ টেনে আনে। async ফাংশনে লাগবে `Awaited<ReturnType<typeof fn>>` — কারণ কাঁচা রিটার্ন টাইপ থাকে Promise।",
    },
    "d5-q5": {
      question: "`{ [K in keyof T]?: T[K] }` পড়লে — এটা কী?",
      options: [
        "T বা never ফেরানো conditional টাইপ",
        "T-এর প্রতিটা প্রপার্টি অপশনাল বানানো mapped টাইপ — Partial-এর সারমর্ম",
        "একটা indexed access টাইপ",
        "একটা জেনেরিক ক্লাস ঘোষণা",
      ],
      explanation:
        "`[K in keyof T]` mapped-টাইপের লুপ; `?` মডিফায়ার প্রতিটা প্রপার্টিকে অপশনাল করে আর `T[K]` টাইপ ধরে রাখে — Partial<T> ঠিক এভাবেই ইমপ্লিমেন্ট করা।",
    },
  },
  practice: {
    intro:
      "পরিকল্পনার আক্ষরিক অনুশীলন: একটা User ইন্টারফেস, তিনটা উপজাত টাইপ, শূন্য ডুপ্লিকেট প্রপার্টি। প্লেগ্রাউন্ডে করুন আর প্রতিটা উপজাত আকার থেকে ভ্যালু প্রিন্ট করুন — রূপান্তরগুলো কম্পাইলার যে এনফোর্স করছে সেটা হাতে হাতে টের পাবেন।",
    steps: [
      "`User` ডিফাইন করুন: id, name, email, passwordHash, avatarUrl (অপশনাল), createdAt (readonly)।",
      "`UserUpdate = Partial<User>` বানান — `{ name: \"New\" }` বানানো যায় আর User-এর ফিল্ড ছাড়া আর কিছুই না, যাচাই করুন।",
      "`UserPreview = Pick<User, \"id\" | \"name\">` আর `CreateUser = Omit<User, \"id\" | \"createdAt\">` বানান।",
      "`UserMap = Record<number, UserPreview>` বানিয়ে দুই এন্ট্রির ম্যাপ বানান; `getUser(map, id): UserPreview | undefined` লিখুন।",
      "ইচ্ছে করে প্রতিটাই ভাঙুন: UserUpdate-এ অজানা কী, UserMap-এ কী মিস, UserPreview-তে passwordHash। তিনটা এররই পড়ুন।",
    ],
    solutionNote:
      "কাল User-এ নতুন ফিল্ড যোগ করলে — UserUpdate আর CreateUser-এ আপনা-আপনি চলে আসবে, আর UserPreview বদলাবে শুধু Pick-তালিকায় যোগ করলে। utility টাইপের পুরো রক্ষণাবেক্ষণ-যুক্তিই এটা।",
  },
};
