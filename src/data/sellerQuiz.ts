// Seller qualification quiz shown as the final sign-up step.
// `level` is hidden from the applicant (used only for the admin score):
//   good ✅ = 2 pts, mid ⚠️ = 1 pt, bad ❌ = 0 pts
export type QuizLevel = "good" | "mid" | "bad";

export interface QuizOption {
  label: string;
  level: QuizLevel;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

export interface QuizAnswer {
  q: string;
  answer: string;
  level: QuizLevel;
}

export const sellerQuiz: QuizQuestion[] = [
  {
    id: 1,
    question: "مستواك في التسويق الإلكتروني؟",
    options: [
      { label: "مبتدئ", level: "bad" },
      { label: "متوسط", level: "mid" },
      { label: "محترف", level: "good" },
    ],
  },
  {
    id: 2,
    question: "هل سبق لك البيع أو التسويق عبر الإنترنت؟",
    options: [
      { label: "لا", level: "bad" },
      { label: "نعم (تجربة بسيطة)", level: "mid" },
      { label: "نعم مع نتائج ومبيعات حقيقية", level: "good" },
    ],
  },
  {
    id: 3,
    question: "ما هي المنصات التي تعتمد عليها للتسويق؟",
    options: [
      { label: "لا أستخدم أي منصة", level: "bad" },
      { label: "Facebook فقط", level: "mid" },
      { label: "Facebook + TikTok + Instagram + إعلانات ممولة", level: "good" },
    ],
  },
  {
    id: 4,
    question: "عدد الطلبات التي تستطيع تحقيقها أسبوعيًا؟",
    options: [
      { label: "أقل من 5", level: "bad" },
      { label: "من 5 إلى 20", level: "mid" },
      { label: "أكثر من 20 مع خبرة إعلانات أو محتوى مدفوع", level: "good" },
    ],
  },
  {
    id: 5,
    question: "خبرتك في الإعلانات الممولة؟",
    options: [
      { label: "لا أملك خبرة", level: "bad" },
      { label: "جربت بدون نتائج", level: "mid" },
      { label: "أستطيع إنشاء حملات وتحليلها وتحسينها", level: "good" },
    ],
  },
  {
    id: 6,
    question: "هدفك من الانضمام؟",
    options: [
      { label: "تجربة فقط", level: "bad" },
      { label: "تعلم بدون تطبيق", level: "mid" },
      { label: "بناء دخل + مشروع + تطوير مهارة التسويق بالعمولة", level: "good" },
    ],
  },
  {
    id: 7,
    question: "إذا كان المنتج بسعر مرتفع وربح ضعيف، ماذا تفعل؟",
    options: [
      { label: "أغير المنتج مباشرة", level: "bad" },
      { label: "أشتكي من السعر", level: "bad" },
      { label: "أعمل على تحسين العرض + استهداف + قيمة + محتوى قوي", level: "good" },
    ],
  },
  {
    id: 8,
    question: "إذا فشل إعلانك بـ 10,000 دج ماذا تفعل أولاً؟",
    options: [
      { label: "أوقف كل شيء", level: "bad" },
      { label: "ألوم المنتج", level: "bad" },
      { label: "أحلل (الاستهداف + الإعلان + صفحة الهبوط) وأعدل الحملات", level: "good" },
    ],
  },
  {
    id: 9,
    question: 'عندما يقول الزبون: "المنتج أرخص عند صفحة أخرى"',
    options: [
      { label: "أخفض السعر مباشرة", level: "bad" },
      { label: "أتجاهله", level: "bad" },
      { label: "أوضح القيمة + الضمان + الخدمة + الجودة بدون الدخول في حرب سعرية", level: "good" },
    ],
  },
  {
    id: 10,
    question: "هل تستطيع صناعة عرض قوي لمنتج ضعيف؟",
    options: [
      { label: "لا", level: "bad" },
      { label: "أحيانًا", level: "bad" },
      { label: "نعم (عرض + هدية + استعجال + قيمة مضافة)", level: "good" },
    ],
  },
  {
    id: 11,
    question: "الفرق بين المسوق العادي والمحترف؟",
    options: [
      { label: "لا يوجد فرق", level: "bad" },
      { label: "نفس الشيء", level: "bad" },
      { label: "المحترف يبني علامة + ثقة + مبيعات طويلة المدى، العادي يركز على البيع السريع فقط", level: "good" },
    ],
  },
  {
    id: 12,
    question: "أكبر سبب فشل المسوقين في الجزائر؟",
    options: [
      { label: "الحظ", level: "bad" },
      { label: "قلة المنتجات", level: "bad" },
      { label: "ضعف الاستراتيجية + ضعف الإعلانات + الاستسلام السريع + تقليد الآخرين بدون تحليل", level: "good" },
    ],
  },
];

// Fisher–Yates shuffle (returns a new array; does not mutate input).
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const LEVEL_POINTS: Record<QuizLevel, number> = { good: 2, mid: 1, bad: 0 };

// Score a set of answers → percentage (0–100) of the max possible.
export function scoreAnswers(answers: QuizAnswer[]): { points: number; max: number; percent: number } {
  const max = answers.length * 2;
  const points = answers.reduce((sum, a) => sum + (LEVEL_POINTS[a.level] ?? 0), 0);
  const percent = max > 0 ? Math.round((points / max) * 100) : 0;
  return { points, max, percent };
}
