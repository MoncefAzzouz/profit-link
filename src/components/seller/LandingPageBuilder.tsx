import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout, Palette, Type, Image, Eye, Save, Plus, Trash2,
  ChevronDown, ChevronUp, Sparkles, Monitor, Smartphone,
  Copy, Check, ExternalLink, Layers, Paintbrush, Star,
  ShoppingCart, Shield, Truck, Clock, MessageSquare, Zap,
  GripVertical, Settings2, LayoutTemplate
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
    return (
      <div className="space-y-6">
        {/* Editor header */}
        <motion.div {...cardAnim()} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setEditingPage(null)} className="rounded-xl gap-1.5">
              <ChevronDown className="w-4 h-4 rotate-90" /> رجوع
            </Button>
            <div>
              <h2 className="text-lg font-bold text-foreground">{editingPage.productName}</h2>
              <p className="text-sm text-muted-foreground">تخصيص صفحة الهبوط</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)} className="rounded-xl gap-1.5">
              <Eye className="w-4 h-4" /> معاينة
            </Button>
            <Button size="sm" onClick={() => publishPage(editingPage)} className="rounded-xl gap-1.5 bg-gradient-to-l from-primary to-primary/90 shadow-md">
              {editingPage.status === "published" ? <><Zap className="w-4 h-4" /> منشورة</> : <><Sparkles className="w-4 h-4" /> نشر</>}
            </Button>
          </div>
        </motion.div>

        {/* Design tabs */}
        <motion.div {...cardAnim(0.1)} className="dash-card p-1.5">
          <div className="flex gap-1">
            {([
              { id: "template" as const, label: "القالب", icon: LayoutTemplate },
              { id: "colors" as const, label: "الألوان", icon: Palette },
              { id: "sections" as const, label: "الأقسام", icon: Layers },
              { id: "content" as const, label: "المحتوى", icon: Type },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveDesignTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                  activeDesignTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Template selection */}
        {activeDesignTab === "template" && (
          <motion.div {...cardAnim(0.15)} className="space-y-4">
            <h3 className="text-base font-bold text-foreground">اختر قالب التصميم</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => updatePage("template", tmpl.id)}
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-lg group ${
                    editingPage.template === tmpl.id
                      ? "border-primary shadow-lg ring-2 ring-primary/20"
                      : "border-border/50 hover:border-border"
                  }`}
                >
                  <div className={`h-28 bg-gradient-to-br ${tmpl.preview} flex items-center justify-center`}>
                    <span className="text-4xl">{tmpl.icon}</span>
                  </div>
                  <div className="p-3 bg-card">
                    <p className="font-bold text-foreground text-sm">{tmpl.name}</p>
                    <p className="text-xs text-muted-foreground">{tmpl.desc}</p>
                  </div>
                  {editingPage.template === tmpl.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="dash-card-interactive p-5 space-y-4">
              <h4 className="font-bold text-foreground text-sm">الخط</h4>
              <Select value={editingPage.fontFamily} onValueChange={(v) => updatePage("fontFamily", v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>

              <h4 className="font-bold text-foreground text-sm">شكل زر الشراء</h4>
              <div className="flex gap-3">
                {(["pill", "rounded", "square"] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => updatePage("ctaStyle", style)}
                    className={`flex-1 py-3 text-sm font-medium border-2 transition-all ${
                      editingPage.ctaStyle === style
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-border/80"
                    } ${style === "pill" ? "rounded-full" : style === "rounded" ? "rounded-xl" : "rounded-none"}`}
                  >
                    {style === "pill" ? "دائري" : style === "rounded" ? "مستدير" : "مربع"}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Colors */}
        {activeDesignTab === "colors" && (
          <motion.div {...cardAnim(0.15)} className="space-y-5">
            <div className="dash-card-interactive p-5 space-y-4">
              <h4 className="font-bold text-foreground">اللون الأساسي</h4>
              <div className="flex flex-wrap gap-3">
                {colorPresets.map(color => (
                  <button
                    key={color.value}
                    onClick={() => updatePage("primaryColor", color.value)}
                    className={`w-12 h-12 rounded-xl transition-all hover:scale-110 ${
                      editingPage.primaryColor === color.value ? "ring-4 ring-primary/30 scale-110" : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
                <div className="relative">
                  <input
                    type="color"
                    value={editingPage.primaryColor}
                    onChange={(e) => updatePage("primaryColor", e.target.value)}
                    className="absolute inset-0 w-12 h-12 opacity-0 cursor-pointer"
                  />
                  <div className="w-12 h-12 rounded-xl border-2 border-dashed border-border flex items-center justify-center">
                    <Paintbrush className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>

            <div className="dash-card-interactive p-5 space-y-4">
              <h4 className="font-bold text-foreground">اللون الثانوي</h4>
              <div className="flex flex-wrap gap-3">
                {colorPresets.map(color => (
                  <button
                    key={color.value}
                    onClick={() => updatePage("accentColor", color.value)}
                    className={`w-12 h-12 rounded-xl transition-all hover:scale-110 ${
                      editingPage.accentColor === color.value ? "ring-4 ring-primary/30 scale-110" : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="dash-card-interactive p-5 space-y-4">
              <h4 className="font-bold text-foreground">لون الخلفية</h4>
              <div className="flex gap-3">
                {["#ffffff", "#f8fafc", "#0f172a", "#1e1b4b", "#fef3c7"].map(bg => (
                  <button
                    key={bg}
                    onClick={() => updatePage("backgroundColor", bg)}
                    className={`w-12 h-12 rounded-xl border-2 transition-all hover:scale-110 ${
                      editingPage.backgroundColor === bg ? "ring-4 ring-primary/30 scale-110" : "border-border"
                    }`}
                    style={{ backgroundColor: bg }}
                  />
                ))}
              </div>
            </div>

            {/* Live color preview */}
            <div className="dash-card-interactive overflow-hidden">
              <div className="p-6 text-center space-y-3" style={{ backgroundColor: editingPage.backgroundColor }}>
                <h3 className="text-xl font-bold" style={{ color: editingPage.primaryColor }}>معاينة الألوان</h3>
                <p className="text-sm" style={{ color: editingPage.backgroundColor === "#ffffff" || editingPage.backgroundColor === "#f8fafc" || editingPage.backgroundColor === "#fef3c7" ? "#64748b" : "#94a3b8" }}>
                  هكذا ستبدو صفحة المنتج
                </p>
                <button
                  className={`px-8 py-3 text-white font-bold ${editingPage.ctaStyle === "pill" ? "rounded-full" : editingPage.ctaStyle === "rounded" ? "rounded-xl" : ""}`}
                  style={{ backgroundColor: editingPage.primaryColor }}
                >
                  {editingPage.ctaText}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sections */}
        {activeDesignTab === "sections" && (
          <motion.div {...cardAnim(0.15)} className="space-y-4">
            <p className="text-sm text-muted-foreground">اختر الأقسام التي تريد إظهارها في صفحة الهبوط</p>
            <div className="grid gap-3">
              {availableSections.map((section) => {
                const isActive = editingPage.sections.includes(section.id);
                return (
                  <button
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    disabled={section.required}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-right ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-border"
                    } ${section.required ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      <section.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">{section.name}</p>
                      {section.required && <p className="text-xs text-muted-foreground">مطلوب</p>}
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isActive ? "bg-primary border-primary" : "border-border"
                    }`}>
                      {isActive && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Content */}
        {activeDesignTab === "content" && (
          <motion.div {...cardAnim(0.15)} className="space-y-5">
            <div className="dash-card-interactive p-5 space-y-4">
              <Label className="font-bold">اسم المنتج</Label>
              <Input value={editingPage.productName} onChange={(e) => updatePage("productName", e.target.value)} className="rounded-xl" />
            </div>
            <div className="dash-card-interactive p-5 space-y-4">
              <Label className="font-bold">العنوان الرئيسي</Label>
              <Input value={editingPage.heroTitle} onChange={(e) => updatePage("heroTitle", e.target.value)} className="rounded-xl" />
            </div>
            <div className="dash-card-interactive p-5 space-y-4">
              <Label className="font-bold">العنوان الفرعي</Label>
              <Textarea value={editingPage.heroSubtitle} onChange={(e) => updatePage("heroSubtitle", e.target.value)} className="rounded-xl" rows={2} />
            </div>
            <div className="dash-card-interactive p-5 space-y-4">
              <Label className="font-bold">رابط صورة البطل</Label>
              <Input value={editingPage.heroImage} onChange={(e) => updatePage("heroImage", e.target.value)} className="rounded-xl" dir="ltr" />
              {editingPage.heroImage && (
                <div className="mt-2 rounded-xl overflow-hidden border border-border h-40">
                  <img src={editingPage.heroImage} alt="معاينة" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="dash-card-interactive p-5 space-y-4">
              <Label className="font-bold">نص زر الشراء</Label>
              <Input value={editingPage.ctaText} onChange={(e) => updatePage("ctaText", e.target.value)} className="rounded-xl" />
            </div>
            <div className="dash-card-interactive p-5 space-y-4">
              <Label className="font-bold">خيارات إضافية</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "showReviews" as const, label: "آراء العملاء", icon: "⭐" },
                  { key: "showCountdown" as const, label: "عداد تنازلي", icon: "⏰" },
                  { key: "showGuarantee" as const, label: "ضمان الاسترجاع", icon: "🛡️" },
                  { key: "showFreeShipping" as const, label: "توصيل مجاني", icon: "🚚" },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => updatePage(opt.key, !editingPage[opt.key])}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm transition-all ${
                      editingPage[opt.key]
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    <span>{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>معاينة صفحة الهبوط</span>
                <div className="flex gap-2">
                  <Button variant={previewDevice === "desktop" ? "default" : "outline"} size="sm" onClick={() => setPreviewDevice("desktop")} className="rounded-lg">
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button variant={previewDevice === "mobile" ? "default" : "outline"} size="sm" onClick={() => setPreviewDevice("mobile")} className="rounded-lg">
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className={`mx-auto border border-border rounded-2xl overflow-hidden transition-all ${
              previewDevice === "mobile" ? "max-w-[375px]" : "w-full"
            }`}>
              <div className="p-8 space-y-6" style={{ backgroundColor: editingPage.backgroundColor }}>
                {/* Hero preview */}
                <div className="text-center space-y-4">
                  {editingPage.heroImage && (
                    <img src={editingPage.heroImage} alt="" className="w-full h-48 object-cover rounded-2xl" />
                  )}
                  <h1 className="text-2xl font-bold" style={{ color: editingPage.primaryColor }}>
                    {editingPage.heroTitle}
                  </h1>
                  <p className="text-sm" style={{ color: editingPage.backgroundColor === "#ffffff" || editingPage.backgroundColor === "#f8fafc" || editingPage.backgroundColor === "#fef3c7" ? "#475569" : "#94a3b8" }}>
                    {editingPage.heroSubtitle}
                  </p>
                  <button
                    className={`px-8 py-3 text-white font-bold text-sm ${editingPage.ctaStyle === "pill" ? "rounded-full" : editingPage.ctaStyle === "rounded" ? "rounded-xl" : ""}`}
                    style={{ backgroundColor: editingPage.primaryColor }}
                  >
                    {editingPage.ctaText}
                  </button>
                </div>
                {/* Section previews */}
                {editingPage.sections.includes("features") && (
                  <div className="grid grid-cols-2 gap-3">
                    {["✅ جودة عالية", "⚡ شحن سريع", "🛡️ ضمان سنة", "💰 سعر مناسب"].map((f, i) => (
                      <div key={i} className="p-3 rounded-xl text-center text-xs font-medium" style={{
                        backgroundColor: `${editingPage.primaryColor}15`,
                        color: editingPage.primaryColor
                      }}>
                        {f}
                      </div>
                    ))}
                  </div>
                )}
                {editingPage.sections.includes("reviews") && (
                  <div className="space-y-2">
                    {[{ name: "أحمد", text: "منتج ممتاز جدا 👍" }, { name: "سارة", text: "وصلني بسرعة والجودة رائعة" }].map((r, i) => (
                      <div key={i} className="p-3 rounded-xl border" style={{ borderColor: `${editingPage.primaryColor}30` }}>
                        <div className="flex items-center gap-1 mb-1">
                          {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                        </div>
                        <p className="text-xs" style={{ color: editingPage.backgroundColor.startsWith("#0") || editingPage.backgroundColor.startsWith("#1") ? "#cbd5e1" : "#475569" }}>
                          "{r.text}" — {r.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
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
