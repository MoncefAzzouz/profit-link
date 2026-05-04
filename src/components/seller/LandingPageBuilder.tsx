import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout, Palette, Type, Image, Eye, EyeOff, Edit, Save, Plus, Trash2,
  ChevronDown, Sparkles, Monitor, Smartphone,
  Copy, Check, ExternalLink, Layers, Paintbrush, Star,
  ShoppingCart, Shield, Truck, Clock, MessageSquare, Zap,
  Settings2, LayoutTemplate, Phone, X,
  Play, Users, ThumbsUp, Upload, AlertTriangle, Ratio, MousePointerClick, Megaphone,
  TrendingUp, Award, Camera, Package
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
  Dialog, DialogContent, DialogHeader, DialogTitle,
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
  { id: "classic", name: "COD كلاسيكي", icon: "📦", desc: "تصميم COD تقليدي", preview: "from-amber-500 to-yellow-600", tag: "" },
  { id: "luxury", name: "فاخر", icon: "👑", desc: "تصميم ذهبي فاخر", preview: "from-amber-600 via-yellow-500 to-amber-700", tag: "جديد" },
  { id: "neon", name: "نيون", icon: "💜", desc: "ألوان نيون متوهجة", preview: "from-purple-600 via-pink-500 to-red-500", tag: "ترند" },
  { id: "tiktok", name: "تيك توك", icon: "🎵", desc: "مستوقى من TikTok Shop", preview: "from-gray-900 via-pink-600 to-cyan-400", tag: "🔥 ترند" },
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

const LandingPageBuilder = ({ initialProductToEdit }: { initialProductToEdit?: any }) => {
  const { toast } = useToast();
  const [pages, setPages] = useState<LandingPageConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingDetails, setIsFetchingDetails] = useState<string | null>(null);
  const [editingPage, setEditingPage] = useState<LandingPageConfig | null>(null);
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

  // Fetch pages on mount
  useEffect(() => {
    const fetchPages = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const endpoint = isAdmin ? `${API_BASE_URL}/store/pages/all` : `${API_BASE_URL}/store/pages`;
        const response = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await response.json();
        if (response.ok && json.data) {
          setPages(json.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch pages:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPages();
  }, [isAdmin]);

  const handleEdit = async (page: any) => {
    if (page.id.startsWith("lp-")) {
      setEditingPage(page);
      return;
    }

    setIsFetchingDetails(page.id);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/store/page/${page.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setEditingPage(json.data);
      }
    } catch (err) {
      toast({ variant: "destructive", title: "خطأ", description: "تعذر تحميل تفاصيل الصفحة" });
    } finally {
      setIsFetchingDetails(null);
    }
  };

  // AI Magic State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiProgressStep, setAiProgressStep] = useState(0);
  const [uploadedAiImage, setUploadedAiImage] = useState<string | null>(null);
  const [aiContextInput, setAiContextInput] = useState("");

  const saveToDatabase = async (pageToSave: LandingPageConfig) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ variant: "destructive", title: "غير مصرح", description: "يرجى تسجيل الدخول أولاً" });
      return;
    }

    try {
      const isNew = pageToSave.id.startsWith("lp-");
      const url = isNew
        ? `${API_BASE_URL}/store/page`
        : `${API_BASE_URL}/store/page/${pageToSave.id}`;

      const method = isNew ? "POST" : "PUT";
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
        if (isNew && json.data) {
          const updatedPage = { ...pageToSave, id: json.data.id };
          setPages(prev => prev.map(p => p.id === pageToSave.id ? updatedPage : p));
          setEditingPage(updatedPage);
        }
        toast({ title: "💾 تم الحفظ", description: "تم حفظ التغييرات بنجاح" });
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
      const existingPage = (pages || []).find((p) => p.productId === initialProductToEdit.id);
      if (existingPage) {
        handleEdit(existingPage);
        setActiveDesignTab("content");
      } else {
        const newPage: LandingPageConfig = {
          ...defaultNewPage(),
          id: `lp-${Date.now()}`,
          productId: initialProductToEdit.id,
          productName: initialProductToEdit.name,
          template: "original",
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
          sections: ["hero", "urgency-bar", "features", "gallery", "social-proof", "reviews", "shipping", "cta"],
          status: "draft"
        };
        setPages(prev => [newPage, ...prev]);
        setEditingPage(newPage);
        setActiveDesignTab("content");
      }
    }
  }, [initialProductToEdit, isLoading, pages]);

  const handleSimulatedAiGeneration = async () => {
    if (!editingPage || !uploadedAiImage) return;
    setIsAiGenerating(true);
    setAiProgressStep(1);

    try {
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

      const resolveStockImages = (keywordsObj: any) => {
        const searchBase = "https://source.unsplash.com/featured/?";
        return [
          `${searchBase}${keywordsObj.hero || 'product'}`,
          `${searchBase}${keywordsObj.features || 'quality'}`,
          `${searchBase}${keywordsObj.testimonials || 'customer'}`
        ];
      };

      const aiGeneratedPage: LandingPageConfig = {
        ...editingPage,
        ...config,
        heroImage: uploadedAiImage,
        galleryImages: resolveStockImages(config.imageKeywords || {}),
        sections: config.suggestedSections || ["hero", "urgency-bar", "features", "gallery", "social-proof", "faq", "cta"]
      };

      setEditingPage(aiGeneratedPage);
      setPages(prev => prev.map(p => p.id === aiGeneratedPage.id ? aiGeneratedPage : p));
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

  const updatePage = (field: keyof LandingPageConfig, value: any) => {
    if (!editingPage) return;
    const updated = { ...editingPage, [field]: value };
    setEditingPage(updated);
    setPages(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const applyTemplate = (tmplId: string) => {
    if (!editingPage) return;
    let updates: Partial<LandingPageConfig> = { template: tmplId };
    switch (tmplId) {
      case "original": updates = { backgroundColor: "#ffffff", primaryColor: "#3b82f6", fontFamily: "cairo", shadowIntensity: "md" }; break;
      case "modern": updates = { backgroundColor: "#f8fafc", primaryColor: "#8b5cf6", fontFamily: "tajawal", shadowIntensity: "lg" }; break;
      case "bold": updates = { backgroundColor: "#fffbeb", primaryColor: "#f97316", fontFamily: "almarai", shadowIntensity: "xl", ctaStyle: "square" }; break;
      case "minimal": updates = { backgroundColor: "#ffffff", primaryColor: "#0f172a", fontFamily: "ibm-plex", shadowIntensity: "none", ctaStyle: "rounded" }; break;
      case "dark": updates = { backgroundColor: "#020617", primaryColor: "#10b981", accentColor: "#3b82f6", fontFamily: "cairo", shadowIntensity: "lg", ctaStyle: "pill" }; break;
      case "luxury": updates = { backgroundColor: "#1e1b4b", primaryColor: "#eab308", accentColor: "#f59e0b", fontFamily: "readex-pro", shadowIntensity: "xl" }; break;
      case "neon": updates = { backgroundColor: "#020617", primaryColor: "#ec4899", accentColor: "#a855f7", fontFamily: "cairo", shadowIntensity: "lg" }; break;
      case "tiktok": updates = { backgroundColor: "#0f172a", primaryColor: "#ec4899", accentColor: "#06b6d4", heroLayout: "fullscreen" }; break;
      case "whatsapp": updates = { backgroundColor: "#eff6ff", primaryColor: "#10b981", accentColor: "#059669", ctaText: "اطلب عبر واتساب" }; break;
    }
    const updated = { ...editingPage, ...updates };
    setEditingPage(updated as LandingPageConfig);
    setPages(prev => prev.map(p => p.id === updated.id ? (updated as LandingPageConfig) : p));
  };

  const toggleSection = (sectionId: string) => {
    if (!editingPage) return;
    const section = availableSections.find(s => s.id === sectionId);
    if (section?.required) return;
    const sections = (editingPage.sections || []).includes(sectionId)
      ? editingPage.sections.filter(s => s !== sectionId)
      : [...(editingPage.sections || []), sectionId];
    updatePage("sections", sections);
  };

  const deletePage = async (id: string) => {
    const token = localStorage.getItem("token");
    if (id.startsWith("lp-")) {
      setPages(prev => prev.filter(p => p.id !== id));
      if (editingPage?.id === id) setEditingPage(null);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/store/page/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setPages(prev => prev.filter(p => p.id !== id));
        if (editingPage?.id === id) setEditingPage(null);
        toast({ title: "🗑️ تم الحذف" });
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
    navigator.clipboard.writeText(getProductUrl(page));
    setCopiedId(page.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "✅ تم نسخ الرابط" });
  };

  const publishPage = async (page: LandingPageConfig) => {
    const updated: LandingPageConfig = { ...page, status: "published" };
    setPages(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (editingPage?.id === updated.id) setEditingPage(updated);
    await saveToDatabase(updated);
  };

  const cardAnim = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  });

  const isDark = (bg: string) => (bg || "").startsWith("#0") || (bg || "").startsWith("#1") || (bg || "").startsWith("#2") || bg === "#020617";

  const renderPreview = (isMobile: boolean) => {
    const p = editingPage;
    if (!p) return null;
    const tc = isDark(p.backgroundColor) ? "#ffffff" : "#0f172a";
    const stc = isDark(p.backgroundColor) ? "#94a3b8" : "#64748b";
    const br = `${p.borderRadius || 16}px`;
    const discountPercent = p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
    const shadowMap = { none: "shadow-none", sm: "shadow-sm", md: "shadow-md", lg: "shadow-lg", xl: "shadow-xl" };

    const OrderForm = () => (
      <div className="bg-card border-2 rounded-2xl p-6 shadow-xl space-y-6" dir="rtl" style={{ borderColor: p.primaryColor, borderRadius: br }}>
        <h3 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" style={{ color: p.primaryColor }} /> اطلب الآن
        </h3>
        <div className="space-y-4">
          {(p.availableColors || []).length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold opacity-70">اختر اللون *</Label>
              <div className="flex flex-wrap gap-1.5">
                {(p.availableColors || []).map(color => (
                  <div key={color} className="px-3 py-1 rounded-lg border text-[10px] font-bold opacity-50 bg-muted/20">{color}</div>
                ))}
              </div>
            </div>
          )}
          {(p.availableSizes || []).length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold opacity-70">اختر المقاس *</Label>
              <div className="flex flex-wrap gap-1.5">
                {(p.availableSizes || []).map(size => (
                  <div key={size} className="min-w-[32px] h-8 rounded-lg border flex items-center justify-center text-[10px] font-bold opacity-50 bg-muted/20">{size}</div>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold opacity-70">الاسم الكامل *</Label>
            <div className="h-10 rounded-xl border px-3 flex items-center text-xs bg-muted/20" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0" }}>أدخل اسمك الكامل</div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold opacity-70">رقم الهاتف *</Label>
            <div className="h-10 rounded-xl border px-3 flex items-center text-xs bg-muted/20" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0" }}>07XXXXXXXX</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-[11px] font-bold opacity-70">الولاية *</Label><div className="h-10 rounded-xl border px-3 flex items-center justify-between text-xs bg-muted/20" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0" }}>اختر الولاية <ChevronDown className="w-3 h-3 opacity-40" /></div></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-bold opacity-70">البلدية *</Label><div className="h-10 rounded-xl border px-3 flex items-center justify-between text-xs bg-muted/20" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0" }}>اختر البلدية <ChevronDown className="w-3 h-3 opacity-40" /></div></div>
          </div>
          <div className="space-y-1.5"><Label className="text-[11px] font-bold opacity-70">نوع التوصيل</Label><div className="flex bg-muted/30 p-1 rounded-xl h-10"><div className="flex-1 flex items-center justify-center rounded-lg text-[10px] font-bold bg-background shadow-sm">للمنزل</div><div className="flex-1 flex items-center justify-center rounded-lg text-[10px] font-bold opacity-40">للمكتب</div></div></div>
        </div>
        <div className="bg-muted/30 rounded-2xl p-4 space-y-2.5">
          <div className="flex justify-between text-xs"><span className="opacity-60">السعر</span><span className="font-bold">{p.price.toLocaleString()} دج</span></div>
          <div className="border-t border-border/30 pt-2.5 flex justify-between font-black text-base"><span>المجموع</span><span style={{ color: p.primaryColor }}>{p.price.toLocaleString()} دج</span></div>
        </div>
        <button className={`w-full py-4 text-sm font-black text-white shadow-xl ${p.ctaAnimation === "pulse" ? "animate-pulse" : ""} ${p.ctaStyle === "pill" ? "rounded-full" : p.ctaStyle === "rounded" ? "rounded-2xl" : "rounded-none"}`} style={{ backgroundColor: p.primaryColor }}>{p.ctaText} — {p.price.toLocaleString()} دج</button>
      </div>
    );

    if (p.template === "original") {
      return (
        <div className="h-full overflow-y-auto scrollbar-hide flex flex-col" style={{ backgroundColor: p.backgroundColor, fontFamily: p.fontFamily, color: tc }}>
          <div className="sticky top-0 z-10 flex items-center justify-between px-3 h-10 border-b bg-card/80 backdrop-blur-md">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-white" style={{ backgroundColor: p.logo ? "#fff" : p.primaryColor }}>
                {p.logo ? <img src={p.logo} alt="Logo" className="w-full h-full object-contain p-1" /> : <ShoppingCart className="w-4 h-4 text-white" />}
              </div>
              <span className="text-[10px] font-bold truncate max-w-[150px]">{p.productName || defaultStoreName}</span>
            </div>
            <button className="text-[9px] font-bold px-4 py-1.5 rounded-full text-white shadow-lg" style={{ backgroundColor: p.primaryColor }}>اطلب الآن</button>
          </div>
          <div className="p-4 space-y-8">
            <div className={`${!isMobile ? "grid grid-cols-2 gap-10 items-start" : "space-y-6"}`}>
              <div className="space-y-6">
                <div className={`relative aspect-square overflow-hidden bg-muted ${shadowMap[p.shadowIntensity || "md"]}`} style={{ borderRadius: br }}>
                  {p.heroImage ? <img src={p.heroImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-1"><Image className="w-8 h-8 opacity-20" /><span className="text-[8px]">صورة المنتج</span></div>}
                  {discountPercent > 0 && <div className="absolute top-4 left-4 bg-destructive text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg">خصم {discountPercent}%</div>}
                </div>
                {(p.sections || []).includes("features") && (
                  <div className="grid grid-cols-2 gap-3" dir="rtl">
                    {(p.features || []).slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-muted/30 border border-border/50 rounded-xl">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${p.primaryColor}15` }}><Check className="w-3.5 h-3.5" style={{ color: p.primaryColor }} /></div>
                        <span className="text-[10px] font-bold leading-tight">{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-6">
                <div dir="rtl">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md" style={{ backgroundColor: `${p.primaryColor}15`, color: p.primaryColor }}>{p.category}</span>
                  <h1 className="text-2xl sm:text-3xl font-black mt-3 leading-tight">{p.heroTitle}</h1>
                  <p className="text-xs sm:text-sm mt-3 leading-relaxed opacity-70">{p.heroSubtitle}</p>
                </div>
                <div className="p-6 rounded-2xl border flex flex-col gap-2 shadow-sm" dir="rtl" style={{ background: `linear-gradient(135deg, ${p.primaryColor}08, ${p.accentColor}08)`, borderColor: `${p.primaryColor}20` }}>
                  <div className="flex items-center gap-4"><span className="text-3xl font-black" style={{ color: p.primaryColor }}>{p.price.toLocaleString()} دج</span>{p.originalPrice > p.price && <span className="text-base line-through opacity-40">{p.originalPrice.toLocaleString()} دج</span>}</div>
                </div>
                <OrderForm />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full overflow-y-auto scrollbar-hide" style={{ backgroundColor: p.backgroundColor, fontFamily: p.fontFamily, color: tc }}>
        {(p.sections || []).includes("urgency-bar") && <div className="py-2.5 px-4 text-center text-xs font-bold text-white" style={{ backgroundColor: p.primaryColor }}><span className="animate-pulse">🔥</span> {p.urgencyText} <span className="animate-pulse">🔥</span></div>}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md overflow-hidden bg-white" style={{ backgroundColor: p.logo ? "#fff" : p.primaryColor }}>
              {p.logo ? <img src={p.logo} alt="Logo" className="w-full h-full object-contain p-1" /> : <ShoppingCart className="w-4 h-4 text-white" />}
            </div>
            <span className="text-xs font-bold">{p.productName || defaultStoreName}</span>
          </div>
          <button className="text-[10px] font-bold px-3 py-1.5 rounded-full text-white shadow-sm" style={{ backgroundColor: p.primaryColor }}>{p.ctaText}</button>
        </div>
        <div className="p-4 sm:p-6 space-y-8">
          {(p.sections || []).includes("hero") && (
            <div className={`${!isMobile && p.heroLayout === "split" ? "grid grid-cols-2 gap-8 items-center" : "space-y-6"}`}>
              <div className={`relative overflow-hidden bg-muted shadow-lg ${p.imageStyle === "circle" ? "rounded-full aspect-square mx-auto" : p.imageStyle === "blob" ? "rounded-[30%_70%_70%_30%/30%_30%_70%_70%]" : ""}`} style={{ borderRadius: p.imageStyle === "rounded" ? br : undefined, aspectRatio: "4/3" }}>
                {p.heroImage ? <img src={p.heroImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center gap-2 py-16" style={{ color: stc }}><Image className="w-10 h-10 opacity-20" /><span className="text-[10px]">صورة المنتج</span></div>}
              </div>
              <div className={`space-y-4 ${!isMobile && p.heroLayout === "split" ? "" : "text-center"}`} dir="rtl">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-primary/10" style={{ color: p.primaryColor }}>{p.category}</span>
                <h1 className="text-2xl sm:text-3xl font-black leading-tight">{p.heroTitle}</h1>
                <p className="text-sm leading-relaxed opacity-70">{p.heroSubtitle}</p>
                <div className="p-4 rounded-2xl inline-flex flex-col gap-1 border shadow-sm" style={{ background: `linear-gradient(135deg, ${p.primaryColor}08, ${p.accentColor}08)`, borderColor: `${p.primaryColor}20`, borderRadius: br }}>
                  <div className="flex items-center gap-4"><span className="text-3xl font-black" style={{ color: p.primaryColor }}>{p.price.toLocaleString()} دج</span><span className="text-base line-through opacity-40">{p.originalPrice.toLocaleString()} دج</span></div>
                </div>
              </div>
            </div>
          )}
          {(p.sections || []).includes("gallery") && (p.galleryImages || []).length > 0 && (
            <div className="space-y-4" dir="rtl">
              <h3 className="text-base font-bold flex items-center gap-2"><Camera className="w-5 h-5" style={{ color: p.primaryColor }} /> صور المنتج</h3>
              <div className="grid grid-cols-2 gap-3">
                {(p.galleryImages || []).map((img, i) => (
                  <div key={i} className="aspect-square overflow-hidden bg-muted rounded-2xl shadow-sm" style={{ borderRadius: br }}><img src={img} alt="" className="w-full h-full object-cover" /></div>
                ))}
              </div>
            </div>
          )}
          {(p.sections || []).includes("features") && (
            <div className="space-y-4" dir="rtl">
              <h3 className="text-base font-bold flex items-center gap-2"><Star className="w-5 h-5" style={{ color: p.primaryColor }} /> لماذا هذا المنتج؟</h3>
              <div className="grid grid-cols-2 gap-3">
                {(p.features || []).map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3.5 border rounded-2xl bg-card shadow-sm" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${p.primaryColor}15` }}><Check className="w-4 h-4" style={{ color: p.primaryColor }} /></div>
                    <span className="text-[11px] font-bold leading-tight">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(p.sections || []).includes("cta") && <OrderForm />}
        </div>
      </div>
    );
  };

  if (editingPage) {
    return (
      <div className="flex flex-col h-[calc(100vh-140px)] -m-4 sm:-m-6">
        <div className="bg-card border-b border-border p-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setEditingPage(null)} className="rounded-xl gap-1.5"><ChevronDown className="w-4 h-4 rotate-90" /> رجوع</Button>
            <div><h2 className="text-sm font-bold text-foreground leading-tight">{editingPage.productName}</h2><p className="text-[10px] text-muted-foreground">تعديل صفحة الهبوط</p></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-muted rounded-lg p-0.5 mr-2">
              <button onClick={() => setPreviewDevice("desktop")} className={`p-1.5 rounded-md transition-all ${previewDevice === "desktop" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}><Monitor className="w-4 h-4" /></button>
              <button onClick={() => setPreviewDevice("mobile")} className={`p-1.5 rounded-md transition-all ${previewDevice === "mobile" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}><Smartphone className="w-4 h-4" /></button>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.open(getProductUrl(editingPage), "_blank")} className="rounded-xl gap-1.5 hidden sm:flex"><ExternalLink className="w-4 h-4" /> معاينة</Button>
            <Button size="sm" onClick={() => publishPage(editingPage)} className="rounded-xl gap-1.5 bg-gradient-to-l from-primary to-primary/90 shadow-md"><Zap className="w-4 h-4" /> <span className="hidden sm:inline">حفظ ونشر</span></Button>
            <Button variant={showConfig ? "secondary" : "default"} size="sm" onClick={() => setShowConfig(!showConfig)} className="rounded-xl gap-1.5">{showConfig ? <EyeOff className="w-4 h-4" /> : <Edit className="w-4 h-4" />}{showConfig ? "إخفاء" : "تعديل"}</Button>
          </div>
        </div>
        <div className={`flex flex-col lg:flex-row flex-1 ${showConfig ? "overflow-y-auto" : "overflow-hidden"} lg:overflow-hidden`}>
          <div className={`flex-1 bg-muted/30 flex items-center justify-center p-4 lg:p-8 min-h-[600px] lg:min-h-0 order-2 lg:order-1 overflow-y-auto ${!showConfig ? "flex" : "hidden lg:flex"}`}>
            <div className={`bg-background shadow-2xl rounded-[2.5rem] border-[8px] border-card overflow-hidden transition-all duration-500 ${previewDevice === "mobile" ? "w-[375px] h-[750px]" : "w-full max-w-5xl h-[95%]"}`}>{renderPreview(previewDevice === "mobile")}</div>
          </div>
          <div className={`w-full lg:w-[420px] border-b lg:border-b-0 lg:border-l border-border bg-card flex flex-col shrink-0 order-1 lg:order-2 ${showConfig ? "flex" : "hidden"}`}>
            <div className="p-3 border-b border-border">
              <div className="flex bg-muted rounded-xl p-0.5 gap-0.5">
                {[...(isAdmin ? [{ id: "magic", label: "سحر الـ AI", icon: Sparkles }] : []), { id: "content", label: "المحتوى", icon: Type }, { id: "template", label: "القوالب", icon: LayoutTemplate }, { id: "colors", label: "الألوان", icon: Palette }, { id: "sections", label: "الأقسام", icon: Layers }].map((tab: any) => (
                  <button key={tab.id} onClick={() => setActiveDesignTab(tab.id)} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-medium transition-all ${activeDesignTab === tab.id ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}><tab.icon className="w-3 h-3" /><span className="hidden sm:inline">{tab.label}</span></button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {activeDesignTab === "magic" && (
                <div className="space-y-6">
                  <div className="text-center space-y-2 mt-4 mb-8"><div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary/10 text-primary mb-2 shadow-inner"><Sparkles className="w-8 h-8" /></div><h2 className="text-2xl font-black text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">التصميم بالذكاء الاصطناعي</h2><p className="text-sm text-muted-foreground">صمم صفحة هبوط احترافية في ثوانٍ</p></div>
                  {!isAiGenerating && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="space-y-3"><Label className="text-sm font-bold">1. سياق المنتج (اختياري)</Label><Textarea value={aiContextInput} onChange={(e) => setAiContextInput(e.target.value)} placeholder="مثال: ساعة ذكية مقاومة للماء للرياضيين..." className="min-h-[80px] rounded-2xl" /></div>
                      <div className="space-y-3"><Label className="text-sm font-bold">2. صورة المنتج</Label><div className="border-2 border-dashed border-primary/30 rounded-3xl p-8 text-center hover:bg-primary/5 cursor-pointer relative" onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = (e: any) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onloadend = () => setUploadedAiImage(r.result as string); r.readAsDataURL(f); } }; i.click(); }}>{uploadedAiImage && <img src={uploadedAiImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />}<div className="relative z-10 flex flex-col items-center"><Upload className="w-10 h-10 text-primary/50 mb-4" /><p className="text-sm font-bold">ارفع صورة للمنتج</p></div></div></div>
                      <Button onClick={handleSimulatedAiGeneration} disabled={!uploadedAiImage} className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-l from-purple-600 to-indigo-600"><Zap className="w-5 h-5 ml-2" />توليد الصفحة</Button>
                    </motion.div>
                  )}
                  {isAiGenerating && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-8">
                      <div className="relative w-32 h-32 flex items-center justify-center"><motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-[3px] border-dashed border-primary/30" /><motion.div animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ duration: 2, repeat: Infinity }} className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg"><Sparkles className="w-8 h-8 text-white" /></motion.div></div>
                      <div className="space-y-4 w-full px-6">
                        {["تحليل تفاصيل المنتج...", "كتابة محتوى مقنع...", "اختيار صور احترافية...", "تنسيق الهوية البصرية..."].map((step, idx) => (
                          <div key={idx} className="flex items-center gap-3"><Check className={`w-5 h-5 ${aiProgressStep > idx ? "text-primary" : "text-muted/30"}`} /><p className={`font-bold ${aiProgressStep === idx + 1 ? "text-foreground" : "text-muted"}`}>{step}</p></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeDesignTab === "content" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold opacity-70">السعر (دج)</Label><Input type="number" value={editingPage.price} onChange={(e) => updatePage("price", parseInt(e.target.value) || 0)} className="rounded-xl h-8 text-xs" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold opacity-70">السعر الأصلي</Label><Input type="number" disabled={!isAdmin} value={editingPage.originalPrice} onChange={(e) => updatePage("originalPrice", parseInt(e.target.value) || 0)} className="rounded-xl h-8 text-xs" /></div>
                  </div>
                  <div className="space-y-2"><Label className="text-xs font-bold opacity-70">العنوان الرئيسي</Label><Input value={editingPage.heroTitle} onChange={(e) => updatePage("heroTitle", e.target.value)} className="rounded-xl h-9 text-sm" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold opacity-70">العنوان الفرعي</Label><Textarea value={editingPage.heroSubtitle} onChange={(e) => updatePage("heroSubtitle", e.target.value)} className="rounded-xl text-sm" rows={2} /></div>
                  <div className="space-y-4 p-4 bg-muted/20 rounded-2xl border-2 border-dashed border-primary/20 cursor-pointer text-center" onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = (e: any) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onloadend = () => updatePage("heroImage", r.result as string); r.readAsDataURL(f); } }; i.click(); }}>{editingPage.heroImage ? <img src={editingPage.heroImage} className="w-full aspect-video object-cover rounded-lg" /> : <div className="py-4"><Upload className="w-6 h-6 mx-auto mb-1 opacity-40" /><span className="text-[10px] font-bold opacity-60">رفع صورة الواجهة</span></div>}</div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">المميزات</Label>
                    {(editingPage.features || []).map((feature, idx) => (
                      <div key={idx} className="flex gap-2"><Input value={feature} onChange={(e) => { const nf = [...editingPage.features]; nf[idx] = e.target.value; updatePage("features", nf); }} className="rounded-xl h-8 text-xs flex-1" /><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => updatePage("features", editingPage.features.filter((_, i) => i !== idx))}><Trash2 className="w-3 h-3" /></Button></div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full rounded-xl border-dashed h-8 text-xs" onClick={() => updatePage("features", [...editingPage.features, "ميزة جديدة"])}><Plus className="w-3 h-3 ml-1" />إضافة</Button>
                  </div>
                </div>
              )}
              {activeDesignTab === "template" && (
                <div className="grid grid-cols-2 gap-2">
                  {templates.map(tmpl => (
                    <button key={tmpl.id} onClick={() => applyTemplate(tmpl.id)} className={`p-2.5 rounded-xl border-2 transition-all ${editingPage.template === tmpl.id ? "border-primary bg-primary/5" : "border-border/50"}`}><div className={`w-full h-10 rounded-lg bg-gradient-to-br ${tmpl.preview}`} /><span className="text-lg mt-1 block">{tmpl.icon}</span><p className="text-[10px] font-bold mt-0.5">{tmpl.name}</p></button>
                  ))}
                </div>
              )}
              {activeDesignTab === "colors" && (
                <div className="space-y-5">
                  <div className="space-y-2"><Label className="text-xs font-bold opacity-70">اللون الأساسي</Label><div className="flex flex-wrap gap-2">{colorPresets.map(c => <button key={c.value} onClick={() => updatePage("primaryColor", c.value)} className={`w-8 h-8 rounded-lg ${editingPage.primaryColor === c.value ? "ring-2 ring-primary ring-offset-2" : ""}`} style={{ backgroundColor: c.value }} />)}</div></div>
                  <div className="space-y-2"><Label className="text-xs font-bold opacity-70">حجم الحواف ({editingPage.borderRadius}px)</Label><Slider value={[editingPage.borderRadius]} onValueChange={([v]) => updatePage("borderRadius", v)} min={0} max={32} step={2} /></div>
                </div>
              )}
              {activeDesignTab === "sections" && (
                <div className="space-y-2">
                  {availableSections.map(s => {
                    const active = (editingPage.sections || []).includes(s.id);
                    return <button key={s.id} onClick={() => toggleSection(s.id)} disabled={s.required} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-right ${active ? "border-primary bg-primary/5" : "border-border/50"} ${s.required ? "opacity-60" : ""}`}><div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}><s.icon className="w-4 h-4" /></div><div className="flex-1 text-right"><p className="text-xs font-bold">{s.name}</p><p className="text-[9px] text-muted-foreground">{s.desc}</p></div><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? "bg-primary border-primary text-white" : ""}`}>{active && <Check className="w-3 h-3" />}</div></button>;
                  })}
                </div>
              )}
            </div>
            <div className="p-3 border-t border-border bg-muted/20 shrink-0"><Button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => saveToDatabase(editingPage)}><Save className="w-4 h-4 ml-2" />حفظ التغييرات</Button></div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 w-1/3 bg-muted animate-pulse rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div {...cardAnim()} className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-foreground flex items-center gap-2"><LayoutTemplate className="w-6 h-6 text-primary" />صفحات الهبوط</h2><p className="text-sm text-muted-foreground mt-1">{(pages || []).length} صفحة متاحة</p></div>
        <Button onClick={() => setEditingPage(defaultNewPage())} className="rounded-xl gap-2"><Plus className="w-4 h-4" />إنشاء صفحة جديدة</Button>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "إجمالي الزيارات", value: (pages || []).reduce((s, p) => s + (p.views || 0), 0).toLocaleString(), icon: Eye },
          { label: "التحويلات", value: (pages || []).reduce((s, p) => s + (p.conversions || 0), 0).toLocaleString(), icon: ShoppingCart },
          { label: "معدل التحويل", value: `${(pages || []).reduce((s, p) => s + (p.views || 0), 0) > 0 ? (((pages || []).reduce((s, p) => s + (p.conversions || 0), 0) / (pages || []).reduce((s, p) => s + (p.views || 0), 0)) * 100).toFixed(1) : 0}%`, icon: Zap },
        ].map((stat, i) => (
          <motion.div key={i} {...cardAnim(i * 0.05)} className="bg-card border rounded-2xl p-4 shadow-sm">
            <stat.icon className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {(pages || []).map((page, i) => {
            const tmpl = templates.find(t => t.id === page.template);
            return (
              <motion.div key={page.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }} className="bg-card border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                <div className={`h-32 bg-gradient-to-br ${tmpl?.preview || "from-primary to-primary/80"} p-5 flex items-end relative`}>
                  <div className="absolute inset-0 bg-black/10" /><div className="relative z-10"><p className="text-white font-bold text-lg">{page.productName}</p><p className="text-white/80 text-sm">{tmpl?.name || "قالب"} {isAdmin && (page as any).ownerName && <span className="mr-2 opacity-60">• {(page as any).ownerName}</span>}</p></div>
                  <div className="absolute top-3 left-3"><span className={`px-3 py-1 rounded-full text-[10px] font-bold ${page.status === "published" ? "bg-emerald-500 text-white" : "bg-white/20 text-white backdrop-blur-sm"}`}>{page.status === "published" ? "منشورة" : "مسودة"}</span></div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{(page.views || 0).toLocaleString()} زيارة</span><span className="text-secondary font-semibold">{(page.conversions || 0)} تحويل</span></div>
                  <div className="flex items-center gap-1.5 flex-wrap">{(page.sections || []).slice(0, 5).map(s => { const sec = availableSections.find(a => a.id === s); return sec ? <span key={s} className="text-[10px] bg-muted px-2 py-0.5 rounded-lg text-muted-foreground">{sec.name}</span> : null; })}</div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(page)} disabled={isFetchingDetails === page.id} className="flex-1 rounded-xl gap-1.5">{isFetchingDetails === page.id ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Zap className="w-3.5 h-3.5" /></motion.div> : <Paintbrush className="w-3.5 h-3.5" />} تخصيص</Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(getProductUrl(page), "_blank")} className="rounded-xl"><ExternalLink className="w-3.5 h-3.5" /></Button>
                    <Button variant="outline" size="sm" onClick={() => copyLink(page)} className="rounded-xl">{copiedId === page.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}</Button>
                    <Button variant="outline" size="sm" onClick={() => deletePage(page.id)} className="rounded-xl text-destructive hover:bg-destructive/5"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {(pages || []).length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl"><LayoutTemplate className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" /><p className="font-bold text-muted-foreground">لا توجد صفحات هبوط بعد</p></div>
      )}
    </div>
  );
};

export default LandingPageBuilder;
