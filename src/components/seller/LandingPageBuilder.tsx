import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout, Palette, Type, Image, Eye, Save, Plus, Trash2,
  ChevronDown, ChevronUp, Sparkles, Monitor, Smartphone,
  Copy, Check, ExternalLink, Layers, Paintbrush, Star,
  ShoppingCart, Shield, Truck, Clock, MessageSquare, Zap,
  GripVertical, Settings2, LayoutTemplate, ArrowRight, Phone, X,
  Play, Gift, Users, Award, Heart, TrendingUp, Timer, Flame,
  Camera, Video, BarChart3, Globe, Mail, Instagram, Facebook,
  Youtube, Megaphone, Target, Bolt, Crown, Gem, Rocket,
  Package, BadgePercent, Percent, AlertTriangle, ThumbsUp,
  MousePointerClick, Ratio, ToggleLeft, Hash, AlignCenter, AlignLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface LandingPageConfig {
  id: string;
  productName: string;
  template: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  primaryColor: string;
  accentColor: string;
  ctaText: string;
  ctaStyle: "rounded" | "square" | "pill";
  showReviews: boolean;
  showCountdown: boolean;
  showGuarantee: boolean;
  showFreeShipping: boolean;
  sections: string[];
  customCss: string;
  fontFamily: string;
  backgroundColor: string;
  status: "draft" | "published";
  views: number;
  conversions: number;
  price: number;
  originalPrice: number;
  category: string;
  features: string[];
  // New fields
  heroLayout: "centered" | "split" | "fullscreen" | "video-bg";
  animationStyle: "none" | "fade" | "slide" | "bounce" | "zoom";
  headerStyle: "transparent" | "solid" | "gradient" | "floating";
  socialProof: { name: string; text: string; rating: number }[];
  faqItems: { q: string; a: string }[];
  urgencyText: string;
  videoUrl: string;
  beforeAfterImages: { before: string; after: string };
  trustBadges: string[];
  countdownDate: string;
  showStickyBar: boolean;
  showFloatingCta: boolean;
  showSocialProofPopup: boolean;
  borderRadius: number;
  shadowIntensity: "none" | "sm" | "md" | "lg" | "xl";
  gradientDirection: "to-r" | "to-l" | "to-b" | "to-t" | "to-br" | "to-bl";
  ctaAnimation: "none" | "pulse" | "bounce" | "shake" | "glow";
  imageStyle: "rounded" | "sharp" | "blob" | "circle";
}

const defaultNewPage = (): LandingPageConfig => ({
  id: `lp-${Date.now()}`,
  productName: "منتج جديد",
  template: "modern",
  heroTitle: "عنوان رئيسي جذاب",
  heroSubtitle: "وصف قصير يشرح قيمة المنتج",
  heroImage: "",
  primaryColor: "#10b981",
  accentColor: "#3b82f6",
  ctaText: "اطلب الآن",
  ctaStyle: "pill",
  showReviews: true,
  showCountdown: false,
  showGuarantee: true,
  showFreeShipping: true,
  sections: ["hero", "features", "reviews", "cta"],
  customCss: "",
  fontFamily: "cairo",
  backgroundColor: "#ffffff",
  status: "draft",
  views: 0,
  conversions: 0,
  price: 1500,
  originalPrice: 3000,
  category: "منتجات",
  features: ["ميزة 1", "ميزة 2", "ميزة 3"],
  heroLayout: "split",
  animationStyle: "fade",
  headerStyle: "floating",
  socialProof: [
    { name: "أحمد م.", text: "منتج رائع جداً، أنصح به!", rating: 5 },
    { name: "سارة ك.", text: "جودة ممتازة وتوصيل سريع", rating: 5 },
  ],
  faqItems: [
    { q: "هل التوصيل مجاني؟", a: "نعم، التوصيل مجاني لجميع الولايات" },
    { q: "ما هي مدة التوصيل؟", a: "من 2 إلى 5 أيام عمل" },
  ],
  urgencyText: "⏰ العرض ينتهي قريباً! تبقى عدد محدود",
  videoUrl: "",
  beforeAfterImages: { before: "", after: "" },
  trustBadges: ["دفع عند الاستلام", "ضمان 30 يوم", "توصيل سريع", "منتج أصلي"],
  countdownDate: "",
  showStickyBar: true,
  showFloatingCta: false,
  showSocialProofPopup: true,
  borderRadius: 16,
  shadowIntensity: "md",
  gradientDirection: "to-br",
  ctaAnimation: "pulse",
  imageStyle: "rounded",
});

const templates = [
  { id: "modern", name: "عصري", icon: "✨", desc: "تصميم نظيف وأنيق", preview: "from-violet-600 to-indigo-700", tag: "شائع" },
  { id: "bold", name: "جريء", icon: "🔥", desc: "ألوان قوية وملفتة", preview: "from-orange-500 to-red-600", tag: "" },
  { id: "minimal", name: "بسيط", icon: "🎯", desc: "مساحة بيضاء واسعة", preview: "from-slate-100 to-gray-200", tag: "" },
  { id: "dark", name: "داكن", icon: "🌙", desc: "خلفية داكنة فاخرة", preview: "from-slate-900 to-gray-900", tag: "ترند" },
  { id: "gradient", name: "متدرج", icon: "🌈", desc: "تدرجات لونية جذابة", preview: "from-emerald-400 to-cyan-500", tag: "" },
  { id: "classic", name: "COD كلاسيكي", icon: "📦", desc: "تصميم COD تقليدي", preview: "from-amber-500 to-yellow-600", tag: "" },
  { id: "luxury", name: "فاخر", icon: "👑", desc: "تصميم ذهبي فاخر", preview: "from-amber-600 via-yellow-500 to-amber-700", tag: "جديد" },
  { id: "neon", name: "نيون", icon: "💜", desc: "ألوان نيون متوهجة", preview: "from-purple-600 via-pink-500 to-red-500", tag: "ترند" },
  { id: "tiktok", name: "تيك توك", icon: "🎵", desc: "مستوحى من TikTok Shop", preview: "from-gray-900 via-pink-600 to-cyan-400", tag: "🔥 ترند" },
  { id: "instagram", name: "انستغرام", icon: "📸", desc: "ستايل انستغرام شوب", preview: "from-purple-500 via-pink-500 to-orange-400", tag: "ترند" },
  { id: "whatsapp", name: "واتساب", icon: "💬", desc: "للبيع عبر واتساب", preview: "from-green-500 to-green-700", tag: "شائع" },
  { id: "flash-sale", name: "تخفيضات", icon: "⚡", desc: "عروض محدودة الوقت", preview: "from-red-600 via-red-500 to-orange-500", tag: "مبيعات" },
  { id: "video-first", name: "فيديو أولاً", icon: "🎬", desc: "فيديو كخلفية رئيسية", preview: "from-slate-800 via-slate-700 to-slate-900", tag: "جديد" },
  { id: "testimonial", name: "شهادات", icon: "⭐", desc: "يركز على آراء العملاء", preview: "from-sky-500 to-blue-600", tag: "" },
  { id: "comparison", name: "مقارنة", icon: "⚖️", desc: "قبل وبعد", preview: "from-teal-500 to-emerald-600", tag: "ترند" },
  { id: "countdown", name: "عد تنازلي", icon: "⏳", desc: "عروض بوقت محدد", preview: "from-rose-600 to-pink-700", tag: "مبيعات" },
];

const availableSections = [
  { id: "hero", name: "البطل الرئيسي", icon: Layout, required: true, desc: "القسم الأول الذي يراه الزائر" },
  { id: "urgency-bar", name: "شريط الاستعجال", icon: AlertTriangle, desc: "شريط علوي لخلق حالة استعجال" },
  { id: "features", name: "المميزات", icon: Star, desc: "قائمة مميزات المنتج" },
  { id: "video", name: "فيديو المنتج", icon: Play, desc: "عرض فيديو توضيحي" },
  { id: "gallery", name: "معرض الصور", icon: Camera, desc: "صور متعددة للمنتج" },
  { id: "before-after", name: "قبل وبعد", icon: Ratio, desc: "مقارنة قبل وبعد الاستخدام" },
  { id: "social-proof", name: "إثبات اجتماعي", icon: Users, desc: "عدد المشترين والتقييمات" },
  { id: "reviews", name: "آراء العملاء", icon: MessageSquare, desc: "تقييمات ومراجعات" },
  { id: "trust-badges", name: "شارات الثقة", icon: Shield, desc: "شارات الأمان والضمان" },
  { id: "countdown", name: "عداد تنازلي", icon: Timer, desc: "مؤقت لنهاية العرض" },
  { id: "guarantee", name: "ضمان واسترجاع", icon: Award, desc: "سياسة الضمان والإرجاع" },
  { id: "shipping", name: "معلومات التوصيل", icon: Truck, desc: "تفاصيل الشحن والتوصيل" },
  { id: "bundle", name: "عرض الحزمة", icon: Package, desc: "اشترِ أكثر وفّر أكثر" },
  { id: "faq", name: "أسئلة شائعة", icon: MessageSquare, desc: "إجابات على الأسئلة المتكررة" },
  { id: "sticky-cta", name: "زر شراء ثابت", icon: MousePointerClick, desc: "زر شراء يظهر عند التمرير" },
  { id: "notification-popup", name: "إشعار شراء", icon: Megaphone, desc: "إشعارات شراء وهمية" },
  { id: "cta", name: "دعوة للشراء", icon: ShoppingCart, required: true, desc: "نموذج الطلب" },
];

const colorPresets = [
  { name: "أخضر", value: "#10b981" },
  { name: "أزرق", value: "#3b82f6" },
  { name: "بنفسجي", value: "#8b5cf6" },
  { name: "أحمر", value: "#ef4444" },
  { name: "برتقالي", value: "#f97316" },
  { name: "وردي", value: "#ec4899" },
  { name: "ذهبي", value: "#eab308" },
  { name: "سماوي", value: "#06b6d4" },
  { name: "نيلي", value: "#6366f1" },
  { name: "زمردي", value: "#059669" },
  { name: "أرجواني", value: "#a855f7" },
  { name: "كورالي", value: "#fb7185" },
];

const bgPresets = [
  { name: "أبيض", value: "#ffffff" },
  { name: "رمادي فاتح", value: "#f8fafc" },
  { name: "كريمي", value: "#fffbeb" },
  { name: "أزرق فاتح", value: "#eff6ff" },
  { name: "داكن", value: "#0f172a" },
  { name: "نيلي داكن", value: "#1e1b4b" },
  { name: "أسود", value: "#020617" },
  { name: "رمادي داكن", value: "#1e293b" },
];

const fontOptions = [
  { value: "cairo", label: "Cairo" },
  { value: "tajawal", label: "Tajawal" },
  { value: "almarai", label: "Almarai" },
  { value: "changa", label: "Changa" },
  { value: "ibm-plex", label: "IBM Plex Arabic" },
  { value: "noto-kufi", label: "Noto Kufi" },
  { value: "readex-pro", label: "Readex Pro" },
];

const mockLandingPages: LandingPageConfig[] = [
  {
    ...defaultNewPage(),
    id: "lp-1", productName: "ساعة ذكية متعددة الوظائف", template: "modern",
    heroTitle: "ساعتك الذكية الجديدة", heroSubtitle: "تتبع لياقتك وصحتك بأناقة",
    heroImage: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80",
    primaryColor: "#10b981", accentColor: "#3b82f6", ctaText: "اطلب الآن",
    ctaStyle: "pill",
    sections: ["hero", "urgency-bar", "features", "video", "gallery", "social-proof", "reviews", "trust-badges", "countdown", "guarantee", "faq", "cta"],
    fontFamily: "cairo", backgroundColor: "#ffffff",
    status: "published", views: 1240, conversions: 89,
    price: 4500, originalPrice: 9000, category: "إلكترونيات",
    features: ["شاشة AMOLED", "مقاومة للماء IP68", "بطارية 7 أيام", "تتبع اللياقة"],
  },
  {
    ...defaultNewPage(),
    id: "lp-2", productName: "سماعات بلوتوث لاسلكية", template: "tiktok",
    heroTitle: "صوت نقي بدون حدود", heroSubtitle: "إلغاء ضوضاء متقدم",
    heroImage: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80",
    primaryColor: "#ec4899", accentColor: "#06b6d4", ctaText: "احصل عليها الآن",
    ctaStyle: "rounded", heroLayout: "fullscreen",
    sections: ["hero", "urgency-bar", "video", "features", "social-proof", "reviews", "countdown", "shipping", "cta"],
    fontFamily: "tajawal", backgroundColor: "#0f172a",
    status: "draft", views: 0, conversions: 0,
    price: 3200, originalPrice: 6500, category: "إلكترونيات",
    features: ["إلغاء الضوضاء", "بطارية 24 ساعة", "بلوتوث 5.0", "ميكروفون مدمج"],
  },
];

const LandingPageBuilder = () => {
  const { toast } = useToast();
  const [pages, setPages] = useState<LandingPageConfig[]>(() => {
    const stored = localStorage.getItem("landing_pages");
    if (stored) return JSON.parse(stored);
    // Save mock data to localStorage on first load
    localStorage.setItem("landing_pages", JSON.stringify(mockLandingPages));
    return mockLandingPages;
  });
  const [editingPage, setEditingPage] = useState<LandingPageConfig | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [activeDesignTab, setActiveDesignTab] = useState<"content" | "template" | "colors" | "sections" | "advanced">("content");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Persist pages to localStorage
  const savePages = (newPages: LandingPageConfig[]) => {
    setPages(newPages);
    localStorage.setItem("landing_pages", JSON.stringify(newPages));
  };

  const createNewPage = () => {
    const newPage = defaultNewPage();
    savePages([newPage, ...pages]);
    setEditingPage(newPage);
    toast({ title: "🎨 تم الإنشاء", description: "صفحة هبوط جديدة جاهزة للتخصيص" });
  };

  const updatePage = (field: keyof LandingPageConfig, value: any) => {
    if (!editingPage) return;
    const updated = { ...editingPage, [field]: value };
    setEditingPage(updated);
    const newPages = pages.map(p => p.id === updated.id ? updated : p);
    savePages(newPages);
  };

  const toggleSection = (sectionId: string) => {
    if (!editingPage) return;
    const section = availableSections.find(s => s.id === sectionId);
    if (section?.required) return;
    const sections = editingPage.sections.includes(sectionId)
      ? editingPage.sections.filter(s => s !== sectionId)
      : [...editingPage.sections, sectionId];
    updatePage("sections", sections);
  };

  const deletePage = (id: string) => {
    savePages(pages.filter(p => p.id !== id));
    if (editingPage?.id === id) setEditingPage(null);
    toast({ title: "🗑️ تم الحذف" });
  };

  const copyLink = (page: LandingPageConfig) => {
    navigator.clipboard.writeText(`${window.location.origin}/lp/${page.id}`);
    setCopiedId(page.id);
    toast({ title: "تم نسخ الرابط! 🔗" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const viewPage = (page: LandingPageConfig) => {
    window.open(`/lp/${page.id}`, "_blank");
  };

  const publishPage = (page: LandingPageConfig) => {
    const newStatus = page.status === "published" ? "draft" : "published";
    const newPages = pages.map(p => p.id === page.id ? { ...p, status: newStatus as "draft" | "published" } : p);
    savePages(newPages);
    if (editingPage?.id === page.id) setEditingPage({ ...editingPage, status: newStatus });
    toast({ title: newStatus === "published" ? "🚀 تم النشر" : "📝 تحويل إلى مسودة" });
    if (newStatus === "published") {
      window.open(`/lp/${page.id}`, "_blank");
    }
  };

  const cardAnim = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  });

  const isDark = (bg: string) => bg.startsWith("#0") || bg.startsWith("#1") || bg.startsWith("#2") || bg === "#020617";
  const textColor = (bg: string) => isDark(bg) ? "#f1f5f9" : "#0f172a";
  const subTextColor = (bg: string) => isDark(bg) ? "#94a3b8" : "#64748b";

  // ==================== EDITOR VIEW ====================
  if (editingPage) {
    const savings = editingPage.originalPrice - editingPage.price;
    const discountPercent = Math.round((1 - editingPage.price / editingPage.originalPrice) * 100);

    const renderPreview = (isMobile: boolean) => {
      const p = editingPage;
      const tc = textColor(p.backgroundColor);
      const stc = subTextColor(p.backgroundColor);
      const br = `${p.borderRadius}px`;

      return (
        <div className="h-full overflow-y-auto scrollbar-hide" style={{ backgroundColor: p.backgroundColor, fontFamily: p.fontFamily, color: tc }}>
          {/* Urgency Bar */}
          {p.sections.includes("urgency-bar") && (
            <div className="py-2.5 px-4 text-center text-xs font-bold text-white" style={{ backgroundColor: p.primaryColor }}>
              <span className="animate-pulse">🔥</span> {p.urgencyText} <span className="animate-pulse">🔥</span>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0" }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: p.primaryColor }}>
                <ShoppingCart className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold">{p.productName}</span>
            </div>
            <button className="text-[10px] font-bold px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: p.primaryColor }}>
              {p.ctaText}
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Hero Section */}
            {p.sections.includes("hero") && (
              <div className={`${!isMobile && p.heroLayout === "split" ? "grid grid-cols-2 gap-6 items-center" : "space-y-4"}`}>
                <div className={`relative overflow-hidden bg-muted ${p.imageStyle === "circle" ? "rounded-full aspect-square max-w-[280px] mx-auto" : p.imageStyle === "blob" ? "rounded-[30%_70%_70%_30%/30%_30%_70%_70%]" : p.imageStyle === "sharp" ? "" : ""}`}
                  style={{ borderRadius: p.imageStyle === "rounded" ? br : undefined, aspectRatio: p.imageStyle === "circle" ? "1" : "4/3" }}>
                  {p.heroImage ? (
                    <img src={p.heroImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 py-16" style={{ color: stc }}>
                      <Image className="w-10 h-10 opacity-20" />
                      <span className="text-[10px]">صورة المنتج</span>
                    </div>
                  )}
                  {discountPercent > 0 && (
                    <div className="absolute top-3 left-3 bg-destructive text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">
                      خصم {discountPercent}%
                    </div>
                  )}
                </div>

                <div className={`space-y-3 ${!isMobile && p.heroLayout === "split" ? "" : "text-center"}`} dir="rtl">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: p.primaryColor }}>{p.category}</span>
                  <h1 className="text-xl sm:text-2xl font-black leading-tight">{p.heroTitle}</h1>
                  <p className="text-xs leading-relaxed" style={{ color: stc }}>{p.heroSubtitle}</p>

                  {/* Price */}
                  <div className="p-3 rounded-xl inline-flex items-center gap-3" style={{ backgroundColor: `${p.primaryColor}15`, borderRadius: br }}>
                    <span className="text-2xl font-black" style={{ color: p.primaryColor }}>{p.price.toLocaleString()} دج</span>
                    <span className="text-sm line-through" style={{ color: stc }}>{p.originalPrice.toLocaleString()} دج</span>
                  </div>
                </div>
              </div>
            )}

            {/* Social Proof Numbers */}
            {p.sections.includes("social-proof") && (
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: Users, val: "2,340+", label: "مشتري" },
                  { icon: Star, val: "4.9/5", label: "تقييم" },
                  { icon: ThumbsUp, val: "98%", label: "رضا" },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-xl border" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
                    <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: p.primaryColor }} />
                    <p className="text-sm font-black">{s.val}</p>
                    <p className="text-[9px]" style={{ color: stc }}>{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Features */}
            {p.sections.includes("features") && (
              <div className="space-y-3" dir="rtl">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Star className="w-4 h-4" style={{ color: p.primaryColor }} /> لماذا هذا المنتج؟
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 border rounded-xl" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${p.primaryColor}15` }}>
                        <Check className="w-3 h-3" style={{ color: p.primaryColor }} />
                      </div>
                      <span className="text-[10px] font-bold">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video */}
            {p.sections.includes("video") && (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted flex items-center justify-center" style={{ borderRadius: br }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl" style={{ backgroundColor: p.primaryColor }}>
                  <Play className="w-6 h-6 text-white fill-white ml-1" />
                </div>
                <p className="absolute bottom-3 text-[10px] font-bold" style={{ color: stc }}>شاهد الفيديو التوضيحي</p>
              </div>
            )}

            {/* Before/After */}
            {p.sections.includes("before-after") && (
              <div className="space-y-3" dir="rtl">
                <h3 className="text-sm font-bold text-center">قبل وبعد الاستخدام</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl overflow-hidden border-2 border-destructive/30" style={{ borderRadius: br }}>
                    <div className="bg-destructive/10 text-center py-1 text-[10px] font-bold text-destructive">قبل ❌</div>
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <Image className="w-8 h-8 opacity-20" />
                    </div>
                  </div>
                  <div className="rounded-xl overflow-hidden border-2" style={{ borderColor: p.primaryColor, borderRadius: br }}>
                    <div className="text-center py-1 text-[10px] font-bold text-white" style={{ backgroundColor: p.primaryColor }}>بعد ✅</div>
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <Image className="w-8 h-8 opacity-20" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trust Badges */}
            {p.sections.includes("trust-badges") && (
              <div className="grid grid-cols-2 gap-2">
                {p.trustBadges.map((badge, i) => {
                  const icons = [Shield, Truck, Award, Check];
                  const Icon = icons[i % icons.length];
                  return (
                    <div key={i} className="flex items-center gap-2 p-2.5 border rounded-xl" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
                      <Icon className="w-4 h-4 shrink-0" style={{ color: p.primaryColor }} />
                      <span className="text-[10px] font-bold">{badge}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reviews */}
            {p.sections.includes("reviews") && (
              <div className="space-y-3" dir="rtl">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" style={{ color: p.primaryColor }} /> آراء العملاء
                </h3>
                {p.socialProof.map((review, i) => (
                  <div key={i} className="p-3 border rounded-xl space-y-2" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: p.primaryColor }}>
                          {review.name[0]}
                        </div>
                        <span className="text-xs font-bold">{review.name}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: review.rating }).map((_, j) => (
                          <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px]" style={{ color: stc }}>{review.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Countdown */}
            {p.sections.includes("countdown") && (
              <div className="p-4 rounded-xl text-center space-y-2" style={{ backgroundColor: `${p.primaryColor}10`, borderRadius: br }}>
                <p className="text-xs font-bold" style={{ color: p.primaryColor }}>⏰ العرض ينتهي خلال</p>
                <div className="flex justify-center gap-3" dir="ltr">
                  {[{ v: "02", l: "يوم" }, { v: "14", l: "ساعة" }, { v: "35", l: "دقيقة" }, { v: "09", l: "ثانية" }].map((t, i) => (
                    <div key={i} className="text-center">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-black text-white" style={{ backgroundColor: p.primaryColor }}>
                        {t.v}
                      </div>
                      <p className="text-[8px] mt-1" style={{ color: stc }}>{t.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bundle */}
            {p.sections.includes("bundle") && (
              <div className="space-y-2" dir="rtl">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Gift className="w-4 h-4" style={{ color: p.primaryColor }} /> عروض خاصة
                </h3>
                {[
                  { qty: "1x", price: p.price, label: "قطعة واحدة", save: 0, popular: false },
                  { qty: "2x", price: Math.round(p.price * 1.7), label: "قطعتين", save: 15, popular: true },
                  { qty: "3x", price: Math.round(p.price * 2.3), label: "ثلاث قطع", save: 25, popular: false },
                ].map((b, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 border-2 rounded-xl relative ${b.popular ? "shadow-md" : ""}`}
                    style={{ borderColor: b.popular ? p.primaryColor : (isDark(p.backgroundColor) ? "#334155" : "#e2e8f0"), borderRadius: br }}>
                    {b.popular && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-white text-[8px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: p.primaryColor }}>
                        الأكثر طلباً
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black" style={{ color: p.primaryColor }}>{b.qty}</span>
                      <span className="text-xs font-bold">{b.label}</span>
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-black">{b.price.toLocaleString()} دج</span>
                      {b.save > 0 && <span className="text-[9px] font-bold text-destructive mr-2">وفّر {b.save}%</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FAQ */}
            {p.sections.includes("faq") && (
              <div className="space-y-2" dir="rtl">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" style={{ color: p.primaryColor }} /> أسئلة شائعة
                </h3>
                {p.faqItems.map((faq, i) => (
                  <div key={i} className="p-3 border rounded-xl" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
                    <p className="text-xs font-bold">{faq.q}</p>
                    <p className="text-[10px] mt-1" style={{ color: stc }}>{faq.a}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Guarantee */}
            {p.sections.includes("guarantee") && (
              <div className="p-4 rounded-xl border-2 border-dashed text-center space-y-2" style={{ borderColor: p.primaryColor, borderRadius: br }}>
                <Shield className="w-8 h-8 mx-auto" style={{ color: p.primaryColor }} />
                <p className="text-sm font-bold">ضمان 30 يوم</p>
                <p className="text-[10px]" style={{ color: stc }}>إذا لم يعجبك المنتج، يمكنك إرجاعه واسترداد أموالك بالكامل</p>
              </div>
            )}

            {/* Shipping */}
            {p.sections.includes("shipping") && (
              <div className="p-4 rounded-xl border space-y-3" dir="rtl" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Truck className="w-4 h-4" style={{ color: p.primaryColor }} /> معلومات التوصيل
                </h3>
                {[
                  { icon: Truck, text: "توصيل مجاني لجميع الولايات" },
                  { icon: Clock, text: "التوصيل خلال 2-5 أيام عمل" },
                  { icon: ShoppingCart, text: "الدفع عند الاستلام COD" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <item.icon className="w-3.5 h-3.5" style={{ color: p.primaryColor }} />
                    <span className="text-[10px] font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Form */}
            {p.sections.includes("cta") && (
              <div className="p-4 border-2 rounded-xl space-y-3" dir="rtl" style={{ borderColor: p.primaryColor, borderRadius: br }}>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" style={{ color: p.primaryColor }} /> اطلب الآن
                </h3>
                <div className="space-y-2">
                  {["الاسم الكامل", "رقم الهاتف", "الولاية"].map((ph, i) => (
                    <div key={i} className="h-9 rounded-lg border px-3 flex items-center text-[10px]" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#d1d5db", color: stc, borderRadius: `${Math.min(p.borderRadius, 12)}px` }}>
                      {ph}
                    </div>
                  ))}
                </div>
                <button
                  className={`w-full py-3.5 text-sm font-black text-white shadow-xl transition-transform hover:scale-[1.02] ${
                    p.ctaAnimation === "pulse" ? "animate-pulse" : ""
                  } ${p.ctaStyle === "pill" ? "rounded-full" : p.ctaStyle === "rounded" ? "rounded-xl" : "rounded-none"}`}
                  style={{ backgroundColor: p.primaryColor }}
                >
                  {p.ctaText} — {p.price.toLocaleString()} دج
                </button>
                <div className="flex items-center justify-center gap-3 text-[9px]" style={{ color: stc }}>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> آمن</span>
                  <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> مجاني</span>
                  <span className="flex items-center gap-1"><Award className="w-3 h-3" /> ضمان</span>
                </div>
              </div>
            )}

            {/* Notification Popup Preview */}
            {p.sections.includes("notification-popup") && (
              <div className="fixed-preview p-3 border rounded-xl flex items-center gap-3 shadow-lg" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br, backgroundColor: isDark(p.backgroundColor) ? "#1e293b" : "#ffffff" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${p.primaryColor}15` }}>
                  <ShoppingCart className="w-4 h-4" style={{ color: p.primaryColor }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold">أحمد من الجزائر</p>
                  <p className="text-[9px]" style={{ color: stc }}>اشترى هذا المنتج منذ 3 دقائق</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="flex flex-col h-[calc(100vh-140px)] -m-4 sm:-m-6">
        {/* Editor header */}
        <div className="bg-card border-b border-border p-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setEditingPage(null)} className="rounded-xl gap-1.5">
              <ChevronDown className="w-4 h-4 rotate-90" /> رجوع
            </Button>
            <div>
              <h2 className="text-sm font-bold text-foreground leading-tight">{editingPage.productName}</h2>
              <p className="text-[10px] text-muted-foreground">تعديل صفحة الهبوط</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-muted rounded-lg p-0.5 mr-2">
              <button onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded-md transition-all ${previewDevice === "desktop" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <Monitor className="w-4 h-4" />
              </button>
              <button onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded-md transition-all ${previewDevice === "mobile" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={() => viewPage(editingPage)} className="rounded-xl gap-1.5">
              <ExternalLink className="w-4 h-4" /> معاينة
            </Button>
            <Button size="sm" onClick={() => publishPage(editingPage)} className="rounded-xl gap-1.5 bg-gradient-to-l from-primary to-primary/90 shadow-md">
              {editingPage.status === "published" ? <><Zap className="w-4 h-4" /> منشورة</> : <><Sparkles className="w-4 h-4" /> نشر</>}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Live Preview */}
          <div className="hidden lg:flex flex-1 bg-muted/30 items-center justify-center p-6 overflow-y-auto">
            <div className={`bg-background shadow-2xl rounded-2xl overflow-hidden transition-all duration-500 origin-center ${
              previewDevice === "mobile" ? "w-[375px] h-[700px]" : "w-full max-w-4xl h-full"
            }`}>
              {renderPreview(previewDevice === "mobile")}
            </div>
          </div>

          {/* Config Panels */}
          <div className="w-full lg:w-[420px] border-r border-border bg-card flex flex-col shrink-0">
            {/* Tabs */}
            <div className="p-3 border-b border-border">
              <div className="flex bg-muted rounded-xl p-0.5 gap-0.5">
                {([
                  { id: "content" as const, label: "المحتوى", icon: Type },
                  { id: "template" as const, label: "القوالب", icon: LayoutTemplate },
                  { id: "colors" as const, label: "الألوان", icon: Palette },
                  { id: "sections" as const, label: "الأقسام", icon: Layers },
                  { id: "advanced" as const, label: "متقدم", icon: Settings2 },
                ]).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDesignTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-medium transition-all ${
                      activeDesignTab === tab.id ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* ===== CONTENT TAB ===== */}
              {activeDesignTab === "content" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">اسم المنتج</Label>
                    <Input value={editingPage.productName} onChange={(e) => updatePage("productName", e.target.value)} className="rounded-xl h-9 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold opacity-70">السعر (دج)</Label>
                      <Input type="number" value={editingPage.price} onChange={(e) => updatePage("price", parseInt(e.target.value) || 0)} className="rounded-xl h-8 text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold opacity-70">السعر الأصلي</Label>
                      <Input type="number" value={editingPage.originalPrice} onChange={(e) => updatePage("originalPrice", parseInt(e.target.value) || 0)} className="rounded-xl h-8 text-xs" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">التصنيف</Label>
                    <Input value={editingPage.category} onChange={(e) => updatePage("category", e.target.value)} className="rounded-xl h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">العنوان الرئيسي</Label>
                    <Input value={editingPage.heroTitle} onChange={(e) => updatePage("heroTitle", e.target.value)} className="rounded-xl h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">العنوان الفرعي</Label>
                    <Textarea value={editingPage.heroSubtitle} onChange={(e) => updatePage("heroSubtitle", e.target.value)} className="rounded-xl text-sm" rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">رابط الصورة</Label>
                    <Input value={editingPage.heroImage} onChange={(e) => updatePage("heroImage", e.target.value)} className="rounded-xl h-9 text-sm" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">نص زر الشراء</Label>
                    <Input value={editingPage.ctaText} onChange={(e) => updatePage("ctaText", e.target.value)} className="rounded-xl h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">نص الاستعجال</Label>
                    <Input value={editingPage.urgencyText} onChange={(e) => updatePage("urgencyText", e.target.value)} className="rounded-xl h-9 text-sm" />
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">المميزات</Label>
                    {editingPage.features.map((feature, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input value={feature} onChange={(e) => {
                          const nf = [...editingPage.features]; nf[idx] = e.target.value;
                          updatePage("features", nf);
                        }} className="rounded-xl h-8 text-xs flex-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => updatePage("features", editingPage.features.filter((_, i) => i !== idx))}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full rounded-xl border-dashed h-8 text-xs gap-1"
                      onClick={() => updatePage("features", [...editingPage.features, "ميزة جديدة"])}>
                      <Plus className="w-3 h-3" /> إضافة
                    </Button>
                  </div>

                  {/* Trust Badges */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">شارات الثقة</Label>
                    {editingPage.trustBadges.map((badge, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input value={badge} onChange={(e) => {
                          const nb = [...editingPage.trustBadges]; nb[idx] = e.target.value;
                          updatePage("trustBadges", nb);
                        }} className="rounded-xl h-8 text-xs flex-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => updatePage("trustBadges", editingPage.trustBadges.filter((_, i) => i !== idx))}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full rounded-xl border-dashed h-8 text-xs gap-1"
                      onClick={() => updatePage("trustBadges", [...editingPage.trustBadges, "شارة جديدة"])}>
                      <Plus className="w-3 h-3" /> إضافة
                    </Button>
                  </div>

                  {/* Reviews */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">آراء العملاء</Label>
                    {editingPage.socialProof.map((review, idx) => (
                      <div key={idx} className="p-2 border border-border rounded-xl space-y-1.5">
                        <div className="flex gap-2">
                          <Input value={review.name} onChange={(e) => {
                            const nr = [...editingPage.socialProof]; nr[idx] = { ...nr[idx], name: e.target.value };
                            updatePage("socialProof", nr);
                          }} placeholder="الاسم" className="rounded-lg h-7 text-[10px] flex-1" />
                          <Select value={String(review.rating)} onValueChange={(v) => {
                            const nr = [...editingPage.socialProof]; nr[idx] = { ...nr[idx], rating: parseInt(v) };
                            updatePage("socialProof", nr);
                          }}>
                            <SelectTrigger className="w-16 h-7 text-[10px] rounded-lg"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {[5, 4, 3].map(r => <SelectItem key={r} value={String(r)}>{"⭐".repeat(r)}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                            onClick={() => updatePage("socialProof", editingPage.socialProof.filter((_, i) => i !== idx))}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <Input value={review.text} onChange={(e) => {
                          const nr = [...editingPage.socialProof]; nr[idx] = { ...nr[idx], text: e.target.value };
                          updatePage("socialProof", nr);
                        }} placeholder="نص المراجعة" className="rounded-lg h-7 text-[10px]" />
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full rounded-xl border-dashed h-8 text-xs gap-1"
                      onClick={() => updatePage("socialProof", [...editingPage.socialProof, { name: "عميل جديد", text: "تجربة ممتازة", rating: 5 }])}>
                      <Plus className="w-3 h-3" /> إضافة رأي
                    </Button>
                  </div>

                  {/* FAQ */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">الأسئلة الشائعة</Label>
                    {editingPage.faqItems.map((faq, idx) => (
                      <div key={idx} className="p-2 border border-border rounded-xl space-y-1.5">
                        <div className="flex gap-2">
                          <Input value={faq.q} onChange={(e) => {
                            const nf = [...editingPage.faqItems]; nf[idx] = { ...nf[idx], q: e.target.value };
                            updatePage("faqItems", nf);
                          }} placeholder="السؤال" className="rounded-lg h-7 text-[10px] flex-1" />
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                            onClick={() => updatePage("faqItems", editingPage.faqItems.filter((_, i) => i !== idx))}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <Input value={faq.a} onChange={(e) => {
                          const nf = [...editingPage.faqItems]; nf[idx] = { ...nf[idx], a: e.target.value };
                          updatePage("faqItems", nf);
                        }} placeholder="الإجابة" className="rounded-lg h-7 text-[10px]" />
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full rounded-xl border-dashed h-8 text-xs gap-1"
                      onClick={() => updatePage("faqItems", [...editingPage.faqItems, { q: "سؤال جديد؟", a: "الإجابة هنا" }])}>
                      <Plus className="w-3 h-3" /> إضافة سؤال
                    </Button>
                  </div>
                </div>
              )}

              {/* ===== TEMPLATES TAB ===== */}
              {activeDesignTab === "template" && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">اختر قالباً ترند يناسب منتجك</p>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        onClick={() => updatePage("template", tmpl.id)}
                        className={`relative p-2.5 rounded-xl border-2 transition-all text-center space-y-1 ${
                          editingPage.template === tmpl.id ? "border-primary bg-primary/5 shadow-md" : "border-border/50 hover:border-border hover:shadow-sm"
                        }`}
                      >
                        {tmpl.tag && (
                          <span className="absolute -top-1.5 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                            {tmpl.tag}
                          </span>
                        )}
                        <div className={`w-full h-10 rounded-lg bg-gradient-to-br ${tmpl.preview}`} />
                        <span className="text-lg">{tmpl.icon}</span>
                        <p className="text-[10px] font-bold">{tmpl.name}</p>
                        <p className="text-[8px] text-muted-foreground">{tmpl.desc}</p>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label className="text-xs font-bold opacity-70">نوع الخط</Label>
                    <Select value={editingPage.fontFamily} onValueChange={(v) => updatePage("fontFamily", v)}>
                      <SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {fontOptions.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">تخطيط البطل</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { id: "split" as const, label: "منقسم", icon: "◧" },
                        { id: "centered" as const, label: "متمركز", icon: "◻" },
                        { id: "fullscreen" as const, label: "ملء الشاشة", icon: "▣" },
                        { id: "video-bg" as const, label: "خلفية فيديو", icon: "▶" },
                      ]).map(l => (
                        <button key={l.id} onClick={() => updatePage("heroLayout", l.id)}
                          className={`p-2 rounded-xl border-2 text-center transition-all ${editingPage.heroLayout === l.id ? "border-primary bg-primary/5" : "border-border/50"}`}>
                          <span className="text-lg">{l.icon}</span>
                          <p className="text-[10px] font-bold mt-0.5">{l.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ===== COLORS TAB ===== */}
              {activeDesignTab === "colors" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">اللون الأساسي</Label>
                    <div className="flex flex-wrap gap-2">
                      {colorPresets.map(color => (
                        <button key={color.value} onClick={() => updatePage("primaryColor", color.value)}
                          className={`w-8 h-8 rounded-lg transition-all ${editingPage.primaryColor === color.value ? "ring-2 ring-primary ring-offset-2 scale-110" : "hover:scale-105"}`}
                          style={{ backgroundColor: color.value }} title={color.name} />
                      ))}
                      <div className="relative">
                        <input type="color" value={editingPage.primaryColor} onChange={(e) => updatePage("primaryColor", e.target.value)} className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer" />
                        <div className="w-8 h-8 rounded-lg border-2 border-dashed border-border flex items-center justify-center"><Paintbrush className="w-3 h-3 text-muted-foreground" /></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">لون الخلفية</Label>
                    <div className="flex flex-wrap gap-2">
                      {bgPresets.map(bg => (
                        <button key={bg.value} onClick={() => updatePage("backgroundColor", bg.value)}
                          className={`w-8 h-8 rounded-lg border transition-all ${editingPage.backgroundColor === bg.value ? "ring-2 ring-primary ring-offset-2 scale-110" : "border-border hover:scale-105"}`}
                          style={{ backgroundColor: bg.value }} title={bg.name} />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">شكل زر الشراء</Label>
                    <div className="flex gap-2">
                      {(["pill", "rounded", "square"] as const).map(style => (
                        <button key={style} onClick={() => updatePage("ctaStyle", style)}
                          className={`flex-1 py-2 text-[10px] font-bold border-2 transition-all ${
                            editingPage.ctaStyle === style ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                          } ${style === "pill" ? "rounded-full" : style === "rounded" ? "rounded-lg" : "rounded-none"}`}>
                          {style === "pill" ? "دائري" : style === "rounded" ? "مستدير" : "مربع"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">شكل الصور</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["rounded", "sharp", "blob", "circle"] as const).map(style => (
                        <button key={style} onClick={() => updatePage("imageStyle", style)}
                          className={`p-2 border-2 text-center transition-all ${editingPage.imageStyle === style ? "border-primary bg-primary/5" : "border-border/50"}`}
                          style={{ borderRadius: style === "rounded" ? "12px" : style === "blob" ? "30% 70% 70% 30%" : style === "circle" ? "50%" : "0" }}>
                          <span className="text-[10px] font-bold">{style === "rounded" ? "مستدير" : style === "sharp" ? "حاد" : style === "blob" ? "عضوي" : "دائري"}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">حجم الحواف ({editingPage.borderRadius}px)</Label>
                    <Slider value={[editingPage.borderRadius]} onValueChange={([v]) => updatePage("borderRadius", v)} min={0} max={32} step={2} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">حركة زر الشراء</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["none", "pulse", "bounce", "glow"] as const).map(anim => (
                        <button key={anim} onClick={() => updatePage("ctaAnimation", anim)}
                          className={`py-2 rounded-xl border-2 text-[10px] font-bold transition-all ${editingPage.ctaAnimation === anim ? "border-primary bg-primary/5 text-primary" : "border-border/50 text-muted-foreground"}`}>
                          {anim === "none" ? "بدون" : anim === "pulse" ? "نبض" : anim === "bounce" ? "قفز" : "توهج"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ===== SECTIONS TAB ===== */}
              {activeDesignTab === "sections" && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-3">فعّل أو عطّل الأقسام حسب حاجتك</p>
                  {availableSections.map((section) => {
                    const isActive = editingPage.sections.includes(section.id);
                    return (
                      <button
                        key={section.id}
                        onClick={() => toggleSection(section.id)}
                        disabled={section.required}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-right ${
                          isActive ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"
                        } ${section.required ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          <section.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold">{section.name}</p>
                          <p className="text-[9px] text-muted-foreground truncate">{section.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isActive ? "bg-primary border-primary text-white" : "border-border"}`}>
                          {isActive && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ===== ADVANCED TAB ===== */}
              {activeDesignTab === "advanced" && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-primary" /> خيارات متقدمة</h3>

                    <div className="flex items-center justify-between p-3 border border-border rounded-xl">
                      <div>
                        <p className="text-xs font-bold">شريط شراء ثابت</p>
                        <p className="text-[9px] text-muted-foreground">يظهر عند التمرير للأسفل</p>
                      </div>
                      <Switch checked={editingPage.showStickyBar} onCheckedChange={(v) => updatePage("showStickyBar", v)} />
                    </div>

                    <div className="flex items-center justify-between p-3 border border-border rounded-xl">
                      <div>
                        <p className="text-xs font-bold">زر شراء عائم</p>
                        <p className="text-[9px] text-muted-foreground">زر ثابت في أسفل الشاشة</p>
                      </div>
                      <Switch checked={editingPage.showFloatingCta} onCheckedChange={(v) => updatePage("showFloatingCta", v)} />
                    </div>

                    <div className="flex items-center justify-between p-3 border border-border rounded-xl">
                      <div>
                        <p className="text-xs font-bold">إشعارات شراء وهمية</p>
                        <p className="text-[9px] text-muted-foreground">تظهر عشوائياً لزيادة الثقة</p>
                      </div>
                      <Switch checked={editingPage.showSocialProofPopup} onCheckedChange={(v) => updatePage("showSocialProofPopup", v)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">رابط الفيديو (YouTube/Vimeo)</Label>
                    <Input value={editingPage.videoUrl} onChange={(e) => updatePage("videoUrl", e.target.value)} placeholder="https://youtube.com/watch?v=..." className="rounded-xl h-9 text-xs" dir="ltr" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">CSS مخصص</Label>
                    <Textarea value={editingPage.customCss} onChange={(e) => updatePage("customCss", e.target.value)} placeholder=".hero { ... }" className="rounded-xl text-xs font-mono" rows={4} dir="ltr" />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border bg-muted/20 shrink-0">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold opacity-60">الحالة</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${editingPage.status === "published" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                  {editingPage.status === "published" ? "منشورة" : "مسودة"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)} className="rounded-xl h-9 text-xs gap-1.5 lg:hidden">
                  <Eye className="w-3.5 h-3.5" /> معاينة
                </Button>
                <Button size="sm" className="rounded-xl h-9 text-xs gap-1.5 w-full col-span-2 lg:col-span-1 shadow-sm" onClick={() => {
                  toast({ title: "💾 تم الحفظ", description: "تم حفظ التغييرات بنجاح" });
                }}>
                  <Save className="w-3.5 h-3.5" /> حفظ
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-[420px] p-0 overflow-hidden border-none rounded-3xl" dir="rtl">
            <DialogHeader className="sr-only"><DialogTitle>معاينة</DialogTitle></DialogHeader>
            <div className="h-[80vh] w-full">
              {renderPreview(true)}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ==================== LIST VIEW ====================
  return (
    <div className="space-y-6">
      <motion.div {...cardAnim()} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-primary" />
            صفحات الهبوط
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{pages.length} صفحة • {templates.length} قالب ترند متاح</p>
        </div>
        <Button onClick={createNewPage} className="gap-2 rounded-xl bg-gradient-to-l from-primary to-primary/90 shadow-md hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> صفحة جديدة
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "إجمالي الزيارات", value: pages.reduce((s, p) => s + p.views, 0).toLocaleString(), icon: Eye },
          { label: "التحويلات", value: pages.reduce((s, p) => s + p.conversions, 0).toLocaleString(), icon: ShoppingCart },
          { label: "معدل التحويل", value: `${pages.reduce((s, p) => s + p.views, 0) > 0 ? ((pages.reduce((s, p) => s + p.conversions, 0) / pages.reduce((s, p) => s + p.views, 0)) * 100).toFixed(1) : 0}%`, icon: Zap },
        ].map((stat, i) => (
          <motion.div key={i} {...cardAnim(i * 0.06)} className="dash-card-interactive p-4">
            <stat.icon className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Page cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {pages.map((page, i) => {
            const tmpl = templates.find(t => t.id === page.template);
            return (
              <motion.div key={page.id} layout
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }} className="dash-card-interactive overflow-hidden group">
                <div className={`h-32 bg-gradient-to-br ${tmpl?.preview || "from-primary to-primary/80"} p-5 flex items-end relative`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative z-10">
                    <p className="text-white font-bold text-lg">{page.productName}</p>
                    <p className="text-white/80 text-sm">{tmpl?.name || "قالب"} • {tmpl?.icon}</p>
                  </div>
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {tmpl?.tag && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm">{tmpl.tag}</span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      page.status === "published" ? "bg-emerald-500 text-white" : "bg-white/20 text-white backdrop-blur-sm"
                    }`}>
                      {page.status === "published" ? "منشورة" : "مسودة"}
                    </span>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{page.views.toLocaleString()} زيارة</span>
                    <span className="text-secondary font-semibold">{page.conversions} تحويل</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {page.sections.slice(0, 5).map(s => {
                      const sec = availableSections.find(a => a.id === s);
                      return sec ? (
                        <span key={s} className="text-[10px] bg-muted px-2 py-0.5 rounded-lg text-muted-foreground">{sec.name}</span>
                      ) : null;
                    })}
                    {page.sections.length > 5 && (
                      <span className="text-[10px] text-muted-foreground">+{page.sections.length - 5}</span>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button variant="outline" size="sm" onClick={() => setEditingPage(page)} className="flex-1 rounded-xl gap-1.5">
                      <Paintbrush className="w-3.5 h-3.5" /> تخصيص
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => viewPage(page)} className="rounded-xl gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => copyLink(page)} className="rounded-xl gap-1.5">
                      {copiedId === page.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => publishPage(page)} className="rounded-xl">
                      {page.status === "published" ? <Eye className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deletePage(page.id)} className="rounded-xl text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {pages.length === 0 && (
        <motion.div {...cardAnim()} className="text-center py-16">
          <LayoutTemplate className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">لا توجد صفحات هبوط</p>
          <p className="text-sm text-muted-foreground/70 mt-1">أنشئ أول صفحة لعرض منتجاتك</p>
          <Button onClick={createNewPage} className="mt-4 gap-2 rounded-xl">
            <Plus className="w-4 h-4" /> إنشاء صفحة
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default LandingPageBuilder;
