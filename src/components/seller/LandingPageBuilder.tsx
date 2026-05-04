import { useState, useEffect, useRef, useMemo } from "react";
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
  MousePointerClick, Ratio, ToggleLeft, Hash, AlignCenter, AlignLeft, Upload,
  Search, Filter
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
  productId: string;
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
  commission?: number;
  bundles?: BundlePack[];
}

const defaultNewPage = (): LandingPageConfig => ({
  id: `lp-${Date.now()}`,
  productId: "",
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
  const [searchQuery, setSearchQuery] = useState("");
  
  const userStr = localStorage.getItem("affiliate_user");
  const affiliateUser = userStr ? JSON.parse(userStr) : null;
  const isAdmin = affiliateUser?.role?.toUpperCase() === "ADMIN";
  const defaultStoreName = affiliateUser?.storeName || "متجري";
  const [activeDesignTab, setActiveDesignTab] = useState<"magic" | "content" | "template" | "colors" | "sections">(isAdmin ? "magic" : "content");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const lastHandledProductId = useRef<string | null>(null);

  // Fetch pages on mount
  const fetchPages = async () => {
    setIsLoading(true);
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

  useEffect(() => {
    fetchPages();
  }, []);

  const handleEdit = async (page: LandingPageConfig) => {
    if (!page.id.startsWith("lp-")) {
      setIsFetchingDetails(page.id);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_BASE_URL}/store/pages/${page.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (res.ok && json.data) {
          setEditingPage(json.data);
        } else {
          toast({ title: "خطأ", description: "فشل تحميل تفاصيل الصفحة", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "خطأ", description: "حدث خطأ في الاتصال بالسيرفر", variant: "destructive" });
      } finally {
        setIsFetchingDetails(null);
      }
    } else {
      setEditingPage(page);
    }
  };

  // AI Magic State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiProgressStep, setAiProgressStep] = useState(0);
  const [uploadedAiImage, setUploadedAiImage] = useState<string | null>(null);
  const [aiContextInput, setAiContextInput] = useState("");

  const saveToDatabase = async (pageToSave: LandingPageConfig) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const isNew = pageToSave.id.startsWith("lp-");
      const url = isNew ? `${API_BASE_URL}/store/page` : `${API_BASE_URL}/store/page/${pageToSave.id}`;
      const method = isNew ? "POST" : "PUT";

      const { id, productId, status, views, conversions, ...configData } = pageToSave;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ productId, configData, status })
      });

      const json = await response.json();
      if (response.ok) {
        if (isNew && json.data) {
          const updated = { ...pageToSave, id: json.data.id };
          setPages(prev => prev.map(p => p.id === pageToSave.id ? updated : p));
          setEditingPage(updated);
        }
        toast({ title: "💾 تم الحفظ بنجاح" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "خطأ في الحفظ" });
    }
  };

  useEffect(() => {
    if (initialProductToEdit && !isLoading && lastHandledProductId.current !== initialProductToEdit.id) {
      lastHandledProductId.current = initialProductToEdit.id;
      const existingPage = (pages || []).find((p) => p.productId === initialProductToEdit.id);
      if (existingPage) {
        handleEdit(existingPage);
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
          galleryImages: initialProductToEdit.images && initialProductToEdit.images.length > 0 ? initialProductToEdit.images : (initialProductToEdit.image ? [initialProductToEdit.image] : []),
          features: initialProductToEdit.features && initialProductToEdit.features.length > 0 ? initialProductToEdit.features : ["جودة عالية مضمونة", "توصيل سريع", "الدفع عند الاستلام"],
          videoUrl: initialProductToEdit.videoUrl || "",
          availableColors: initialProductToEdit.hasColors ? initialProductToEdit.availableColors : [],
          availableSizes: initialProductToEdit.hasSizes ? initialProductToEdit.availableSizes : [],
          showFreeShipping: !!initialProductToEdit.showFreeShipping,
          sections: ["hero", "urgency-bar", "features", "gallery", "social-proof", "reviews", "shipping", "cta"],
          status: "draft"
        };
        setPages([newPage, ...pages]);
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
      const res = await fetch(`${API_BASE_URL}/store/generate-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: uploadedAiImage, contextText: aiContextInput })
      });
      if (!res.ok) throw new Error('AI failed');
      const { config } = await res.json();
      setAiProgressStep(3);
      const aiGeneratedPage: LandingPageConfig = {
        ...editingPage,
        ...config,
        heroImage: uploadedAiImage,
        sections: config.suggestedSections || ["hero", "urgency-bar", "features", "gallery", "social-proof", "faq", "cta"]
      };
      setEditingPage(aiGeneratedPage);
      setPages(pages.map(p => p.id === editingPage.id ? aiGeneratedPage : p));
      setIsAiGenerating(false);
      setAiProgressStep(0);
      setUploadedAiImage(null);
      setActiveDesignTab("content");
      toast({ title: "✨ سحر الـ AI مكتمل!" });
    } catch (err) {
      setIsAiGenerating(false);
      toast({ title: "خطأ", description: "فشل الذكاء الاصطناعي", variant: "destructive" });
    }
  };

  const updatePage = (field: keyof LandingPageConfig, value: any) => {
    if (!editingPage) return;
    const updated = { ...editingPage, [field]: value };
    setEditingPage(updated);
    setPages(pages.map(p => p.id === updated.id ? updated : p));
  };

  const applyTemplate = (tmplId: string) => {
    if (!editingPage) return;
    let updates: Partial<LandingPageConfig> = { template: tmplId };
    switch (tmplId) {
      case "original": updates = { ...updates, backgroundColor: "#ffffff", primaryColor: "#3b82f6", fontFamily: "cairo" }; break;
      case "modern": updates = { ...updates, backgroundColor: "#f8fafc", primaryColor: "#8b5cf6", fontFamily: "tajawal" }; break;
      case "bold": updates = { ...updates, backgroundColor: "#fffbeb", primaryColor: "#f97316", fontFamily: "almarai" }; break;
      case "minimal": updates = { ...updates, backgroundColor: "#ffffff", primaryColor: "#0f172a", fontFamily: "ibm-plex" }; break;
      case "dark": updates = { ...updates, backgroundColor: "#020617", primaryColor: "#10b981", fontFamily: "cairo" }; break;
    }
    const updated = { ...editingPage, ...updates };
    setEditingPage(updated as LandingPageConfig);
    setPages(pages.map(p => p.id === updated.id ? (updated as LandingPageConfig) : p));
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
    if (!confirm("هل أنت متأكد؟")) return;
    const token = localStorage.getItem("token");
    if (id.startsWith("lp-")) {
      setPages(pages.filter(p => p.id !== id));
      if (editingPage?.id === id) setEditingPage(null);
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
        toast({ title: "🗑️ تم الحذف" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const getProductUrl = (page: LandingPageConfig) => {
    if (page.productId && affiliateUser?.id) {
      return `${window.location.origin}/product/${page.productId}/${affiliateUser.id}`;
    }
    return `${window.location.origin}/lp/${page.id}`;
  };

  const copyLink = (page: LandingPageConfig) => {
    navigator.clipboard.writeText(getProductUrl(page));
    setCopiedId(page.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "✅ تم النسخ" });
  };

  const viewPage = (page: LandingPageConfig) => {
    window.open(getProductUrl(page), "_blank");
  };

  const publishPage = async (page: LandingPageConfig) => {
    const updated: LandingPageConfig = { ...page, status: "published" };
    setPages(pages.map(p => p.id === updated.id ? updated : p));
    if (editingPage?.id === updated.id) setEditingPage(updated);
    await saveToDatabase(updated);
  };

  const cardAnim = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: "easeOut" }
  } as const);

  const isDark = (bg: string) => bg.startsWith("#0") || bg.startsWith("#1") || bg.startsWith("#2") || bg === "#020617";

  const renderPreview = (isMobile: boolean) => {
    const p = editingPage;
    if (!p) return null;
    const tc = isDark(p.backgroundColor) ? "#ffffff" : "#0f172a";
    const stc = isDark(p.backgroundColor) ? "#94a3b8" : "#64748b";
    const br = `${p.borderRadius}px`;
    const discountPercent = p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

    const shadowMap = { none: "shadow-none", sm: "shadow-sm", md: "shadow-md", lg: "shadow-lg", xl: "shadow-xl" };

    const OrderForm = () => (
      <div className="bg-card border-2 rounded-2xl p-6 shadow-xl space-y-6" dir="rtl" style={{ borderColor: p.primaryColor, borderRadius: br }}>
        <h3 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" style={{ color: p.primaryColor }} /> اطلب الآن
        </h3>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label className="text-[11px] font-bold opacity-70">الاسم الكامل *</Label><div className="h-10 rounded-xl border px-3 flex items-center text-xs bg-muted/20">أدخل اسمك الكامل</div></div>
          <div className="space-y-1.5"><Label className="text-[11px] font-bold opacity-70">رقم الهاتف *</Label><div className="h-10 rounded-xl border px-3 flex items-center text-xs bg-muted/20">07XXXXXXXX</div></div>
          <button className={`w-full py-4 text-sm font-black text-white shadow-xl ${p.ctaAnimation === "pulse" ? "animate-pulse" : ""}`} style={{ backgroundColor: p.primaryColor, borderRadius: br }}>{p.ctaText} — {p.price.toLocaleString()} دج</button>
        </div>
      </div>
    );

    if (p.template === "original") {
      return (
        <div className="h-full overflow-y-auto scrollbar-hide flex flex-col" style={{ backgroundColor: p.backgroundColor, fontFamily: p.fontFamily, color: tc }}>
          <div className="sticky top-0 z-10 flex items-center justify-between px-3 h-10 border-b bg-card/80 backdrop-blur-md">
            <div className="flex items-center gap-1.5 truncate">
               <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border">
                {p.logo ? <img src={p.logo} alt="L" className="w-full h-full object-contain p-1" /> : <ShoppingCart className="w-4 h-4" style={{ color: p.primaryColor }} />}
               </div>
               <span className="text-[10px] font-bold">{p.productName}</span>
            </div>
            <button className="text-[9px] font-bold px-4 py-1.5 rounded-full text-white" style={{ backgroundColor: p.primaryColor }}>اطلب الآن</button>
          </div>
          <div className="p-4 space-y-8">
             <div className={`relative aspect-square overflow-hidden bg-muted ${shadowMap[p.shadowIntensity]}`} style={{ borderRadius: br }}>
                {p.heroImage && <img src={p.heroImage} alt="" className="w-full h-full object-cover" />}
                {discountPercent > 0 && <div className="absolute top-4 left-4 bg-destructive text-white px-3 py-1.5 rounded-full text-[10px] font-black">خصم {discountPercent}%</div>}
             </div>
             <div dir="rtl">
                <h1 className="text-2xl font-black">{p.heroTitle}</h1>
                <p className="text-xs mt-2 opacity-70">{p.heroSubtitle}</p>
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-3xl font-black" style={{ color: p.primaryColor }}>{p.price.toLocaleString()} دج</span>
                  {p.originalPrice > p.price && <span className="line-through opacity-40">{p.originalPrice.toLocaleString()} دج</span>}
                </div>
             </div>
             <OrderForm />
          </div>
        </div>
      );
    }

    return (
      <div className="h-full overflow-y-auto scrollbar-hide" style={{ backgroundColor: p.backgroundColor, fontFamily: p.fontFamily, color: tc }}>
        {(p.sections || []).includes("urgency-bar") && <div className="py-2.5 px-4 text-center text-xs font-bold text-white" style={{ backgroundColor: p.primaryColor }}>{p.urgencyText}</div>}
        <div className="p-6 space-y-8" dir="rtl">
          <div className="text-center space-y-4">
             <h1 className="text-3xl font-black leading-tight">{p.heroTitle}</h1>
             <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl" style={{ borderRadius: br }}>
                {p.heroImage && <img src={p.heroImage} alt="" className="w-full h-full object-cover" />}
             </div>
             <p className="text-sm opacity-70">{p.heroSubtitle}</p>
             <div className="p-4 rounded-3xl bg-muted/20 border-2" style={{ borderColor: `${p.primaryColor}20` }}>
                <span className="text-4xl font-black" style={{ color: p.primaryColor }}>{p.price.toLocaleString()} دج</span>
             </div>
          </div>
          {(p.sections || []).includes("cta") && <OrderForm />}
        </div>
      </div>
    );
  };

  if (editingPage) {
    return (
      <div className="flex flex-col h-[calc(100vh-140px)] -m-4 sm:-m-6">
        <div className="bg-card border-b border-border p-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setEditingPage(null)} className="rounded-xl"><ArrowRight className="w-4 h-4 ml-2" /> رجوع</Button>
            <h2 className="text-sm font-bold truncate max-w-[150px]">{editingPage.productName}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowConfig(!showConfig)} className="rounded-xl">
              {showConfig ? <EyeOff className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            </Button>
            <Button size="sm" onClick={() => publishPage(editingPage)} className="rounded-xl bg-primary shadow-lg"><Save className="w-4 h-4 ml-2" /> حفظ</Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className={`flex-1 bg-muted/20 overflow-y-auto p-4 flex justify-center items-start ${!showConfig ? "block" : "hidden lg:flex"}`}>
             <div className={`bg-background shadow-2xl rounded-[3rem] border-8 border-card overflow-hidden transition-all duration-500 ${previewDevice === "mobile" ? "w-[375px] h-[750px]" : "w-full max-w-5xl h-[95%]"}`}>
                {renderPreview(previewDevice === "mobile")}
             </div>
          </div>

          {showConfig && (
            <div className="w-full lg:w-[400px] border-r bg-card flex flex-col shrink-0">
               <div className="p-3 border-b flex gap-1 overflow-x-auto scrollbar-hide">
                  {([
                    { id: "magic", label: "AI", icon: Sparkles },
                    { id: "content", label: "محتوى", icon: Type },
                    { id: "template", label: "قوالب", icon: LayoutTemplate },
                    { id: "colors", label: "ألوان", icon: Palette },
                    { id: "sections", label: "أقسام", icon: Layers },
                  ] as const).map(tab => (
                    <button key={tab.id} onClick={() => setActiveDesignTab(tab.id)} className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${activeDesignTab === tab.id ? "bg-primary text-white border-primary" : "bg-muted/30 border-transparent hover:border-border"}`}>
                       <tab.icon className="w-3.5 h-3.5 mx-auto mb-1" /> {tab.label}
                    </button>
                  ))}
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {activeDesignTab === "magic" && (
                    <div className="space-y-6">
                       <div className="p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-3xl border border-primary/20 text-center">
                          <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
                          <h3 className="text-sm font-black mb-1">بناء بذكاء اصطناعي</h3>
                          <p className="text-[10px] opacity-60">ارفع صورة وسنقوم بكتابة كل شيء لك</p>
                       </div>
                       <div className="space-y-4">
                          <div className="border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer hover:bg-muted/30 transition-all" onClick={() => {
                            const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
                            input.onchange = (e: any) => {
                              const file = e.target.files[0];
                              if (file) { const r = new FileReader(); r.onloadend = () => setUploadedAiImage(r.result as string); r.readAsDataURL(file); }
                            };
                            input.click();
                          }}>
                             {uploadedAiImage ? <img src={uploadedAiImage} className="w-full h-32 object-cover rounded-xl" /> : <Upload className="w-8 h-8 opacity-20 mx-auto" />}
                             <p className="text-xs font-bold mt-2">ارفع صورة المنتج</p>
                          </div>
                          <Button onClick={handleSimulatedAiGeneration} disabled={isAiGenerating || !uploadedAiImage} className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-purple-600">
                             {isAiGenerating ? "جاري التوليد..." : "توليد بلمسة سحرية"}
                          </Button>
                       </div>
                    </div>
                  )}
                  {activeDesignTab === "content" && (
                    <div className="space-y-4">
                       <div className="space-y-2"><Label className="text-xs font-bold">اسم المنتج</Label><Input value={editingPage.productName} onChange={e => updatePage("productName", e.target.value)} className="rounded-xl" /></div>
                       <div className="space-y-2"><Label className="text-xs font-bold">العنوان الرئيسي</Label><Input value={editingPage.heroTitle} onChange={e => updatePage("heroTitle", e.target.value)} className="rounded-xl" /></div>
                       <div className="space-y-2"><Label className="text-xs font-bold">الوصف</Label><Textarea value={editingPage.heroSubtitle} onChange={e => updatePage("heroSubtitle", e.target.value)} className="rounded-xl" /></div>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2"><Label className="text-xs font-bold">السعر</Label><Input type="number" value={editingPage.price} onChange={e => updatePage("price", parseInt(e.target.value))} className="rounded-xl" /></div>
                          <div className="space-y-2"><Label className="text-xs font-bold">السعر الأصلي</Label><Input type="number" value={editingPage.originalPrice} onChange={e => updatePage("originalPrice", parseInt(e.target.value))} className="rounded-xl" /></div>
                       </div>
                    </div>
                  )}
                  {activeDesignTab === "template" && (
                    <div className="grid grid-cols-2 gap-3">
                       {templates.map(t => (
                         <button key={t.id} onClick={() => applyTemplate(t.id)} className={`p-4 rounded-2xl border-2 transition-all ${editingPage.template === t.id ? "border-primary bg-primary/5 shadow-md" : "border-border/50 hover:border-border"}`}>
                            <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${t.preview} mb-2`} />
                            <p className="text-[10px] font-bold">{t.name}</p>
                         </button>
                       ))}
                    </div>
                  )}
                  {activeDesignTab === "colors" && (
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <Label className="text-xs font-bold">اللون الأساسي</Label>
                          <div className="flex flex-wrap gap-2">
                             {colorPresets.map(c => <button key={c.value} onClick={() => updatePage("primaryColor", c.value)} className="w-8 h-8 rounded-lg" style={{ backgroundColor: c.value }} />)}
                          </div>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-xs font-bold">حجم الحواف ({editingPage.borderRadius}px)</Label>
                          <Slider value={[editingPage.borderRadius]} onValueChange={([v]) => updatePage("borderRadius", v)} max={32} />
                       </div>
                    </div>
                  )}
                  {activeDesignTab === "sections" && (
                    <div className="space-y-2">
                       {availableSections.map(s => (
                         <div key={s.id} onClick={() => toggleSection(s.id)} className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer ${editingPage.sections.includes(s.id) ? "border-primary bg-primary/5" : "opacity-60"}`}>
                            <s.icon className="w-4 h-4" /> <span className="text-[10px] font-bold">{s.name}</span>
                         </div>
                       ))}
                    </div>
                  )}
               </div>
               <div className="p-4 border-t bg-muted/20">
                  <Button onClick={() => saveToDatabase(editingPage)} className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black">حفظ التغييرات</Button>
               </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 lg:p-4 space-y-8">
      <motion.div {...cardAnim()} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground mb-1">صفحات الهبوط</h1>
          <p className="text-muted-foreground">صمم صفحات احترافية لزيادة مبيعاتك بنقرة واحدة</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input placeholder="بحث..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-10 h-12 w-[280px] bg-card border-border/50 rounded-2xl" />
          </div>
          <Button className="h-12 px-6 rounded-2xl bg-primary shadow-lg hover:scale-105 transition-all"><Plus className="w-5 h-5 ml-2" /> صفحة جديدة</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? [1,2,3,4].map(i => <div key={i} className="bg-card h-24 rounded-[2rem] animate-pulse border" />) : (
          [
            { label: "إجمالي الزيارات", value: (pages || []).reduce((s, p) => s + (p.views || 0), 0).toLocaleString(), icon: Eye },
            { label: "التحويلات", value: (pages || []).reduce((s, p) => s + (p.conversions || 0), 0).toLocaleString(), icon: ShoppingCart },
            { label: "معدل التحويل", value: `${(pages || []).reduce((s, p) => s + (p.views || 0), 0) > 0 ? (((pages || []).reduce((s, p) => s + (p.conversions || 0), 0) / (pages || []).reduce((s, p) => s + (p.views || 0), 0)) * 100).toFixed(1) : 0}%`, icon: Zap },
            { label: "نشط حالياً", value: (pages || []).filter(p => p.status === 'published').length.toString(), icon: Rocket }
          ].map((stat, i) => (
            <motion.div key={i} {...cardAnim(i * 0.1)} className="bg-card p-5 rounded-[2rem] border border-border/50">
              <stat.icon className="w-5 h-5 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {isLoading ? [1,2,3,4].map(i => (
              <div key={i} className="bg-card h-64 rounded-[2.5rem] border animate-pulse" />
            )) : (
            (pages || []).map((page, i) => {
              const tmpl = templates.find(t => t.id === page.template);
              return (
                <motion.div key={page.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }} className="dash-card-interactive overflow-hidden group">
                  <div className={`h-32 bg-gradient-to-br ${tmpl?.preview || "from-primary to-primary/80"} p-5 flex items-end relative`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative z-10">
                      <p className="text-white font-bold text-lg line-clamp-1">{page.productName}</p>
                      <p className="text-white/80 text-sm">{tmpl?.name} • {tmpl?.icon}</p>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{page.views.toLocaleString()} زيارة</span>
                      <span className="text-secondary font-semibold">{page.conversions} تحويل</span>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(page)} disabled={isFetchingDetails === page.id} className="flex-1 rounded-xl gap-1.5">
                        {isFetchingDetails === page.id ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full" /> : <Paintbrush className="w-3.5 h-3.5" />}
                        تخصيص
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => viewPage(page)} className="rounded-xl"><ExternalLink className="w-3.5 h-3.5" /></Button>
                      <Button variant="outline" size="sm" onClick={() => copyLink(page)} className="rounded-xl"><Copy className="w-3.5 h-3.5" /></Button>
                      <Button variant="outline" size="sm" onClick={() => publishPage(page)} className="rounded-xl">{page.status === "published" ? <Eye className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}</Button>
                      <Button variant="outline" size="sm" onClick={() => deletePage(page.id)} className="rounded-xl text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {pages.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <LayoutTemplate className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">لا توجد صفحات هبوط</p>
        </div>
      )}
    </div>
  );
};

export default LandingPageBuilder;
