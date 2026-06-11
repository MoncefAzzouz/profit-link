export interface AIThemeTokens {
  bg: string; text: string; textSec: string; accent: string;
  promoBg: string; promoText: string;
  headerBg: string; headerBorder: string;
  btnBg: string; btnText: string; btnRadius: string;
  btnBorder: string;
  cardBg: string; cardBorder: string;
  inputBg: string; inputBorder: string; inputText: string;
  radius: string; font: string;
  sectionAltBg: string; sectionDarkBg: string; sectionDarkText: string;
  reviewCardBg: string; reviewCardBorder: string;
}

const AI_THEMES: Record<string, AIThemeTokens> = {
  minimal_luxury: {
    bg: "#ffffff", text: "#18181b", textSec: "#71717a", accent: "#18181b",
    promoBg: "#18181b", promoText: "#ffffff",
    headerBg: "rgba(255,255,255,0.97)", headerBorder: "#f4f4f5",
    btnBg: "#18181b", btnText: "#ffffff", btnRadius: "0px", btnBorder: "none",
    cardBg: "#ffffff", cardBorder: "#e4e4e7",
    inputBg: "#fafafa", inputBorder: "#e4e4e7", inputText: "#18181b",
    radius: "0px", font: "'Cairo', sans-serif",
    sectionAltBg: "#f9f9f9", sectionDarkBg: "#18181b", sectionDarkText: "#f4f4f5",
    reviewCardBg: "#fafafa", reviewCardBorder: "#e4e4e7",
  },
  dark_futuristic: {
    bg: "#030014", text: "#e2e8f0", textSec: "#818cf8", accent: "#22d3ee",
    promoBg: "#0a0f2c", promoText: "#22d3ee",
    headerBg: "rgba(3,0,20,0.85)", headerBorder: "#1e1b4b",
    btnBg: "#4f46e5", btnText: "#ffffff", btnRadius: "8px", btnBorder: "1px solid #6366f1",
    cardBg: "#0a0f2c", cardBorder: "#1e1b4b",
    inputBg: "#0a0f2c", inputBorder: "#312e81", inputText: "#e2e8f0",
    radius: "12px", font: "'Cairo', sans-serif",
    sectionAltBg: "#050b14", sectionDarkBg: "#0a0f2c", sectionDarkText: "#c7d2fe",
    reviewCardBg: "#0a0f2c", reviewCardBorder: "#1e1b4b",
  },
  soft_beauty: {
    bg: "#fff1f2", text: "#881337", textSec: "#be123c", accent: "#f43f5e",
    promoBg: "#fecdd3", promoText: "#881337",
    headerBg: "rgba(255,241,242,0.95)", headerBorder: "#fecdd3",
    btnBg: "#f43f5e", btnText: "#ffffff", btnRadius: "9999px", btnBorder: "none",
    cardBg: "#ffffff", cardBorder: "#fecdd3",
    inputBg: "#fff1f2", inputBorder: "#fecdd3", inputText: "#881337",
    radius: "24px", font: "'Tajawal', sans-serif",
    sectionAltBg: "#fff5f5", sectionDarkBg: "#881337", sectionDarkText: "#fecdd3",
    reviewCardBg: "#ffffff", reviewCardBorder: "#fecdd3",
  },
  viral_tiktok: {
    bg: "#ffffff", text: "#000000", textSec: "#1f2937", accent: "#4ade80",
    promoBg: "#000000", promoText: "#facc15",
    headerBg: "#facc15", headerBorder: "#000000",
    btnBg: "#4ade80", btnText: "#000000", btnRadius: "0px", btnBorder: "3px solid #000",
    cardBg: "#ffffff", cardBorder: "#000000",
    inputBg: "#ffffff", inputBorder: "#000000", inputText: "#000000",
    radius: "0px", font: "'Cairo', sans-serif",
    sectionAltBg: "#f9f9f9", sectionDarkBg: "#facc15", sectionDarkText: "#000000",
    reviewCardBg: "#ffffff", reviewCardBorder: "#000000",
  },
  organic_nature: {
    bg: "#fafafa", text: "#2c3e35", textSec: "#5c7162", accent: "#588157",
    promoBg: "#3a5a40", promoText: "#e9edc9",
    headerBg: "rgba(250,250,250,0.92)", headerBorder: "#e9edc9",
    btnBg: "#588157", btnText: "#ffffff", btnRadius: "9999px", btnBorder: "none",
    cardBg: "#ffffff", cardBorder: "#e9edc9",
    inputBg: "#fafafa", inputBorder: "#ccd5ae", inputText: "#2c3e35",
    radius: "20px", font: "'Almarai', sans-serif",
    sectionAltBg: "#f9f9f4", sectionDarkBg: "#3a5a40", sectionDarkText: "#e9edc9",
    reviewCardBg: "#ffffff", reviewCardBorder: "#e9edc9",
  },
  bold_sales: {
    bg: "#f3f4f6", text: "#111827", textSec: "#374151", accent: "#dc2626",
    promoBg: "#dc2626", promoText: "#ffffff",
    headerBg: "#ffffff", headerBorder: "#e5e7eb",
    btnBg: "#facc15", btnText: "#111827", btnRadius: "4px", btnBorder: "none",
    cardBg: "#ffffff", cardBorder: "#e5e7eb",
    inputBg: "#f9fafb", inputBorder: "#d1d5db", inputText: "#111827",
    radius: "4px", font: "'Changa', sans-serif",
    sectionAltBg: "#ffffff", sectionDarkBg: "#111827", sectionDarkText: "#f9fafb",
    reviewCardBg: "#ffffff", reviewCardBorder: "#e5e7eb",
  },
  royal_gold: {
    bg: "#0B0B0C", text: "#F5EFE0", textSec: "#A7A08C", accent: "#D4AF37",
    promoBg: "#0B0B0C", promoText: "#D4AF37",
    headerBg: "rgba(11,11,12,0.85)", headerBorder: "#2a230f",
    btnBg: "#D4AF37", btnText: "#0B0B0C", btnRadius: "6px", btnBorder: "none",
    cardBg: "#141414", cardBorder: "#2a230f",
    inputBg: "#0B0B0C", inputBorder: "#3a3016", inputText: "#F5EFE0",
    radius: "6px", font: "'Playfair Display', 'Cairo', serif",
    sectionAltBg: "#080808", sectionDarkBg: "#070707", sectionDarkText: "#F5EFE0",
    reviewCardBg: "#141414", reviewCardBorder: "#2a230f",
  },
  clean_tech: {
    bg: "#f5f5f7", text: "#1d1d1f", textSec: "#6e6e73", accent: "#0071e3",
    promoBg: "#1d1d1f", promoText: "#ffffff",
    headerBg: "rgba(245,245,247,0.8)", headerBorder: "#e5e5ea",
    btnBg: "#0071e3", btnText: "#ffffff", btnRadius: "9999px", btnBorder: "none",
    cardBg: "#ffffff", cardBorder: "#e5e5ea",
    inputBg: "#ffffff", inputBorder: "#d2d2d7", inputText: "#1d1d1f",
    radius: "16px", font: "'Inter', 'Cairo', sans-serif",
    sectionAltBg: "#ffffff", sectionDarkBg: "#1d1d1f", sectionDarkText: "#ffffff",
    reviewCardBg: "#ffffff", reviewCardBorder: "#e5e5ea",
  },
  aurora_glass: {
    bg: "#1a0b2e", text: "#ffffff", textSec: "rgba(255,255,255,0.7)", accent: "#DB2777",
    promoBg: "rgba(255,255,255,0.1)", promoText: "#ffffff",
    headerBg: "rgba(255,255,255,0.05)", headerBorder: "rgba(255,255,255,0.1)",
    btnBg: "#ffffff", btnText: "#6D28D9", btnRadius: "9999px", btnBorder: "none",
    cardBg: "rgba(255,255,255,0.1)", cardBorder: "rgba(255,255,255,0.2)",
    inputBg: "rgba(255,255,255,0.1)", inputBorder: "rgba(255,255,255,0.2)", inputText: "#ffffff",
    radius: "24px", font: "'Space Grotesk', 'Cairo', sans-serif",
    sectionAltBg: "#2a1145", sectionDarkBg: "#1a0b2e", sectionDarkText: "#ffffff",
    reviewCardBg: "rgba(255,255,255,0.1)", reviewCardBorder: "rgba(255,255,255,0.2)",
  },
};

export const AI_TEMPLATE_IDS = Object.keys(AI_THEMES);

export function getAITheme(template: string): AIThemeTokens | null {
  return AI_THEMES[template] || null;
}
