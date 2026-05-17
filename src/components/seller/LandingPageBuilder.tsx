import { useState, useEffect, useRef, useDeferredValue, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout, Palette, Type, Image, Eye, EyeOff, Edit, Save, Plus, Trash2,
  ChevronDown, ChevronUp, Sparkles, Monitor, Smartphone,
  Copy, Check, ExternalLink, Layers, Paintbrush, Star,
  ShoppingCart, Shield, Truck, Clock, MessageSquare, Zap,
  GripVertical, Settings2, LayoutTemplate, ArrowRight, Phone, X,
  Play, Gift, Users, Award, Heart, TrendingUp, Timer, Flame,
  Camera, Video, BarChart3, Globe, Mail, Instagram, Facebook,
  Youtube, Megaphone, Target, Bolt, Crown, Gem, Rocket,
  Package, BadgePercent, Percent, AlertTriangle, ThumbsUp,
  MousePointerClick, Ratio, ToggleLeft, Hash, AlignCenter, AlignLeft, Upload
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from '@/config/api';


export interface BundlePack {
  id: string;
  name: string;
  image: string;
  price: number;
}

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
  pixels?: { facebook?: string; tiktok?: string; snapchat?: string };
  galleryImages: string[];
  availableColors?: string[];
  availableSizes?: string[];
  logo?: string;
  productId?: string;
  commission?: number;
  bundles?: BundlePack[];
  hasMarketingOffers?: boolean;
  marketingOffers?: any[];
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
  pixels: { facebook: "", tiktok: "", snapchat: "" },
  galleryImages: [],
  availableColors: [],
  availableSizes: []
});

const templates = [
  { id: "original", name: "الأصلي", icon: "💎", desc: "تصميم واجهة المتجر الكلاسيكي", preview: "from-blue-600 to-indigo-800", tag: "الأساسي" },
  { id: "modern", name: "عصري", icon: "✨", desc: "تصميم نظيف وأنيق", preview: "from-violet-600 to-indigo-700", tag: "شائع" },
  { id: "bold", name: "جريء", icon: "🔥", desc: "ألوان قوية وملفتة", preview: "from-orange-500 to-red-600", tag: "" },
  { id: "minimal", name: "بسيط", icon: "🎯", desc: "مساحة بيضاء واسعة", preview: "from-slate-100 to-gray-200", tag: "" },
  { id: "dark", name: "داكن", icon: "🌙", desc: "خلفية داكنة فاخرة", preview: "from-slate-900 to-gray-900", tag: "ترند" },
  { id: "gradient", name: "متدرج", icon: "🌈", desc: "تدرجات لونية جذابة", preview: "from-emerald-400 to-cyan-500", tag: "" },
  { id: "luxury", name: "فاخر", icon: "👑", desc: "تصميم ذهبي فاخر", preview: "from-amber-600 via-yellow-500 to-amber-700", tag: "جديد" },
  { id: "neon", name: "نيون", icon: "💜", desc: "ألوان نيون متوهجة", preview: "from-purple-600 via-pink-500 to-red-500", tag: "ترند" },
  { id: "tiktok", name: "تيك توك", icon: "🎵", desc: "مستوقى من TikTok Shop", preview: "from-gray-900 via-pink-600 to-cyan-400", tag: "🔥 ترند" },
  { id: "whatsapp", name: "واتساب", icon: "💬", desc: "للبيع عبر واتساب", preview: "from-green-500 to-green-700", tag: "شائع" },
  { id: "countdown", name: "عد تنازلي", icon: "⏳", desc: "عروض بوقت محدد", preview: "from-rose-600 to-pink-700", tag: "مبيعات" },
  { id: "minimal_luxury", name: "Hermès فاخر", icon: "🤍", desc: "أناقة فرنسية بتصميم سيرف", preview: "from-[#F5F1E8] via-[#FAFAF7] to-[#E8E1D1]", tag: "✨ AI Premium" },
  { id: "dark_futuristic", name: "Linear داكن", icon: "🌌", desc: "زجاجي عصري بإضاءة بنفسجية", preview: "from-[#06060F] via-[#1F1B3D] to-[#06060F]", tag: "✨ AI Premium" },
  { id: "soft_beauty", name: "Glossier جمال", icon: "🌸", desc: "وردي ناعم بلمسة فرنسية", preview: "from-[#F5E1DD] via-[#FDF8F4] to-[#E8B4B8]", tag: "✨ AI Premium" },
  { id: "viral_tiktok", name: "Neobrutalism", icon: "⚡", desc: "ألوان جريئة بحدود عريضة", preview: "from-[#FFE600] via-[#FFF9E5] to-[#FF3D7F]", tag: "✨ AI Premium" },
  { id: "organic_nature", name: "Aesop طبيعي", icon: "🌿", desc: "ألوان ترابية بأسلوب راقي", preview: "from-[#E8DFC9] via-[#F7F3EC] to-[#2A3A2A]", tag: "✨ AI Premium" },
  { id: "bold_sales", name: "Athletic مبيعات", icon: "💎", desc: "داكن قوي للتحويلات العالية", preview: "from-[#0F0F10] via-[#DC2626] to-[#FBBF24]", tag: "✨ AI Premium" },
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

const LandingPageBuilder = ({ initialProductToEdit }: { initialProductToEdit?: any }) => {
  const { toast } = useToast();
  const [pages, setPages] = useState<LandingPageConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<LandingPageConfig | null>(null);
  const deferredEditingPage = useDeferredValue(editingPage);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("mobile");
  const [showConfig, setShowConfig] = useState(true);
  const userStr = localStorage.getItem("affiliate_user");
  const affiliateUser = userStr ? JSON.parse(userStr) : null;
  const isAdmin = affiliateUser?.role?.toUpperCase() === "ADMIN";
  const defaultStoreName = affiliateUser?.storeName || "متجري";
  const [activeDesignTab, setActiveDesignTab] = useState<"magic" | "content" | "template" | "colors" | "sections">(isAdmin ? "magic" : "content");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const lastHandledProductId = useRef<string | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState<string | null>(null);

  const handleEdit = async (page: LandingPageConfig) => {
    const def = defaultNewPage();

    // If it's a local new page (lp- prefix), just set it
    if (page?.id?.startsWith("lp-")) {
      // Hydrate local page with defaults so no array is ever undefined
      const hydratedLocal: LandingPageConfig = {
        ...def,
        ...page,
        sections: Array.isArray(page.sections) ? page.sections : def.sections,
        features: Array.isArray(page.features) ? page.features : def.features,
        socialProof: Array.isArray(page.socialProof) ? page.socialProof : def.socialProof,
        faqItems: Array.isArray(page.faqItems) ? page.faqItems : def.faqItems,
        trustBadges: Array.isArray(page.trustBadges) ? page.trustBadges : def.trustBadges,
        galleryImages: Array.isArray(page.galleryImages) ? page.galleryImages : def.galleryImages,
        availableColors: Array.isArray(page.availableColors) ? page.availableColors : def.availableColors,
        availableSizes: Array.isArray(page.availableSizes) ? page.availableSizes : def.availableSizes,
      };
      setEditingPage(hydratedLocal);
      return;
    }

    // If it's already "complete" (has heroTitle, which only exists in full config), edit it
    if (page.heroTitle) {
      // Still hydrate to ensure all arrays exist
      const hydratedPage: LandingPageConfig = {
        ...def,
        ...page,
        sections: Array.isArray(page.sections) ? page.sections : def.sections,
        features: Array.isArray(page.features) ? page.features : def.features,
        socialProof: Array.isArray(page.socialProof) ? page.socialProof : def.socialProof,
        faqItems: Array.isArray(page.faqItems) ? page.faqItems : def.faqItems,
        trustBadges: Array.isArray(page.trustBadges) ? page.trustBadges : def.trustBadges,
        galleryImages: Array.isArray(page.galleryImages) ? page.galleryImages : def.galleryImages,
        availableColors: Array.isArray(page.availableColors) ? page.availableColors : def.availableColors,
        availableSizes: Array.isArray(page.availableSizes) ? page.availableSizes : def.availableSizes,
      };
      setEditingPage(hydratedPage);
      return;
    }

    // Otherwise, fetch full details from backend
    setIsFetchingDetails(page.id);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/store/pages/${page.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.data) {
        const raw = json.data.pageConfig || json.data;
        // Hydrate: merge server data on top of defaults to guarantee all array fields exist
        const fullPage: LandingPageConfig = {
          ...def,
          ...raw,
          id: json.data.id,
          productId: json.data.productId,
          ownerId: json.data.ownerId,
          ownerName: json.data.owner?.name || json.data.owner?.storeName || "",
          status: json.data.status,
          views: json.data.views,
          conversions: json.data.conversions,
          sections: Array.isArray(raw.sections) ? raw.sections : def.sections,
          features: Array.isArray(raw.features) ? raw.features : def.features,
          socialProof: Array.isArray(raw.socialProof) ? raw.socialProof : def.socialProof,
          faqItems: Array.isArray(raw.faqItems) ? raw.faqItems : def.faqItems,
          trustBadges: Array.isArray(raw.trustBadges) ? raw.trustBadges : def.trustBadges,
          galleryImages: Array.isArray(raw.galleryImages) ? raw.galleryImages : def.galleryImages,
          availableColors: Array.isArray(raw.availableColors) ? raw.availableColors : def.availableColors,
          availableSizes: Array.isArray(raw.availableSizes) ? raw.availableSizes : def.availableSizes,
        };
        // Update the list and set as editing
        setPages(pages.map(p => p.id === page.id ? fullPage : p));
        setEditingPage(fullPage);
      } else {
        throw new Error("Failed to fetch full data");
      }
    } catch (err) {
      console.error("Failed to fetch full page details", err);
      toast({ variant: "destructive", title: "فشل تحميل تفاصيل الصفحة" });
    } finally {
      setIsFetchingDetails(null);
    }
  };

  // Fetch pages from backend on mount
  useEffect(() => {
    const fetchPages = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // Admin sees ALL pages, affiliates see only their own
        const endpoint = isAdmin ? `${API_BASE_URL}/store/pages/all` : `${API_BASE_URL}/store/pages`;
        const response = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await response.json();
        if (response.ok && json.data) {
          // Backend now returns a summary (no heavy pageConfig) for the list
          const mappedPages = json.data.map((p: any) => ({
            ...p, // Contains id, productName, template, status, views, conversions, sections, ownerName
            // Note: pageConfig is missing here, will be fetched when editing
          }));
          setPages(mappedPages);
        }
      } catch (err) {
        console.error("Failed to fetch pages:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPages();
  }, []);

  // AI Magic State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiProgressStep, setAiProgressStep] = useState(0);
  const [uploadedAiImage, setUploadedAiImage] = useState<string | null>(null);
  const [aiContextInput, setAiContextInput] = useState("");

  // Persist pages (In-Memory Only for smooth editing, until explicit Save)
  const savePagesLocally = (newPages: LandingPageConfig[]) => {
    setPages(newPages);
  };

  const saveToDatabase = async (pageToSave: LandingPageConfig) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ variant: "destructive", title: "غير مصرح", description: "يرجى تسجيل الدخول أولاً" });
      return;
    }

    try {
      // If the ID starts with "lp-", it's a temporary local ID, so we use POST
      const isNew = pageToSave.id.startsWith("lp-");
      const url = isNew
        ? `${API_BASE_URL}/store/page`
        : `${API_BASE_URL}/store/page/${pageToSave.id}`;

      const method = isNew ? "POST" : "PUT";

      // Prepare config by removing backend metadata
      const { id, productId, status, views, conversions, ...configData } = pageToSave;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          configData,
          status
        })
      });

      const json = await response.json();
      if (response.ok) {
        // Update local state with real backend ID if it was new
        if (isNew && json.data) {
          const updatedPage = { ...pageToSave, id: json.data.id };
          setPages(prev => prev.map(p => p.id === pageToSave.id ? updatedPage : p));
          setEditingPage(updatedPage);
        }
        toast({ title: "💾 تم الحفظ", description: "تم حفظ التغييرات في قاعدة البيانات بنجاح" });
      } else {
        throw new Error(json.error || "Failed to save");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast({ variant: "destructive", title: "خطأ في الحفظ", description: "تعذر حفظ البيانات في السيرفر" });
    }
  };

  useEffect(() => {
    if (initialProductToEdit && !isLoading && lastHandledProductId.current !== initialProductToEdit.id) {
      lastHandledProductId.current = initialProductToEdit.id;
      // Check if we already have a landing page for this product
      const existingPage = pages.find((p) => p.productId === initialProductToEdit.id);
      if (existingPage) {
        // Fetch full page details from backend to ensure we don't overwrite AI config with summary data
        const fetchFullPage = async () => {
          setIsFetchingDetails(existingPage.id);
          try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/store/pages/${existingPage.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (res.ok && json.data) {
              const raw = json.data.pageConfig || json.data;
              const def = defaultNewPage();
              const fullPage: LandingPageConfig = {
                ...def,
                ...raw,
                id: json.data.id,
                productId: json.data.productId,
                ownerId: json.data.ownerId,
                sections: Array.isArray(raw.sections) ? raw.sections : def.sections,
                features: Array.isArray(raw.features) ? raw.features : def.features,
                socialProof: Array.isArray(raw.socialProof) ? raw.socialProof : def.socialProof,
                faqItems: Array.isArray(raw.faqItems) ? raw.faqItems : def.faqItems,
                trustBadges: Array.isArray(raw.trustBadges) ? raw.trustBadges : def.trustBadges,
                galleryImages: Array.isArray(raw.galleryImages) ? raw.galleryImages : def.galleryImages,
                availableColors: Array.isArray(raw.availableColors) ? raw.availableColors : def.availableColors,
                availableSizes: Array.isArray(raw.availableSizes) ? raw.availableSizes : def.availableSizes,
              };

              // Sync with the latest product data (in case admin updated prices, images, or variants)
              const updatedPage = {
                ...fullPage,
                productName: initialProductToEdit.name || fullPage.productName,
                price: initialProductToEdit.price || fullPage.price,
                originalPrice: initialProductToEdit.originalPrice || fullPage.originalPrice,
                heroImage: initialProductToEdit.image || fullPage.heroImage,
                galleryImages: initialProductToEdit.images && initialProductToEdit.images.length > 0 
                  ? initialProductToEdit.images 
                  : (initialProductToEdit.image ? [initialProductToEdit.image] : fullPage.galleryImages),
                category: initialProductToEdit.category || fullPage.category,
                heroSubtitle: initialProductToEdit.description || fullPage.heroSubtitle,
                // Sync variants
                availableColors: initialProductToEdit.hasColors ? (initialProductToEdit.availableColors || []) : [],
                availableSizes: initialProductToEdit.hasSizes ? (initialProductToEdit.availableSizes || []) : [],
                showFreeShipping: initialProductToEdit.showFreeShipping !== undefined ? initialProductToEdit.showFreeShipping : fullPage.showFreeShipping,
                beforeAfterImages: initialProductToEdit.hasBeforeAfter ? { before: initialProductToEdit.beforeImage, after: initialProductToEdit.afterImage } : fullPage.beforeAfterImages,
                sections: initialProductToEdit.hasBeforeAfter && !fullPage.sections.includes("before-after") 
                  ? [...fullPage.sections.slice(0, 4), "before-after", ...fullPage.sections.slice(4)]
                  : fullPage.sections
              };
              setEditingPage(updatedPage);
              setActiveDesignTab("content");
            }
          } catch (err) {
            console.error("Failed to fetch full page for editing", err);
          } finally {
            setIsFetchingDetails(null);
          }
        };
        fetchFullPage();
      } else {
        // Fetch admin default template if it exists
        const fetchAdminTemplate = async () => {
          try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/store/pages/admin-default/${initialProductToEdit.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            
            let newPage: LandingPageConfig;

            if (res.ok && json.data) {
              const adminConfig = json.data.pageConfig || json.data;
              newPage = {
                ...defaultNewPage(),
                ...adminConfig,
                id: `lp-${Date.now()}`,
                productId: initialProductToEdit.id,
                ownerId: undefined, // Backend will set affiliate's ID on save
                status: "draft",
                views: 0,
                conversions: 0,
                // Ensure the affiliate's dynamic product prices are synced
                productName: initialProductToEdit.name || adminConfig.productName,
                price: initialProductToEdit.price || adminConfig.price,
                originalPrice: initialProductToEdit.originalPrice || adminConfig.originalPrice,
              };
            } else {
              // Create a new landing page specifically for this product
              newPage = {
                ...defaultNewPage(),
                id: `lp-${Date.now()}`,
                productId: initialProductToEdit.id,
                productName: initialProductToEdit.name,
                template: "original", // Default to the original/classic design as requested
                heroTitle: initialProductToEdit.name,
                heroSubtitle: initialProductToEdit.description || "أفضل جودة بأفضل سعر في السوق الجزائري",
                price: initialProductToEdit.price,
                originalPrice: initialProductToEdit.originalPrice,
                category: initialProductToEdit.category,
                heroImage: initialProductToEdit.image,
                galleryImages: initialProductToEdit.images && initialProductToEdit.images.length > 0
                  ? initialProductToEdit.images
                  : (initialProductToEdit.image ? [initialProductToEdit.image] : []),
                features: initialProductToEdit.features && initialProductToEdit.features.length > 0
                  ? initialProductToEdit.features
                  : ["جودة عالية مضمونة", "توصيل سريع لكل الولايات", "الدفع عند الاستلام", "ضمان الاستبدال والاسترجاع"],
                videoUrl: initialProductToEdit.videoUrl || "",
                availableColors: initialProductToEdit.hasColors ? (initialProductToEdit.availableColors || []) : [],
                availableSizes: initialProductToEdit.hasSizes ? (initialProductToEdit.availableSizes || []) : [],
                showFreeShipping: initialProductToEdit.showFreeShipping || false,
                beforeAfterImages: initialProductToEdit.hasBeforeAfter ? { before: initialProductToEdit.beforeImage, after: initialProductToEdit.afterImage } : { before: "", after: "" },
                sections: initialProductToEdit.hasBeforeAfter 
                  ? ["hero", "urgency-bar", "before-after", "features", "gallery", "social-proof", "reviews", "shipping", "cta"]
                  : ["hero", "urgency-bar", "features", "gallery", "social-proof", "reviews", "shipping", "cta"],
                status: "draft"
              };
            }

            const newPages = [newPage, ...pages];
            savePagesLocally(newPages);
            setEditingPage(newPage);
            setActiveDesignTab("content");
          } catch (err) {
            console.error("Failed to fetch admin template:", err);
          }
        };

        fetchAdminTemplate();
      }
    }
  }, [initialProductToEdit, isLoading, pages]);

  const handleSimulatedAiGeneration = async () => {
    if (!editingPage) return;
    if (!uploadedAiImage) return;

    setIsAiGenerating(true);

    // UI Loading simulation for user experience while model thinks
    setAiProgressStep(1);

    try {
      // Step 2: Hitting our custom Gemini Route
      setAiProgressStep(2);

      const response = await fetch(`${API_BASE_URL}/store/generate-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: uploadedAiImage,
          contextText: aiContextInput
        })
      });

      if (!response.ok) throw new Error('AI Vision failed');

      const { config } = await response.json();

      setAiProgressStep(3);

      // Helper to resolve stock images from keywords
      const resolveStockImages = (keywordsObj: any) => {
        const baseUrl = "https://images.unsplash.com/photo-";
        const presets: Record<string, string> = {
          "hero": "1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000", // Generic tech/product
          "features": "1460353581641-37badd45ec65?auto=format&fit=crop&q=80&w=800", // Quality/Modern
          "testimonials": "1484860137485-951bd6ce938c?auto=format&fit=crop&q=80&w=600" // Happy people
        };

        // Dynamic search URLs
        const searchBase = "https://source.unsplash.com/featured/?";
        return [
          `${searchBase}${keywordsObj.hero || 'product'}`,
          `${searchBase}${keywordsObj.features || 'quality'}`,
          `${searchBase}${keywordsObj.testimonials || 'customer'}`
        ];
      };

      // Injecting the AI output directly into the LandingPage template
      const aiGeneratedPage: LandingPageConfig = {
        ...editingPage,
        ...config,
        heroImage: uploadedAiImage, // Keep the uploaded image as Hero
        galleryImages: resolveStockImages(config.imageKeywords || {}),
        sections: config.suggestedSections || ["hero", "urgency-bar", "features", "gallery", "social-proof", "faq", "cta"]
      };

      setEditingPage(aiGeneratedPage);
      const newPages = pages.map(p => p.id === aiGeneratedPage.id ? aiGeneratedPage : p);
      savePagesLocally(newPages);

      setIsAiGenerating(false);
      setAiProgressStep(0);
      setUploadedAiImage(null);
      setActiveDesignTab("content");
      toast({ title: "✨ سحر الـ AI مكتمل!", description: "تم بناء صفحتك وتوليد الصور وتنسيق الألوان بنجاح." });

    } catch (error) {
      console.error(error);
      setIsAiGenerating(false);
      setAiProgressStep(0);
      toast({ title: "خطأ", description: "فشلت عملية الذكاء الاصطناعي", variant: "destructive" });
    }
  };

  const createNewPage = () => {
    const newPage = defaultNewPage();
    savePagesLocally([newPage, ...pages]);
    setEditingPage(newPage);
    toast({ title: "🎨 تم الإنشاء", description: "صفحة هبوط جديدة جاهزة للتخصيص" });
  };

  const updatePage = (field: keyof LandingPageConfig, value: any) => {
    if (!editingPage) return;
    const updated = { ...editingPage, [field]: value };
    setEditingPage(updated);
    const newPages = pages.map(p => p.id === updated.id ? updated : p);
    savePagesLocally(newPages);
  };

  const applyTemplate = (tmplId: string) => {
    if (!editingPage) return;

    let updates: Partial<LandingPageConfig> = { template: tmplId };

    switch (tmplId) {
      case "original":
        updates = { ...updates, backgroundColor: "#ffffff", primaryColor: "#3b82f6", fontFamily: "cairo", shadowIntensity: "md" };
        break;
      case "modern":
        updates = { ...updates, backgroundColor: "#f8fafc", primaryColor: "#8b5cf6", fontFamily: "tajawal", shadowIntensity: "lg" };
        break;
      case "bold":
        updates = { ...updates, backgroundColor: "#fffbeb", primaryColor: "#f97316", fontFamily: "almarai", shadowIntensity: "xl", ctaStyle: "square" };
        break;
      case "minimal":
        updates = { ...updates, backgroundColor: "#ffffff", primaryColor: "#0f172a", fontFamily: "ibm-plex", shadowIntensity: "none", ctaStyle: "rounded" };
        break;
      case "dark":
        updates = { ...updates, backgroundColor: "#020617", primaryColor: "#10b981", accentColor: "#3b82f6", fontFamily: "cairo", shadowIntensity: "lg", ctaStyle: "pill" };
        break;
      case "luxury":
        updates = { ...updates, backgroundColor: "#1e1b4b", primaryColor: "#eab308", accentColor: "#f59e0b", fontFamily: "readex-pro", shadowIntensity: "xl" };
        break;
      case "neon":
        updates = { ...updates, backgroundColor: "#020617", primaryColor: "#ec4899", accentColor: "#a855f7", fontFamily: "cairo", shadowIntensity: "lg" };
        break;
      case "tiktok":
        updates = { ...updates, backgroundColor: "#0f172a", primaryColor: "#ec4899", accentColor: "#06b6d4", heroLayout: "fullscreen" };
        break;
      case "whatsapp":
        updates = { ...updates, backgroundColor: "#eff6ff", primaryColor: "#10b981", accentColor: "#059669", ctaText: "اطلب عبر واتساب" };
        break;
    }

    const updated = { ...editingPage, ...updates };
    setEditingPage(updated as LandingPageConfig);
    const newPages = pages.map(p => p.id === updated.id ? (updated as LandingPageConfig) : p);
    savePagesLocally(newPages);
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

  const deletePage = async (id: string) => {
    const token = localStorage.getItem("token");
    if (id.startsWith("lp-")) {
      // Only local, just filter it
      setPages(pages.filter(p => p.id !== id));
      if (editingPage?.id === id) setEditingPage(null);
      toast({ title: "🗑️ تم الحذف" });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/store/page/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setPages(pages.filter(p => p.id !== id));
        if (editingPage?.id === id) setEditingPage(null);
        toast({ title: "🗑️ تم الحذف من قاعدة البيانات" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const getProductUrl = (page: LandingPageConfig) => {
    const userStr = localStorage.getItem("affiliate_user");
    const user = userStr ? JSON.parse(userStr) : null;
    if (page.productId && user?.id) {
      return `${window.location.origin}/product/${page.productId}/${user.id}`;
    }
    return `${window.location.origin}/lp/${page.id}`;
  };

  const copyLink = (page: LandingPageConfig) => {
    const link = getProductUrl(page);
    navigator.clipboard.writeText(link);
    setCopiedId(page.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "✅ تم نسخ الرابط" });
  };

  const viewPage = (page: LandingPageConfig) => {
    const link = getProductUrl(page);
    window.open(link, "_blank");
  };

  const publishPage = async (page: LandingPageConfig) => {
    const updated: LandingPageConfig = {
      ...page,
      status: "published",
    };
    const newPages = pages.map(p => p.id === updated.id ? updated : p);
    setPages(newPages);
    savePagesLocally(newPages);
    if (editingPage?.id === updated.id) setEditingPage(updated);
    await saveToDatabase(updated);
  };

  const cardAnim = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  });

  const isDark = (bg: string | undefined) => !!(bg?.startsWith("#0") || bg?.startsWith("#1") || bg?.startsWith("#2") || bg === "#020617");

  const renderPreview = (isMobile: boolean) => {
    const p = deferredEditingPage;
    if (!p) return null;

    const tc = isDark(p.backgroundColor) ? "#ffffff" : "#0f172a";
    const stc = isDark(p.backgroundColor) ? "#94a3b8" : "#64748b";
    const br = `${p.borderRadius}px`;

    // Handle styling for different templates
    if (p.template === "dark") {
      p.backgroundColor = "#0f172a";
      p.primaryColor = p.primaryColor || "#38bdf8";
    }
    if (p.template === "bold") {
      p.borderRadius = 0;
      p.fontFamily = "cairo";
    }
    if (p.template === "minimal") {
      p.backgroundColor = "#ffffff";
      p.shadowIntensity = "none";
    }

    const discountPercent = p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

    const shadowMap = {
      none: "shadow-none",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
      xl: "shadow-xl",
    };

    const OrderForm = () => (
      <div className="bg-card border-2 rounded-2xl p-6 shadow-xl space-y-6" dir="rtl" style={{ borderColor: p.primaryColor, borderRadius: br }}>
        <h3 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" style={{ color: p.primaryColor }} /> اطلب الآن
        </h3>

        <div className="space-y-4">
          {p.availableColors && p.availableColors.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold opacity-70">اختر اللون *</Label>
              <div className="flex flex-wrap gap-1.5">
                {(p.availableColors || []).map(color => (
                  <div key={color} className="px-3 py-1 rounded-lg border text-[10px] font-bold opacity-50 bg-muted/20">
                    {color}
                  </div>
                ))}
              </div>
            </div>
          )}

          {p.availableSizes && p.availableSizes.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold opacity-70">اختر المقاس *</Label>
              <div className="flex flex-wrap gap-1.5">
                {(p.availableSizes || []).map(size => (
                  <div key={size} className="min-w-[32px] h-8 rounded-lg border flex items-center justify-center text-[10px] font-bold opacity-50 bg-muted/20">
                    {size}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">

            <Label className="text-[11px] font-bold opacity-70">الاسم الكامل *</Label>
            <div className="h-10 rounded-xl border px-3 flex items-center text-xs bg-muted/20" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0" }}>
              أدخل اسمك الكامل
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold opacity-70">رقم الهاتف *</Label>
            <div className="h-10 rounded-xl border px-3 flex items-center text-xs bg-muted/20" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0" }}>
              07XXXXXXXX
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold opacity-70">الولاية *</Label>
              <div className="h-10 rounded-xl border px-3 flex items-center justify-between text-xs bg-muted/20" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0" }}>
                اختر الولاية <ChevronDown className="w-3 h-3 opacity-40" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold opacity-70">البلدية *</Label>
              <div className="h-10 rounded-xl border px-3 flex items-center justify-between text-xs bg-muted/20" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0" }}>
                اختر البلدية <ChevronDown className="w-3 h-3 opacity-40" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold opacity-70">العنوان بالتفصيل *</Label>
            <div className="h-10 rounded-xl border px-3 flex items-center text-xs bg-muted/20" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0" }}>
              البلدية، الحي، الشارع...
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold opacity-70">نوع التوصيل</Label>
            <div className="flex bg-muted/30 p-1 rounded-xl h-10">
              <div className="flex-1 flex items-center justify-center rounded-lg text-[10px] font-bold bg-background shadow-sm">للمنزل</div>
              <div className="flex-1 flex items-center justify-center rounded-lg text-[10px] font-bold opacity-40">للمكتب</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <Label className="text-[11px] font-bold opacity-70">الكمية</Label>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-bold opacity-40">-</div>
              <span className="w-6 text-center text-sm font-black">1</span>
              <div className="w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-bold opacity-40">+</div>
            </div>
          </div>
        </div>

        {p.hasMarketingOffers && p.marketingOffers && p.marketingOffers.length > 0 && (
          <div className="space-y-3 pt-2 text-right">
            <label className="text-[11px] font-bold opacity-70 flex items-center gap-2">
              <Gift className="w-4 h-4" style={{ color: p.primaryColor }} /> العروض التسويقية
            </label>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between p-2 rounded-xl border-2 border-primary bg-primary/5 ring-1 ring-primary/20">
                <div className="space-y-1">
                  <p className="font-bold text-[10px] flex items-center gap-1">
                    <Check className="w-3 h-3" style={{ color: p.primaryColor }} />
                    قطعة واحدة (عرض عادي)
                  </p>
                </div>
                <p className="font-black text-xs" style={{ color: p.primaryColor }}>{p.price.toLocaleString()} دج</p>
              </div>
              {p.marketingOffers.map((offer: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl border-2 border-muted bg-card">
                  <div className="space-y-1">
                    <p className="font-bold text-[10px] flex items-center gap-1">
                      {offer.name}
                    </p>
                  </div>
                  <p className="font-black text-xs" style={{ color: p.primaryColor }}>{offer.price.toLocaleString()} دج</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-muted/30 rounded-2xl p-4 space-y-2.5">
          <div className="flex justify-between text-xs">
            <span className="opacity-60">السعر</span>
            <span className="font-bold">{p.price.toLocaleString()} دج</span>
          </div>
          <div className="flex justify-between text-xs text-emerald-600 font-bold">
            <span>التوفير</span>
            <span>-{(p.originalPrice - p.price).toLocaleString()} دج</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="opacity-60">التوصيل</span>
            <span className="font-bold text-primary">{p.showFreeShipping ? "مجاني ✅" : "اختر الولاية"}</span>
          </div>
          <div className="border-t border-border/30 pt-2.5 flex justify-between font-black text-base">
            <span>المجموع</span>
            <span style={{ color: p.primaryColor }}>{p.price.toLocaleString()} دج</span>
          </div>
        </div>

        <button
          className={`w-full py-4 text-sm font-black text-white shadow-xl transition-transform hover:scale-[1.02] ${p.ctaAnimation === "pulse" ? "animate-pulse" : ""
            } ${p.ctaStyle === "pill" ? "rounded-full" : p.ctaStyle === "rounded" ? "rounded-2xl" : "rounded-none"}`}
          style={{ backgroundColor: p.primaryColor }}
        >
          {p.ctaText} — {p.price.toLocaleString()} دج
        </button>
      </div>
    );

    if (p.template === "original") {
      return (
        <div className="h-full overflow-y-auto scrollbar-hide flex flex-col" style={{ backgroundColor: p.backgroundColor, fontFamily: p.fontFamily, color: tc }}>
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-3 h-10 border-b bg-card/80 backdrop-blur-md">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-white" style={{ backgroundColor: p.logo ? "#fff" : p.primaryColor }}>
                {p.logo ? (
                  <img src={p.logo} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <ShoppingCart className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="text-[10px] font-bold truncate max-w-[150px]">{p.productName || defaultStoreName}</span>
            </div>

            <button className="text-[9px] font-bold px-4 py-1.5 rounded-full text-white shadow-lg" style={{ backgroundColor: p.primaryColor }}>
              اطلب الآن
            </button>
          </div>

          <div className="p-4 space-y-8">
            <div className={`${!isMobile ? "grid grid-cols-2 gap-10 items-start" : "space-y-6"}`}>
              {/* Left Side: Media & Features */}
              <div className="space-y-6">
                <div className={`relative aspect-square overflow-hidden bg-muted ${shadowMap[p.shadowIntensity]}`} style={{ borderRadius: br }}>
                  {p.heroImage ? (
                    <img src={p.heroImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-1">
                      <Image className="w-8 h-8 opacity-20" />
                      <span className="text-[8px]">صورة المنتج</span>
                    </div>
                  )}
                  {discountPercent > 0 && (
                    <div className="absolute top-4 left-4 bg-destructive text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg">
                      خصم {discountPercent}%
                    </div>
                  )}
                </div>

                {(p.sections || []).includes("features") && (
                  <div className="grid grid-cols-2 gap-3" dir="rtl">
                    {(p.features || []).slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-muted/30 border border-border/50 rounded-xl">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${p.primaryColor}15` }}>
                          <Check className="w-3.5 h-3.5" style={{ color: p.primaryColor }} />
                        </div>
                        <span className="text-[10px] font-bold leading-tight">{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Info & Form */}
              <div className="space-y-6">
                <div dir="rtl">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md" style={{ backgroundColor: `${p.primaryColor}15`, color: p.primaryColor }}>{p.category}</span>
                  <h1 className="text-2xl sm:text-3xl font-black mt-3 leading-tight">{p.heroTitle}</h1>
                  <p className="text-xs sm:text-sm mt-3 leading-relaxed opacity-70">{p.heroSubtitle}</p>
                </div>

                {/* Pricing Box */}
                <div className="p-6 rounded-2xl border flex flex-col gap-2 shadow-sm" dir="rtl" style={{ background: `linear-gradient(135deg, ${p.primaryColor}08, ${p.accentColor}08)`, borderColor: `${p.primaryColor}20` }}>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-black" style={{ color: p.primaryColor }}>{p.price.toLocaleString()} دج</span>
                    {p.originalPrice > p.price && (
                      <span className="text-base line-through opacity-40">{p.originalPrice.toLocaleString()} دج</span>
                    )}
                  </div>
                  {p.originalPrice > p.price && (
                    <p className="text-xs font-bold" style={{ color: p.accentColor }}>
                      وفّر {(p.originalPrice - p.price).toLocaleString()} دج
                    </p>
                  )}
                </div>

                {/* Trust Badges Grid */}
                {(p.sections || []).includes("trust-badges") && (
                  <div className="grid grid-cols-2 gap-3" dir="rtl">
                    {[
                      { icon: Truck, t: p.showFreeShipping ? "توصيل مجاني" : "توصيل سريع", s: "لكل الولايات" },
                      { icon: Shield, t: "ضمان الجودة", s: "منتجات أصلية" },
                      { icon: Clock, t: p.showFreeShipping ? "توصيل مجاني" : "توصيل سريع", s: "3-5 أيام" },
                      { icon: Phone, t: "دعم متواصل", s: "24/7" },
                    ].map((b, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-card border border-border/50 rounded-xl shadow-sm">
                        <b.icon className="w-8 h-8 shrink-0 opacity-80" style={{ color: p.primaryColor }} />
                        <div>
                          <p className="text-[10px] font-bold leading-none">{b.t}</p>
                          <p className="text-[8px] opacity-60 mt-1">{b.s}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <OrderForm />

                {/* Additional Sections for Original Template */}
                {(p.sections || []).includes("video") && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold border-r-4 border-primary pr-3 mt-4">فيديو المنتج</h3>
                    <div className="aspect-video bg-muted rounded-xl flex items-center justify-center overflow-hidden border">
                      {p.videoUrl ? (
                        <div className="text-[8px] opacity-40">Video: {p.videoUrl}</div>
                      ) : (
                        <Play className="w-6 h-6 opacity-20" />
                      )}
                    </div>
                  </div>
                )}

                {(p.sections || []).includes("reviews") && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold border-r-4 border-primary pr-3 mt-4">آراء العملاء</h3>
                    <div className="space-y-2">
                      {(p.socialProof || []).slice(0, 2).map((r, i) => (
                        <div key={i} className="p-3 bg-muted/20 border border-border/50 rounded-xl">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold">{r.name}</span>
                            <div className="flex gap-0.5">{"⭐".repeat(r.rating)}</div>
                          </div>
                          <p className="text-[9px] opacity-70">{r.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(p.sections || []).includes("faq") && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold border-r-4 border-primary pr-3 mt-4">الأسئلة الشائعة</h3>
                    <div className="space-y-2">
                      {(p.faqItems || []).slice(0, 2).map((f, i) => (
                        <div key={i} className="p-3 border border-border/50 rounded-xl">
                          <p className="text-[10px] font-bold">{f.q}</p>
                          <p className="text-[9px] opacity-60 mt-1">{f.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(p.sections || []).includes("shipping") && (
                  <div className="p-4 bg-muted/20 rounded-xl border border-dashed mt-4">
                    <h3 className="text-[10px] font-bold flex items-center gap-2 mb-2">
                      <Truck className="w-3 h-3" /> معلومات الشحن
                    </h3>
                    <p className="text-[9px] opacity-70">توصيل مجاني لجميع الولايات، الدفع عند الاستلام</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full overflow-y-auto scrollbar-hide" style={{ backgroundColor: p.backgroundColor, fontFamily: p.fontFamily, color: tc }}>
        {/* Urgency Bar */}
        {(p.sections || []).includes("urgency-bar") && (
          <div className="py-2.5 px-4 text-center text-xs font-bold text-white" style={{ backgroundColor: p.primaryColor }}>
            <span className="animate-pulse">🔥</span> {p.urgencyText} <span className="animate-pulse">🔥</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md overflow-hidden bg-white" style={{ backgroundColor: p.logo ? "#fff" : p.primaryColor }}>
              {p.logo ? (
                <img src={p.logo} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <ShoppingCart className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="text-xs font-bold">{p.productName || defaultStoreName}</span>
          </div>

          <button className="text-[10px] font-bold px-3 py-1.5 rounded-full text-white shadow-sm" style={{ backgroundColor: p.primaryColor }}>
            {p.ctaText}
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-8">
          {/* Hero Section */}
          {(p.sections || []).includes("hero") && (
            <div className={`${!isMobile && p.heroLayout === "split" ? "grid grid-cols-2 gap-8 items-center" : "space-y-6"}`}>
              <div className={`relative overflow-hidden bg-muted shadow-lg ${p.imageStyle === "circle" ? "rounded-full aspect-square max-w-[320px] mx-auto" : p.imageStyle === "blob" ? "rounded-[30%_70%_70%_30%/30%_30%_70%_70%]" : p.imageStyle === "sharp" ? "" : ""}`}
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
                  <div className="absolute top-4 left-4 bg-destructive text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg">
                    خصم {discountPercent}%
                  </div>
                )}
              </div>

              <div className={`space-y-4 ${!isMobile && p.heroLayout === "split" ? "" : "text-center"}`} dir="rtl">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-primary/10" style={{ color: p.primaryColor }}>{p.category}</span>
                <h1 className="text-2xl sm:text-3xl font-black leading-tight">{p.heroTitle}</h1>
                <p className="text-sm leading-relaxed opacity-70">{p.heroSubtitle}</p>

                {/* Price Box */}
                <div className="p-4 rounded-2xl inline-flex flex-col gap-1 border shadow-sm" style={{ background: `linear-gradient(135deg, ${p.primaryColor}08, ${p.accentColor}08)`, borderColor: `${p.primaryColor}20`, borderRadius: br }}>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-black" style={{ color: p.primaryColor }}>{p.price.toLocaleString()} دج</span>
                    <span className="text-base line-through opacity-40">{p.originalPrice.toLocaleString()} دج</span>
                  </div>
                  {p.originalPrice > p.price && (
                    <p className="text-xs font-bold text-emerald-600">
                      وفّر {(p.originalPrice - p.price).toLocaleString()} دج
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Social Proof Numbers */}
          {(p.sections || []).includes("social-proof") && (
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { icon: Users, val: "2,340+", label: "مشتري" },
                { icon: Star, val: "4.9/5", label: "تقييم" },
                { icon: ThumbsUp, val: "98%", label: "رضا" },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-xl border bg-card shadow-sm" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
                  <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: p.primaryColor }} />
                  <p className="text-sm font-black">{s.val}</p>
                  <p className="text-[9px]" style={{ color: stc }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Gallery Section */}
          {(p.sections || []).includes("gallery") && p.galleryImages && p.galleryImages.length > 0 && (
            <div className="space-y-4" dir="rtl">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Camera className="w-5 h-5" style={{ color: p.primaryColor }} /> صور المنتج
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {(p.galleryImages || []).map((img, i) => (
                  <div key={i} className="aspect-square overflow-hidden bg-muted rounded-2xl shadow-sm" style={{ borderRadius: br }}>
                    <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {(p.sections || []).includes("features") && (
            <div className="space-y-4" dir="rtl">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Star className="w-5 h-5" style={{ color: p.primaryColor }} /> لماذا هذا المنتج؟
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {(p.features || []).map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3.5 border rounded-2xl bg-card shadow-sm" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${p.primaryColor}15` }}>
                      <Check className="w-4 h-4" style={{ color: p.primaryColor }} />
                    </div>
                    <span className="text-[11px] font-bold leading-tight">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video */}
          {(p.sections || []).includes("video") && (
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted flex items-center justify-center shadow-lg" style={{ borderRadius: br }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl" style={{ backgroundColor: p.primaryColor }}>
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </div>
              <p className="absolute bottom-4 text-xs font-bold text-white bg-black/20 backdrop-blur-md px-3 py-1 rounded-full">شاهد الفيديو التوضيحي</p>
            </div>
          )}

          {/* Reviews */}
          {(p.sections || []).includes("reviews") && (
            <div className="space-y-4" dir="rtl">
              <h3 className="text-base font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" style={{ color: p.primaryColor }} /> آراء العملاء
              </h3>
              {(p.socialProof || []).map((review, i) => (
                <div key={i} className="p-4 border rounded-2xl bg-card shadow-sm space-y-3" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md" style={{ backgroundColor: p.primaryColor }}>
                        {review.name[0]}
                      </div>
                      <span className="text-sm font-bold">{review.name}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed opacity-80">{review.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Shipping Info */}
          {(p.sections || []).includes("shipping") && (
            <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-4" dir="rtl" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Truck className="w-5 h-5" style={{ color: p.primaryColor }} /> معلومات التوصيل
              </h3>
              <div className="grid gap-3">
                {[
                  { icon: Truck, text: p.showFreeShipping ? "توصيل مجاني لكل الولايات" : "توصيل سريع لكل الولايات" },
                  { icon: Clock, text: p.showFreeShipping ? "التوصيل مجاني" : "التوصيل خلال 3-5 أيام" },
                  { icon: ShoppingCart, text: "الدفع عند الاستلام COD" },
                  { icon: Phone, text: "دعم متواصل 24/7" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 opacity-60" style={{ color: p.primaryColor }} />
                    <span className="text-xs font-bold">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Form */}
          {(p.sections || []).includes("cta") && (
            <OrderForm />
          )}

          {/* Trust Badges Footer */}
          {(p.sections || []).includes("trust-badges") && (
            <div className="grid grid-cols-2 gap-3 pb-8">
              {(p.trustBadges || []).slice(0, 4).map((badge, i) => {
                const icons = [Shield, Truck, Award, Check];
                const Icon = icons[i % icons.length];
                return (
                  <div key={i} className="flex items-center gap-2.5 p-3.5 border rounded-2xl bg-card" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
                    <Icon className="w-4 h-4 shrink-0" style={{ color: p.primaryColor }} />
                    <span className="text-[10px] font-bold">{badge}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };
  const previewContentDesktopOrMobile = useMemo(() => {
    return renderPreview(previewDevice === "mobile");
  }, [deferredEditingPage, previewDevice]);

  const previewContentFullscreen = useMemo(() => {
    return renderPreview(true);
  }, [deferredEditingPage]);

  if (editingPage) {
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
            <Button variant="outline" size="sm" onClick={() => viewPage(editingPage)} className="rounded-xl gap-1.5 hidden sm:flex">
              <ExternalLink className="w-4 h-4" /> معاينة
            </Button>
            <Button size="sm" onClick={() => publishPage(editingPage)} className="rounded-xl gap-1.5 bg-gradient-to-l from-primary to-primary/90 shadow-md">
              <Zap className="w-4 h-4" /> <span className="hidden sm:inline">حفظ ونشر</span><span className="sm:hidden">نشر</span>
            </Button>
            <Button
              variant={showConfig ? "secondary" : "default"}
              size="sm"
              onClick={() => setShowConfig(!showConfig)}
              className="rounded-xl gap-1.5"
            >
              {showConfig ? <EyeOff className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {showConfig ? "إخفاء الشريط" : "تعديل"}
            </Button>
          </div>
        </div>

        <div className={`flex flex-col lg:flex-row flex-1 ${showConfig ? "overflow-y-auto" : "overflow-hidden"} lg:overflow-hidden`}>
          {/* Live Preview */}
          <div className={`flex-1 bg-muted/30 flex items-center justify-center p-4 lg:p-8 min-h-[600px] lg:min-h-0 order-2 lg:order-1 overflow-y-auto scrollbar-hide ${!showConfig ? "flex" : "hidden lg:flex"}`}>
            <div className={`bg-background shadow-2xl rounded-[2.5rem] border-[8px] border-card overflow-hidden transition-all duration-500 origin-center ${previewDevice === "mobile" ? "w-[375px] h-[750px] max-h-[95%]" : "w-full max-w-5xl h-[95%]"
              }`}>
              {previewContentDesktopOrMobile}
            </div>
          </div>

          <div className={`w-full lg:w-[420px] border-b lg:border-b-0 lg:border-l border-border bg-card flex flex-col shrink-0 order-1 lg:order-2 ${showConfig ? "flex" : "hidden"}`}>
            {/* Tabs */}
            <div className="p-3 border-b border-border">
              <div className="flex bg-muted rounded-xl p-0.5 gap-0.5">
                {([
                  ...(isAdmin ? [{ id: "magic" as const, label: "سحر الـ AI", icon: Sparkles }] : []),
                  { id: "content" as const, label: "المحتوى", icon: Type },
                  { id: "template" as const, label: "القوالب", icon: LayoutTemplate },
                  { id: "colors" as const, label: "الألوان", icon: Palette },
                  { id: "sections" as const, label: "الأقسام", icon: Layers },
                ]).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDesignTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-medium transition-all ${activeDesignTab === tab.id ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <tab.icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* ===== MAGIC AI TAB ===== */}
              {activeDesignTab === "magic" && (
                <div className="space-y-6">
                  <div className="text-center space-y-2 mt-4 mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary/10 text-primary mb-2 shadow-inner">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                      التصميم بالذكاء الاصطناعي
                    </h2>
                    <p className="text-sm text-muted-foreground">صمم صفحة هبوط احترافية في ثوانٍ</p>
                  </div>

                  {!isAiGenerating && aiProgressStep === 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-bold">1. سياق المنتج (اختياري)</Label>
                        <Textarea
                          value={aiContextInput}
                          onChange={(e) => setAiContextInput(e.target.value)}
                          placeholder="مثال: ساعة ذكية مقاومة للماء للرياضيين بسعر تنافسي..."
                          className="min-h-[80px] rounded-2xl bg-muted/30 border-primary/20 text-sm focus-visible:ring-primary/40"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-bold">2. صورة المنتج</Label>
                        <div className="border-2 border-dashed border-primary/30 rounded-3xl p-8 text-center hover:bg-primary/5 transition-colors group cursor-pointer relative overflow-hidden" onClick={(e) => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e: any) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setUploadedAiImage(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}>
                          {uploadedAiImage ? (
                            <img src={uploadedAiImage} alt="Product" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />
                          ) : null}
                          <div className="relative z-10 flex flex-col items-center">
                            <Upload className="w-10 h-10 text-primary/50 group-hover:text-primary transition-colors mb-4 group-hover:scale-110 duration-300" />
                            <p className="text-sm font-bold text-foreground">التقط أو ارفع صورة للمنتج</p>
                            <p className="text-[10px] text-muted-foreground mt-1">يدعم JPG, PNG بجودة عالية</p>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleSimulatedAiGeneration}
                        disabled={!uploadedAiImage}
                        className={`w-full h-14 rounded-2xl text-base font-bold shadow-xl transition-all ${uploadedAiImage ? "bg-gradient-to-l from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:scale-[1.02] active:scale-[0.98]" : "bg-muted text-muted-foreground cursor-not-allowed"
                          }`}
                      >
                        <Zap className="w-5 h-5 ml-2" />
                        توليد الصفحة
                      </Button>
                    </motion.div>
                  )}

                  {isAiGenerating && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-8">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 rounded-full border-[3px] border-dashed border-primary/30"
                        />
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-4 rounded-full border-[3px] border-dotted border-purple-500/50"
                        />
                        <motion.div
                          animate={{ scale: [0.9, 1.1, 0.9] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                        >
                          <Sparkles className="w-8 h-8 text-white" />
                        </motion.div>
                      </div>

                      <div className="space-y-4 w-full px-6">
                        <div className="flex items-center gap-3">
                          <Check className={`w-5 h-5 transition-colors ${aiProgressStep > 0 ? "text-primary" : "text-muted/30"}`} />
                          <p className={`font-bold transition-all ${aiProgressStep === 1 ? "text-foreground text-lg scale-105" : aiProgressStep > 1 ? "text-muted-foreground text-sm" : "text-muted"}`}>
                            تحليل تفاصيل ومميزات المنتج...
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className={`w-5 h-5 transition-colors ${aiProgressStep > 1 ? "text-primary" : "text-muted/30"}`} />
                          <p className={`font-bold transition-all ${aiProgressStep === 2 ? "text-foreground text-lg scale-105" : aiProgressStep > 2 ? "text-muted-foreground text-sm" : "text-muted"}`}>
                            كتابة محتوى بيعي مقنع...
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className={`w-5 h-5 transition-colors ${aiProgressStep > 2 ? "text-primary" : "text-muted/30"}`} />
                          <p className={`font-bold transition-all ${aiProgressStep === 3 ? "text-foreground text-lg scale-105" : aiProgressStep > 3 ? "text-muted-foreground text-sm" : "text-muted"}`}>
                            توليد واختيار صور احترافية للمنتج...
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Check className={`w-5 h-5 transition-colors ${aiProgressStep > 3 ? "text-primary" : "text-muted/30"}`} />
                          <p className={`font-bold transition-all ${aiProgressStep === 4 ? "text-foreground text-lg scale-105" : aiProgressStep > 4 ? "text-muted-foreground text-sm" : "text-muted"}`}>
                            تنسيق الألوان وبناء الهوية البصرية...
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ===== CONTENT TAB ===== */}
              {activeDesignTab === "content" && (
                <div className="space-y-4">

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold opacity-70">السعر (دج)</Label>
                      <Input type="number" value={editingPage.price} onChange={(e) => updatePage("price", parseInt(e.target.value) || 0)} className="rounded-xl h-8 text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold opacity-70">السعر الأصلي</Label>
                      <Input type="number" disabled={!isAdmin} value={editingPage.originalPrice} onChange={(e) => updatePage("originalPrice", parseInt(e.target.value) || 0)} className="rounded-xl h-8 text-xs" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">التصنيف</Label>
                    <Input disabled={!isAdmin} value={editingPage.category} onChange={(e) => updatePage("category", e.target.value)} className="rounded-xl h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">العنوان الرئيسي</Label>
                    <Input value={editingPage.heroTitle} onChange={(e) => updatePage("heroTitle", e.target.value)} className="rounded-xl h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">العنوان الفرعي</Label>
                    <Textarea value={editingPage.heroSubtitle} onChange={(e) => updatePage("heroSubtitle", e.target.value)} className="rounded-xl text-sm" rows={2} />
                  </div>
                  <div className="space-y-4 p-4 bg-muted/20 rounded-2xl border border-dashed border-border">
                    <Label className="text-xs font-bold opacity-70 block mb-2">صورة الواجهة (Banner)</Label>
                    <div 
                      className="relative aspect-video rounded-xl bg-background border-2 border-dashed border-primary/20 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-all group overflow-hidden"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e: any) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              updatePage("heroImage", reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                    >
                      {editingPage.heroImage ? (
                        <>
                          <img src={editingPage.heroImage} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Upload className="w-6 h-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-primary/40 group-hover:text-primary transition-colors mb-2" />
                          <span className="text-[10px] font-bold text-muted-foreground">اضغط لرفع صورة</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-muted/20 rounded-2xl border border-dashed border-border">
                    <Label className="text-xs font-bold opacity-70 block mb-2">صور المعرض (Gallery)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(editingPage.galleryImages || []).map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl bg-background border border-border group overflow-hidden">
                          <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                          <button
                            className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                            onClick={() => {
                              const newGallery = [...editingPage.galleryImages];
                              newGallery.splice(idx, 1);
                              updatePage("galleryImages", newGallery);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <div 
                        className="relative aspect-square rounded-xl bg-background border-2 border-dashed border-primary/20 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-all group"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.multiple = true;
                          input.onchange = (e: any) => {
                            const files = Array.from(e.target.files) as File[];
                            if (files.length > 0) {
                              const readers = files.map(file => {
                                return new Promise<string>((resolve) => {
                                  const reader = new FileReader();
                                  reader.onloadend = () => resolve(reader.result as string);
                                  reader.readAsDataURL(file);
                                });
                              });
                              Promise.all(readers).then(results => {
                                updatePage("galleryImages", [...(editingPage.galleryImages || []), ...results]);
                              });
                            }
                          };
                          input.click();
                        }}
                      >
                        <Upload className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors mb-1" />
                        <span className="text-[9px] font-bold text-muted-foreground text-center">اضف<br/>صورة</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-muted/30 rounded-2xl border border-border">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold opacity-70">التصنيف</Label>
                      <Input 
                        disabled={!isAdmin} 
                        value={editingPage.category} 
                        onChange={(e) => updatePage("category", e.target.value)} 
                        className="rounded-xl h-9 text-sm bg-background" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold opacity-70">العنوان الرئيسي</Label>
                      <Input 
                        value={editingPage.heroTitle} 
                        onChange={(e) => updatePage("heroTitle", e.target.value)} 
                        className="rounded-xl h-9 text-sm bg-background" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold opacity-70">الوصف (العنوان الفرعي)</Label>
                      <Textarea 
                        value={editingPage.heroSubtitle} 
                        onChange={(e) => updatePage("heroSubtitle", e.target.value)} 
                        className="rounded-xl text-sm bg-background" 
                        rows={3} 
                      />
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-muted/20 rounded-2xl border border-dashed border-border">
                    <Label className="text-xs font-bold opacity-70 block mb-2">شعار المتجر (Logo)</Label>
                    <div 
                      className="relative w-20 h-20 mx-auto rounded-xl bg-background border-2 border-dashed border-primary/20 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-all group overflow-hidden"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e: any) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              updatePage("logo", reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                    >
                      {editingPage.logo ? (
                        <>
                          <img src={editingPage.logo} alt="Logo" className="absolute inset-0 w-full h-full object-contain p-2" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Upload className="w-4 h-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors mb-1" />
                          <span className="text-[9px] font-bold text-muted-foreground">رفع شعار</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">نص زر الشراء</Label>
                    <Input value={editingPage.ctaText} onChange={(e) => updatePage("ctaText", e.target.value)} className="rounded-xl h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">نص الاستعجال</Label>
                    <Input value={editingPage.urgencyText} onChange={(e) => updatePage("urgencyText", e.target.value)} className="rounded-xl h-9 text-sm" />
                  </div>

                  {/* Free Delivery Toggle */}
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-2xl border border-primary/10">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold">توصيل مجاني</Label>
                      <p className="text-[10px] text-muted-foreground">تفعيل التوصيل المجاني لكل الولايات</p>
                    </div>
                    <Switch
                      checked={editingPage.showFreeShipping}
                      onCheckedChange={(checked) => updatePage("showFreeShipping", checked)}
                    />
                  </div>

                  {/* Before & After Images */}
                  <div className="space-y-4 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                    <Label className="text-xs font-bold flex items-center gap-2">
                      <Image className="w-4 h-4 text-amber-600" /> صور قبل وبعد
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-[10px] text-muted-foreground">صورة قبل (Before)</Label>
                        <div 
                          className="relative aspect-square rounded-xl bg-background border-2 border-dashed border-primary/20 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-all overflow-hidden group"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e: any) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  updatePage("beforeAfterImages", { ...editingPage.beforeAfterImages, before: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            };
                            input.click();
                          }}
                        >
                          {editingPage.beforeAfterImages?.before ? (
                            <img src={editingPage.beforeAfterImages.before} className="w-full h-full object-cover" />
                          ) : (
                            <Upload className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] text-muted-foreground">صورة بعد (After)</Label>
                        <div 
                          className="relative aspect-square rounded-xl bg-background border-2 border-dashed border-primary/20 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-all overflow-hidden group"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e: any) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  updatePage("beforeAfterImages", { ...editingPage.beforeAfterImages, after: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            };
                            input.click();
                          }}
                        >
                          {editingPage.beforeAfterImages?.after ? (
                            <img src={editingPage.beforeAfterImages.after} className="w-full h-full object-cover" />
                          ) : (
                            <Upload className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}

                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">المميزات</Label>
                    {(editingPage.features || []).map((feature, idx) => (
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
                    {(editingPage.trustBadges || []).map((badge, idx) => (
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
                    {(editingPage.socialProof || []).map((review, idx) => (
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
                    {(editingPage.faqItems || []).map((faq, idx) => (
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

                  {/* Variants (Colors/Sizes) */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h4 className="text-xs font-black flex items-center gap-2">
                      <Palette className="w-4 h-4 text-primary" /> خيارات المنتج (الألوان والمقاسات)
                    </h4>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold opacity-60">الألوان المتاحة</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="أضف لون..." 
                          className="rounded-xl h-9 text-xs" 
                          id="new-color-input"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                updatePage("availableColors", [...(editingPage.availableColors || []), val]);
                                e.currentTarget.value = "";
                              }
                            }
                          }}
                        />
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="h-9 px-3 rounded-xl text-[10px] font-bold"
                          onClick={() => {
                            const input = document.getElementById("new-color-input") as HTMLInputElement;
                            if (input?.value.trim()) {
                              updatePage("availableColors", [...(editingPage.availableColors || []), input.value.trim()]);
                              input.value = "";
                            }
                          }}
                        >
                          إضافة
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(editingPage.availableColors || []).map((color, idx) => (
                          <Badge key={idx} variant="secondary" className="gap-1 px-2 py-1 rounded-lg text-[10px] font-bold">
                            {color}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => updatePage("availableColors", editingPage.availableColors!.filter((_, i) => i !== idx))} />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold opacity-60">المقاسات المتاحة</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="أضف مقاس..." 
                          className="rounded-xl h-9 text-xs" 
                          id="new-size-input"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                updatePage("availableSizes", [...(editingPage.availableSizes || []), val]);
                                e.currentTarget.value = "";
                              }
                            }
                          }}
                        />
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="h-9 px-3 rounded-xl text-[10px] font-bold"
                          onClick={() => {
                            const input = document.getElementById("new-size-input") as HTMLInputElement;
                            if (input?.value.trim()) {
                              updatePage("availableSizes", [...(editingPage.availableSizes || []), input.value.trim()]);
                              input.value = "";
                            }
                          }}
                        >
                          إضافة
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(editingPage.availableSizes || []).map((size, idx) => (
                          <Badge key={idx} variant="secondary" className="gap-1 px-2 py-1 rounded-lg text-[10px] font-bold">
                            {size}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => updatePage("availableSizes", editingPage.availableSizes!.filter((_, i) => i !== idx))} />
                          </Badge>
                        ))}
                      </div>
                    </div>
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
                        onClick={() => applyTemplate(tmpl.id)}
                        className={`relative p-2.5 rounded-xl border-2 transition-all text-center space-y-1 ${editingPage.template === tmpl.id ? "border-primary bg-primary/5 shadow-md" : "border-border/50 hover:border-border hover:shadow-sm"
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
                          className={`flex-1 py-2 text-[10px] font-bold border-2 transition-all ${editingPage.ctaStyle === style ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
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
                      <div key={section.id} className="space-y-2">
                        <button
                          onClick={() => toggleSection(section.id)}
                          disabled={section.required}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-right ${isActive ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"
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

                        {isActive && section.id === "video" && (
                          <div className="p-3 border rounded-xl bg-muted/20 space-y-2 mt-2">
                            <Label className="text-[10px] font-bold">فيديو المنتج (تحميل ملف)</Label>
                            <div
                              className="relative aspect-video rounded-xl bg-background border-2 border-dashed border-primary/20 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-all overflow-hidden group"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'video/*';
                                input.onchange = (e: any) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      updatePage("videoUrl", reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                };
                                input.click();
                              }}
                            >
                              {editingPage.videoUrl ? (
                                <video src={editingPage.videoUrl} className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Upload className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors" />
                                  <span className="text-[10px] text-muted-foreground">اضغط لرفع فيديو</span>
                                </div>
                              )}
                              {editingPage.videoUrl && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Upload className="w-6 h-6 text-white" />
                                </div>
                              )}
                            </div>
                            {editingPage.videoUrl && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full h-7 text-[10px] text-destructive hover:bg-destructive/5"
                                onClick={() => updatePage("videoUrl", "")}
                              >
                                حذف الفيديو
                              </Button>
                            )}
                          </div>
                        )}

                        {isActive && section.id === "before-after" && (
                          <div className="p-3 border rounded-xl bg-muted/20 space-y-3 mt-2 grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold">صورة (قبل)</Label>
                              <div
                                className="relative aspect-square rounded-xl bg-background border-2 border-dashed border-primary/20 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-all overflow-hidden group"
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = (e: any) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        updatePage("beforeAfterImages", { ...editingPage.beforeAfterImages, before: reader.result as string });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  };
                                  input.click();
                                }}
                              >
                                {editingPage.beforeAfterImages?.before ? (
                                  <img src={editingPage.beforeAfterImages.before} className="w-full h-full object-cover" />
                                ) : (
                                  <Upload className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                                )}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold">صورة (بعد)</Label>
                              <div
                                className="relative aspect-square rounded-xl bg-background border-2 border-dashed border-primary/20 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-all overflow-hidden group"
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = (e: any) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        updatePage("beforeAfterImages", { ...editingPage.beforeAfterImages, after: reader.result as string });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  };
                                  input.click();
                                }}
                              >
                                {editingPage.beforeAfterImages?.after ? (
                                  <img src={editingPage.beforeAfterImages.after} className="w-full h-full object-cover" />
                                ) : (
                                  <Upload className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {isActive && section.id === "bundle" && (
                          <div className="p-3 border rounded-xl bg-muted/20 space-y-3 mt-2">
                            {(editingPage.bundles || []).map((bundle, idx) => (
                              <div key={bundle.id || idx} className="p-2 border rounded-lg bg-background space-y-2 relative group">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-1 left-1 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    const newBundles = [...editingPage.bundles!];
                                    newBundles.splice(idx, 1);
                                    updatePage("bundles", newBundles);
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                                <div className="grid grid-cols-[3rem_1fr] gap-2 items-center">
                                  <div
                                    className="w-12 h-12 rounded-md bg-muted border-2 border-dashed border-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-all overflow-hidden"
                                    onClick={() => {
                                      const input = document.createElement('input');
                                      input.type = 'file';
                                      input.accept = 'image/*';
                                      input.onchange = (e: any) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            const newBundles = [...editingPage.bundles!];
                                            newBundles[idx].image = reader.result as string;
                                            updatePage("bundles", newBundles);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      };
                                      input.click();
                                    }}
                                  >
                                    {bundle.image ? (
                                      <img src={bundle.image} className="w-full h-full object-cover" />
                                    ) : (
                                      <Upload className="w-3 h-3 text-primary/40" />
                                    )}
                                  </div>
                                  <div className="space-y-1.5">
                                    <Input
                                      value={bundle.name}
                                      onChange={(e) => {
                                        const newBundles = [...editingPage.bundles!];
                                        newBundles[idx].name = e.target.value;
                                        updatePage("bundles", newBundles);
                                      }}
                                      placeholder="اسم الحزمة (مثال: قطعتين)"
                                      className="h-6 text-[10px] rounded"
                                    />
                                    <div className="flex items-center gap-2">
                                      <Label className="text-[9px] shrink-0">السعر (دج):</Label>
                                      <Input
                                        type="number"
                                        value={bundle.price}
                                        onChange={(e) => {
                                          const newBundles = [...editingPage.bundles!];
                                          newBundles[idx].price = parseInt(e.target.value) || 0;
                                          updatePage("bundles", newBundles);
                                        }}
                                        className="h-6 text-[10px] rounded"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full rounded-xl border-dashed h-8 text-xs gap-1"
                              onClick={() => {
                                const newBundle: BundlePack = {
                                  id: `bundle-${Date.now()}`,
                                  name: `حزمة ${(editingPage.bundles?.length || 0) + 1}`,
                                  image: "",
                                  price: editingPage.price * ((editingPage.bundles?.length || 0) + 1)
                                };
                                updatePage("bundles", [...(editingPage.bundles || []), newBundle]);
                              }}
                            >
                              <Plus className="w-3 h-3" /> إضافة حزمة
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                <Button size="sm" className="rounded-xl h-9 text-xs gap-1.5 w-full col-span-2 lg:col-span-1 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => {
                  saveToDatabase(editingPage);
                }}>
                  <Save className="w-3.5 h-3.5" /> حفظ التغييرات
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-[420px] p-0 overflow-hidden border-none rounded-3xl" dir="rtl">
            <DialogHeader className="sr-only"><DialogTitle>معاينة</DialogTitle></DialogHeader>
            <div className="h-[90vh] max-h-[90vh] w-full overflow-y-auto">
              {previewContentFullscreen}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (isLoading || (initialProductToEdit && !editingPage)) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"
        />
        <p className="text-muted-foreground font-bold animate-pulse">
          {initialProductToEdit ? "جاري تحضير محرر صفحة الهبوط..." : "جاري تحميل صفحات الهبوط..."}
        </p>
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
                    <p className="text-white/80 text-sm">
                      {tmpl?.name || "قالب"} • {tmpl?.icon}
                      {isAdmin && (page as any).ownerName && (
                        <span className="mr-2 text-white/60">• {(page as any).ownerName}</span>
                      )}
                    </p>
                  </div>
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {tmpl?.tag && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm">{tmpl.tag}</span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${page.status === "published" ? "bg-emerald-500 text-white" : "bg-white/20 text-white backdrop-blur-sm"
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
                    {(page.sections || []).slice(0, 5).map(s => {
                      const sec = availableSections.find(a => a.id === s);
                      return sec ? (
                        <span key={s} className="text-[10px] bg-muted px-2 py-0.5 rounded-lg text-muted-foreground">{sec.name}</span>
                      ) : null;
                    })}
                    {page.sections.length > 5 && (
                      <span className="text-[10px] text-muted-foreground">+{page.sections.length - 5}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(page)} 
                      disabled={isFetchingDetails === page.id}
                      className="w-full sm:w-auto sm:flex-1 rounded-xl gap-1.5 bg-primary/5 hover:bg-primary/10 border-primary/20 font-bold"
                    >
                      {isFetchingDetails === page.id ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full" />
                      ) : (
                        <Paintbrush className="w-3.5 h-3.5" />
                      )}
                      تخصيص
                    </Button>
                    <div className="flex w-full sm:w-auto flex-1 gap-2">
                      <Button variant="outline" size="sm" onClick={() => viewPage(page)} className="flex-1 sm:flex-none rounded-xl gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => copyLink(page)} className="flex-1 sm:flex-none rounded-xl gap-1.5">
                        {copiedId === page.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => publishPage(page)} className="flex-1 sm:flex-none rounded-xl">
                        {page.status === "published" ? <Eye className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deletePage(page.id)} className="flex-1 sm:flex-none rounded-xl text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
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
          <p className="text-sm text-muted-foreground/70 mt-1">أضف منتجات إلى متجرك لتظهر هنا تلقائياً</p>
        </motion.div>
      )}
    </div>
  );
};

export default LandingPageBuilder;
