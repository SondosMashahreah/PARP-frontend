export const adminSections = [
  { id: "overview", ar: "الإحصائيات", en: "Overview", icon: "overview" },
  { id: "excellence", ar: "قاعة التميز", en: "Hall of excellence", icon: "excellence" },
  { id: "users", ar: "المستخدمون", en: "Users", icon: "users" },
  { id: "news", ar: "الأخبار", en: "News", icon: "news" },
  {
    id: "reviews",
    ar: "إدارة التقييم والقرارات",
    en: "Research evaluation",
    icon: "reviews",
  },
  {
    id: "payments",
    ar: "النشر والدفع",
    en: "Publication & payments",
    icon: "payments",
  },
  {
    id: "activity",
    ar: "النشاط على المنصة",
    en: "Platform activity",
    icon: "activity",
  },
];
export function adminSection(hash = "") {
  const value = hash.replace(/^#/, "");
  return adminSections.some((section) => section.id === value)
    ? value
    : "overview";
}
export const statusLabels = {
  submitted: ["مقدّم", "Submitted"],
  under_review: ["قيد التقييم", "In review"],
  revision_requested: ["بحاجة لتعديل", "Revision requested"],
  approved: ["مقبول", "Approved"],
  rejected: ["مرفوض", "Rejected"],
  practice_suggested: ["مقترح كممارسة", "Practice suggested"],
  published: ["منشور", "Published"],
};
export const eventLabels = {
  submitted: ["تقديم عمل جديد", "Work submitted"],
  resubmitted: ["إعادة إرسال عمل", "Work resubmitted"],
  reviewer_assigned: ["إسناد التقييم", "Evaluator assigned"],
  review_submitted: ["إرسال التقييم", "Evaluation submitted"],
  scientific_decision: [
    "قرار لجنة تقييم الأبحاث",
    "Evaluation committee decision",
  ],
  published: ["نشر بحث", "Research published"],
  published_as_practice: ["نشر ممارسة", "Practice published"],
};
export const chartColors = [
  "#70d4e7",
  "#f2b28d",
  "#b2a4fb",
  "#f2cc72",
  "#e881a0",
  "#83c8af",
  "#819edf",
  "#d6a1d6",
];
export function chartRows(rows = []) {
  return rows.map((row, index) => ({
    ...row,
    value: Math.max(0, Number(row.value) || 0),
    color: chartColors[index % chartColors.length],
  }));
}
export function formatCount(value, ar) {
  return new Intl.NumberFormat(ar ? "ar-PS" : "en-GB").format(
    Number(value) || 0,
  );
}
export function formatDate(value, ar) {
  if (!value || Number.isNaN(new Date(value).getTime())) return "—";
  return new Intl.DateTimeFormat(ar ? "ar-PS" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
