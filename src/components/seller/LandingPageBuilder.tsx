import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout, Palette, Type, Image, Eye, Save, Plus, Trash2,
  ChevronDown, ChevronUp, Sparkles, Monitor, Smartphone,
  Copy, Check, ExternalLink, Layers, Paintbrush, Star,
  ShoppingCart, Shield, Truck, Clock, MessageSquare, Zap,
  GripVertical, Settings2, LayoutTemplate, ArrowRight, Phone, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
}

const templates = [
  { id: "modern", name: "عصري", icon: "✨", desc: "تصميم نظيف وأنيق", preview: "from-violet-600 to-indigo-700" },
  { id: "bold", name: "جريء", icon: "🔥", desc: "ألوان قوية وملفتة", preview: "from-orange-500 to-red-600" },
  { id: "minimal", name: "بسيط", icon: "🎯", desc: "مساحة بيضاء واسعة", preview: "from-slate-100 to-gray-200" },
  { id: "dark", name: "داكن", icon: "🌙", desc: "خلفية داكنة فاخرة", preview: "from-slate-900 to-gray-900" },
  { id: "gradient", name: "متدرج", icon: "🌈", desc: "تدرجات لونية جذابة", preview: "from-emerald-400 to-cyan-500" },
  { id: "classic", name: "كلاسيكي", icon: "📦", desc: "تصميم COD تقليدي", preview: "from-amber-500 to-yellow-600" },
];

const availableSections = [
  { id: "hero", name: "البطل الرئيسي", icon: Layout, required: true },
  { id: "features", name: "المميزات", icon: Star },
  { id: "gallery", name: "معرض الصور", icon: Image },
  { id: "reviews", name: "آراء العملاء", icon: MessageSquare },
  { id: "countdown", name: "عداد تنازلي", icon: Clock },
  { id: "guarantee", name: "ضمان واسترجاع", icon: Shield },
  { id: "shipping", name: "معلومات التوصيل", icon: Truck },
  { id: "faq", name: "أسئلة شائعة", icon: MessageSquare },
  { id: "cta", name: "دعوة للشراء", icon: ShoppingCart, required: true },
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
];

const fontOptions = [
  { value: "cairo", label: "Cairo" },
  { value: "tajawal", label: "Tajawal" },
  { value: "almarai", label: "Almarai" },
  { value: "changa", label: "Changa" },
  { value: "ibm-plex", label: "IBM Plex Arabic" },
];

const mockLandingPages: LandingPageConfig[] = [
  {
    id: "lp-1", productName: "ساعة ذكية متعددة الوظائف", template: "modern",
    heroTitle: "ساعتك الذكية الجديدة", heroSubtitle: "تتبع لياقتك وصحتك بأناقة",
    heroImage: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80",
    primaryColor: "#10b981", accentColor: "#3b82f6", ctaText: "اطلب الآن",
    ctaStyle: "pill", showReviews: true, showCountdown: true, showGuarantee: true,
    showFreeShipping: true, sections: ["hero", "features", "gallery", "reviews", "countdown", "guarantee", "cta"],
    customCss: "", fontFamily: "cairo", backgroundColor: "#ffffff",
    status: "published", views: 1240, conversions: 89,
    price: 4500, originalPrice: 9000, category: "إلكترونيات",
    features: ["شاشة AMOLED", "مقاومة للماء IP68", "بطارية 7 أيام", "تتبع اللياقة"],
  },
  {
    id: "lp-2", productName: "سماعات بلوتوث لاسلكية", template: "bold",
    heroTitle: "صوت نقي بدون حدود", heroSubtitle: "إلغاء ضوضاء متقدم",
    heroImage: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80",
    primaryColor: "#ef4444", accentColor: "#f97316", ctaText: "احصل عليها الآن",
    ctaStyle: "rounded", showReviews: true, showCountdown: false, showGuarantee: true,
    showFreeShipping: true, sections: ["hero", "features", "reviews", "shipping", "cta"],
    customCss: "", fontFamily: "tajawal", backgroundColor: "#0f172a",
    status: "draft", views: 0, conversions: 0,
    price: 3200, originalPrice: 6500, category: "إلكترونيات",
    features: ["إلغاء الضوضاء", "بطارية 24 ساعة", "بلوتوث 5.0", "ميكروفون مدمج"],
  },
];

const LandingPageBuilder = () => {
  const { toast } = useToast();
  const [pages, setPages] = useState<LandingPageConfig[]>(mockLandingPages);
  const [editingPage, setEditingPage] = useState<LandingPageConfig | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [activeDesignTab, setActiveDesignTab] = useState<"template" | "colors" | "sections" | "content">("template");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const createNewPage = () => {
    const newPage: LandingPageConfig = {
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
    };
    setPages(prev => [newPage, ...prev]);
    setEditingPage(newPage);
    toast({ title: "🎨 تم الإنشاء", description: "صفحة هبوط جديدة جاهزة للتخصيص" });
  };

  const updatePage = (field: keyof LandingPageConfig, value: any) => {
    if (!editingPage) return;
    const updated = { ...editingPage, [field]: value };
    setEditingPage(updated);
    setPages(prev => prev.map(p => p.id === updated.id ? updated : p));
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
    setPages(prev => prev.filter(p => p.id !== id));
    if (editingPage?.id === id) setEditingPage(null);
    toast({ title: "🗑️ تم الحذف" });
  };

  const copyLink = (page: LandingPageConfig) => {
    navigator.clipboard.writeText(`${window.location.origin}/lp/${page.id}`);
    setCopiedId(page.id);
    toast({ title: "تم نسخ الرابط! 🔗" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const publishPage = (page: LandingPageConfig) => {
    const newStatus = page.status === "published" ? "draft" : "published";
    setPages(prev => prev.map(p => p.id === page.id ? { ...p, status: newStatus } : p));
    if (editingPage?.id === page.id) setEditingPage({ ...editingPage, status: newStatus });
    toast({ title: newStatus === "published" ? "🚀 تم النشر" : "📝 تحويل إلى مسودة" });
  };

  const cardAnim = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  });

  // Editor view
  if (editingPage) {
    const totalPrice = editingPage.price;
    const savings = editingPage.originalPrice - editingPage.price;

    return (
      <div className="flex flex-col h-[calc(100vh-140px)] -m-4 sm:-m-6">
        {/* Editor header */}
        <div className="bg-card border-b border-border p-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setEditingPage(null)} className="rounded-xl gap-1.5">
              <ChevronDown className="w-4 h-4 rotate-90" /> رجوع
            </Button>
            <div>
              <h2 className="text-base font-bold text-foreground leading-tight">{editingPage.productName}</h2>
              <p className="text-xs text-muted-foreground">تعديل صفحة الهبوط</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-muted rounded-lg p-1 mr-2">
              <button 
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded-md transition-all ${previewDevice === "desktop" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded-md transition-all ${previewDevice === "mobile" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            <Button size="sm" onClick={() => publishPage(editingPage)} className="rounded-xl gap-1.5 bg-gradient-to-l from-primary to-primary/90 shadow-md">
              {editingPage.status === "published" ? <><Zap className="w-4 h-4" /> منشورة</> : <><Sparkles className="w-4 h-4" /> نشر</>}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Side: Live Preview */}
          <div className="hidden lg:flex flex-1 bg-muted/30 items-center justify-center p-8 overflow-y-auto">
            <div 
              className={`bg-background shadow-2xl rounded-2xl overflow-hidden transition-all duration-500 origin-center ${
                previewDevice === "mobile" ? "w-[375px] h-[667px]" : "w-full max-w-4xl h-full"
              }`}
              style={{ fontFamily: editingPage.fontFamily }}
            >
              <div className="h-full overflow-y-auto scrollbar-hide" style={{ backgroundColor: editingPage.backgroundColor }}>
                {/* Simulated ProductPage structure */}
                <div className="p-4 sm:p-8 space-y-8">
                  <div className={`grid ${previewDevice === "mobile" ? "grid-cols-1" : "grid-cols-2"} gap-8`}>
                    {/* Images Column */}
                    <div className="space-y-4">
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted group">
                        {editingPage.heroImage ? (
                          <img src={editingPage.heroImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                            <Image className="w-12 h-12 opacity-20" />
                            <span className="text-xs">بانتظار الصورة...</span>
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold">
                          خصم {Math.round((1 - editingPage.price / editingPage.originalPrice) * 100)}%
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {editingPage.features.slice(0, 4).map((f, i) => (
                          <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 text-[10px] sm:text-xs">
                            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="font-medium truncate">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Info Column */}
                    <div className="space-y-4 text-right" dir="rtl">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: editingPage.primaryColor }}>{editingPage.category}</span>
                        <h1 className="text-xl sm:text-2xl font-black mt-1 leading-tight" style={{ color: editingPage.backgroundColor === "#ffffff" ? "#0f172a" : (editingPage.backgroundColor.startsWith("#0") || editingPage.backgroundColor.startsWith("#1") ? "#ffffff" : "#0f172a") }}>
                          {editingPage.heroTitle}
                        </h1>
                        <p className="text-xs sm:text-sm mt-2 leading-relaxed opacity-70" style={{ color: editingPage.backgroundColor.startsWith("#0") || editingPage.backgroundColor.startsWith("#1") ? "#cbd5e1" : "#475569" }}>
                          {editingPage.heroSubtitle}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl" style={{ backgroundColor: `${editingPage.primaryColor}10` }}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black" style={{ color: editingPage.primaryColor }}>
                            {editingPage.price.toLocaleString()} دج
                          </span>
                          <span className="text-sm opacity-50 line-through">
                            {editingPage.originalPrice.toLocaleString()} دج
                          </span>
                        </div>
                        <p className="text-[10px] font-bold mt-1" style={{ color: editingPage.accentColor }}>
                          وفّر {savings.toLocaleString()} دج اليوم!
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-lg shadow-sm">
                          <Truck className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-[10px] font-bold">توصيل مجاني</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-lg shadow-sm">
                          <Shield className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="text-[10px] font-bold">ضمان الجودة</span>
                        </div>
                      </div>

                      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold flex items-center gap-2">
                          <ShoppingCart className="w-3.5 h-3.5 text-primary" />
                          معلومات الطلب
                        </h3>
                        <div className="space-y-2">
                          <div className="h-8 bg-muted/50 rounded-lg" />
                          <div className="h-8 bg-muted/50 rounded-lg" />
                        </div>
                        <button
                          className={`w-full py-3 text-sm font-black text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${
                            editingPage.ctaStyle === "pill" ? "rounded-full" : editingPage.ctaStyle === "rounded" ? "rounded-xl" : "rounded-none"
                          }`}
                          style={{ backgroundColor: editingPage.primaryColor }}
                        >
                          {editingPage.ctaText} — {editingPage.price.toLocaleString()} دج
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Configuration Panels */}
          <div className="w-full lg:w-[400px] border-r border-border bg-card flex flex-col shrink-0">
            {/* Tabs content */}
            <div className="p-4 border-b border-border">
              <div className="flex bg-muted rounded-xl p-1">
                {([
                  { id: "content" as const, label: "المحتوى", icon: Type },
                  { id: "design" as const, label: "التصميم", icon: Paintbrush },
                  { id: "sections" as const, label: "الأقسام", icon: Layers },
                ]).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDesignTab(tab.id === "design" ? "template" : tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                      (activeDesignTab === tab.id || (tab.id === "design" && ["template", "colors"].includes(activeDesignTab)))
                        ? "bg-card shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Content Panel */}
              {activeDesignTab === "content" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">اسم المنتج</Label>
                    <Input value={editingPage.productName} onChange={(e) => updatePage("productName", e.target.value)} className="rounded-xl h-9 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold opacity-70">السعر الحالي (دج)</Label>
                      <Input type="number" value={editingPage.price} onChange={(e) => updatePage("price", parseInt(e.target.value) || 0)} className="rounded-xl h-9 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold opacity-70">السعر الأصلي (دج)</Label>
                      <Input type="number" value={editingPage.originalPrice} onChange={(e) => updatePage("originalPrice", parseInt(e.target.value) || 0)} className="rounded-xl h-9 text-sm" />
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
                  <div className="space-y-3">
                    <Label className="text-xs font-bold opacity-70">مميزات المنتج</Label>
                    <div className="space-y-2">
                      {editingPage.features.map((feature, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input 
                            value={feature} 
                            onChange={(e) => {
                              const newFeatures = [...editingPage.features];
                              newFeatures[idx] = e.target.value;
                              updatePage("features", newFeatures);
                            }}
                            className="rounded-xl h-8 text-xs flex-1"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              const newFeatures = editingPage.features.filter((_, i) => i !== idx);
                              updatePage("features", newFeatures);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full rounded-xl border-dashed h-8 text-xs gap-1.5"
                        onClick={() => updatePage("features", [...editingPage.features, "ميزة جديدة"])}
                      >
                        <Plus className="w-3.5 h-3.5" /> إضافة ميزة
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold opacity-70">نص زر الشراء</Label>
                    <Input value={editingPage.ctaText} onChange={(e) => updatePage("ctaText", e.target.value)} className="rounded-xl h-9 text-sm" />
                  </div>
                </div>
              )}

              {/* Design Panel */}
              {(activeDesignTab === "template" || activeDesignTab === "colors") && (
                <div className="space-y-6">
                  <div className="bg-muted rounded-xl p-1 flex">
                    <button 
                      onClick={() => setActiveDesignTab("template")}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${activeDesignTab === "template" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}
                    >
                      القوالب والخطوط
                    </button>
                    <button 
                      onClick={() => setActiveDesignTab("colors")}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${activeDesignTab === "colors" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}
                    >
                      الألوان والأشكال
                    </button>
                  </div>

                  {activeDesignTab === "template" && (
                    <div className="space-y-5">
                       <div className="space-y-3">
                        <Label className="text-xs font-bold opacity-70">نوع التصميم</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {templates.map((tmpl) => (
                            <button
                              key={tmpl.id}
                              onClick={() => updatePage("template", tmpl.id)}
                              className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                                editingPage.template === tmpl.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"
                              }`}
                            >
                              <span className="text-xl">{tmpl.icon}</span>
                              <span className="text-[10px] font-bold">{tmpl.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold opacity-70">نوع الخط</Label>
                        <Select value={editingPage.fontFamily} onValueChange={(v) => updatePage("fontFamily", v)}>
                          <SelectTrigger className="rounded-xl h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fontOptions.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {activeDesignTab === "colors" && (
                    <div className="space-y-5">
                      <div className="space-y-3">
                        <Label className="text-xs font-bold opacity-70">اللون الأساسي</Label>
                        <div className="flex flex-wrap gap-2">
                          {colorPresets.map(color => (
                            <button
                              key={color.value}
                              onClick={() => updatePage("primaryColor", color.value)}
                              className={`w-8 h-8 rounded-lg transition-all ${editingPage.primaryColor === color.value ? "ring-2 ring-primary ring-offset-2 scale-110" : ""}`}
                              style={{ backgroundColor: color.value }}
                            />
                          ))}
                          <div className="relative">
                            <input type="color" value={editingPage.primaryColor} onChange={(e) => updatePage("primaryColor", e.target.value)} className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer" />
                            <div className="w-8 h-8 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground"><Paintbrush className="w-3 h-3" /></div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-bold opacity-70">شكل زر الشراء</Label>
                        <div className="flex gap-2">
                          {(["pill", "rounded", "square"] as const).map(style => (
                            <button
                              key={style}
                              onClick={() => updatePage("ctaStyle", style)}
                              className={`flex-1 py-2 text-[10px] font-bold border-2 transition-all ${
                                editingPage.ctaStyle === style ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                              } ${style === "pill" ? "rounded-full" : style === "rounded" ? "rounded-lg" : "rounded-none"}`}
                            >
                              {style === "pill" ? "دائري" : style === "rounded" ? "مستدير" : "مربع"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-bold opacity-70">لون الخلفية</Label>
                        <div className="flex gap-2">
                          {["#ffffff", "#f8fafc", "#0f172a", "#1e1b4b", "#fef3c7"].map(bg => (
                            <button
                              key={bg}
                              onClick={() => updatePage("backgroundColor", bg)}
                              className={`w-8 h-8 rounded-lg border transition-all ${editingPage.backgroundColor === bg ? "ring-2 ring-primary ring-offset-2 scale-110" : "border-border"}`}
                              style={{ backgroundColor: bg }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sections Panel */}
              {activeDesignTab === "sections" && (
                <div className="space-y-3">
                  {availableSections.map((section) => {
                    const isActive = editingPage.sections.includes(section.id);
                    return (
                      <button
                        key={section.id}
                        onClick={() => toggleSection(section.id)}
                        disabled={section.required}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-right ${
                          isActive ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"
                        } ${section.required ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          <section.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold">{section.name}</p>
                          {section.required && <p className="text-[10px] opacity-50">أساسي</p>}
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isActive ? "bg-primary border-primary text-white" : "border-border text-transparent"}`}>
                          <Check className="w-3 h-3" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-muted/20 shrink-0">
               <div className="flex items-center justify-between text-xs mb-3">
                 <span className="font-bold opacity-60">حالة الصفحة</span>
                 <span className={`px-2 py-0.5 rounded-full font-bold ${editingPage.status === "published" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                   {editingPage.status === "published" ? "منشورة" : "مسودة"}
                 </span>
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)} className="rounded-xl h-9 text-xs gap-1.5 lg:hidden">
                   <Eye className="w-3.5 h-3.5" /> معاينة
                 </Button>
                 <Button variant="default" size="sm" className="rounded-xl h-9 text-xs gap-1.5 w-full col-span-2 lg:col-span-1 shadow-sm" onClick={() => {
                    toast({ title: "💾 تم الحفظ", description: "تم حفظ التغييرات بنجاح" });
                 }}>
                   <Save className="w-3.5 h-3.5" /> حفظ التغييرات
                 </Button>
               </div>
            </div>
          </div>
        </div>

        {/* Keeping existing Preview Dialog for mobile users editing on mobile or as a full-screen view */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-[450px] p-0 overflow-hidden border-none rounded-3xl" dir="rtl">
            <div className="h-[80vh] w-full overflow-y-auto scrollbar-hide" style={{ backgroundColor: editingPage.backgroundColor, fontFamily: editingPage.fontFamily }}>
               {/* Full mobile preview - essentially same content as split-view preview but standalone */}
               <div className="p-6 space-y-6">
                  {/* Hero Image */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                    {editingPage.heroImage && <img src={editingPage.heroImage} alt="" className="w-full h-full object-cover" />}
                    <div className="absolute top-4 left-4 bg-destructive text-white px-3 py-1 rounded-full text-xs font-bold">
                       خصم {Math.round((1 - editingPage.price / editingPage.originalPrice) * 100)}%
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1 text-center">
                    <span className="text-[10px] font-bold uppercase" style={{ color: editingPage.primaryColor }}>{editingPage.category}</span>
                    <h1 className="text-xl font-black leading-tight">{editingPage.heroTitle}</h1>
                    <p className="text-xs opacity-70 leading-relaxed">{editingPage.heroSubtitle}</p>
                  </div>

                  {/* Price */}
                  <div className="p-4 rounded-xl text-center" style={{ backgroundColor: `${editingPage.primaryColor}10` }}>
                    <div className="flex justify-center items-center gap-3">
                      <span className="text-2xl font-black" style={{ color: editingPage.primaryColor }}>{editingPage.price.toLocaleString()} دج</span>
                      <span className="text-sm opacity-50 line-through">{editingPage.originalPrice.toLocaleString()} دج</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    className={`w-full py-4 text-sm font-black text-white shadow-xl ${
                      editingPage.ctaStyle === "pill" ? "rounded-full" : editingPage.ctaStyle === "rounded" ? "rounded-2xl" : "rounded-none"
                    }`}
                    style={{ backgroundColor: editingPage.primaryColor }}
                  >
                    {editingPage.ctaText}
                  </button>
               </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }


  // List view
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...cardAnim()} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-primary" />
            صفحات الهبوط
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{pages.length} صفحة • خصّص تصميم كل منتج</p>
        </div>
        <Button onClick={createNewPage} className="gap-2 rounded-xl bg-gradient-to-l from-primary to-primary/90 shadow-md hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" />
          صفحة هبوط جديدة
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
              <motion.div
                key={page.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="dash-card-interactive overflow-hidden group"
              >
                <div className={`h-32 bg-gradient-to-br ${tmpl?.preview || "from-primary to-primary/80"} p-5 flex items-end relative`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative z-10">
                    <p className="text-white font-bold text-lg">{page.productName}</p>
                    <p className="text-white/80 text-sm">{tmpl?.name || "قالب"} • {tmpl?.icon}</p>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      page.status === "published"
                        ? "bg-emerald-500 text-white"
                        : "bg-white/20 text-white backdrop-blur-sm"
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
                  <div className="flex items-center gap-2 flex-wrap">
                    {page.sections.slice(0, 4).map(s => {
                      const sec = availableSections.find(a => a.id === s);
                      return sec ? (
                        <span key={s} className="text-xs bg-muted px-2 py-1 rounded-lg text-muted-foreground">{sec.name}</span>
                      ) : null;
                    })}
                    {page.sections.length > 4 && (
                      <span className="text-xs text-muted-foreground">+{page.sections.length - 4}</span>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button variant="outline" size="sm" onClick={() => setEditingPage(page)} className="flex-1 rounded-xl gap-1.5">
                      <Paintbrush className="w-3.5 h-3.5" /> تخصيص
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
