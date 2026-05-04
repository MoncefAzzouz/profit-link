import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, Edit2, 
  Trash2, ExternalLink, Copy, Check, Eye, 
  Zap, ShoppingCart, LayoutTemplate, Palette, 
  Settings, Image as ImageIcon, Type, MousePointer2,
  Share2, Save, X, ArrowLeft, ArrowRight,
  Monitor, Smartphone, Tablet, Paintbrush, PlusCircle, Sparkles,
  BarChart3, Clock, Target, Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config/api';

interface LandingPage {
  id: string;
  productId: string;
  productName: string;
  template: 'modern' | 'minimal' | 'bold' | 'dark';
  status: 'draft' | 'published';
  views: number;
  conversions: number;
  sections: string[];
  pageConfig?: any;
}

const templates = [
  { id: 'modern', name: 'مودرن جلاس', icon: '✨', preview: 'from-blue-500/20 to-purple-500/20', tag: 'الأكثر مبيعاً' },
  { id: 'minimal', name: 'بسيط وأنيق', icon: '☁️', preview: 'from-gray-100 to-gray-200' },
  { id: 'bold', name: 'جريء وحيوي', icon: '🔥', preview: 'from-primary/20 to-primary/40', tag: 'جديد' },
  { id: 'dark', name: 'كلاسيك داكن', icon: '🌙', preview: 'from-slate-800 to-slate-900' },
];

const availableSections = [
  { id: 'hero', name: 'القسم الرئيسي', icon: <Rocket className="w-4 h-4" /> },
  { id: 'benefits', name: 'مميزات المنتج', icon: <Check className="w-4 h-4" /> },
  { id: 'gallery', name: 'معرض الصور', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'video', name: 'فيديو المنتج', icon: <Eye className="w-4 h-4" /> },
  { id: 'testimonials', name: 'آراء العملاء', icon: <Target className="w-4 h-4" /> },
  { id: 'faq', name: 'الأسئلة الشائعة', icon: <Settings className="w-4 h-4" /> },
  { id: 'offer', name: 'العرض الخاص', icon: <Zap className="w-4 h-4" /> },
  { id: 'order', name: 'نموذج الطلب', icon: <ShoppingCart className="w-4 h-4" /> },
];

const LandingPageBuilder = () => {
  const { toast } = useToast();
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingDetails, setIsFetchingDetails] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTemplate, setFilterTemplate] = useState("all");
  const [activePage, setActivePage] = useState<LandingPage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(() => {
    const stored = localStorage.getItem("affiliate_user");
    return stored ? JSON.parse(stored) : null;
  });
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const fetchPages = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Use the 'all' endpoint for admins or 'mine' for affiliates
      const endpoint = isAdmin ? '/store/pages/all' : '/store/pages';
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        setPages(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch pages', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleEdit = async (page: LandingPage) => {
    setIsFetchingDetails(page.id);
    const token = localStorage.getItem("token");
    
    try {
      // Fetch the FULL configuration for this specific page
      const res = await fetch(`${API_BASE_URL}/store/pages/${page.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      
      if (res.ok && json.data) {
        setActivePage(json.data);
        setIsEditing(true);
      } else {
        toast({
          title: "خطأ",
          description: "فشل في تحميل تفاصيل الصفحة",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Failed to fetch page details', err);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل البيانات",
        variant: "destructive"
      });
    } finally {
      setIsFetchingDetails(null);
    }
  };

  const copyLink = (page: LandingPage) => {
    const affiliateId = user?.id || "demo";
    const url = `${window.location.origin}/product/${page.productId}/${affiliateId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(page.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "تم النسخ",
      description: "تم نسخ رابط صفحة الهبوط",
    });
  };

  const viewPage = (page: LandingPage) => {
    const affiliateId = user?.id || "demo";
    window.open(`/product/${page.productId}/${affiliateId}`, '_blank');
  };

  const deletePage = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الصفحة؟")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/store/pages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPages(pages.filter(p => p.id !== id));
        toast({ title: "تم الحذف بنجاح" });
      }
    } catch (err) {
      toast({ title: "خطأ في الحذف", variant: "destructive" });
    }
  };

  const publishPage = async (page: LandingPage) => {
    const newStatus = page.status === 'published' ? 'draft' : 'published';
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/store/pages/${page.id}/status`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setPages(pages.map(p => p.id === page.id ? { ...p, status: newStatus } : p));
        toast({ 
          title: newStatus === 'published' ? "تم النشر" : "تم الإلغاء",
          description: newStatus === 'published' ? "الصفحة الآن متاحة للجمهور" : "تم تحويل الصفحة إلى مسودة"
        });
      }
    } catch (err) {
      toast({ title: "خطأ", variant: "destructive" });
    }
  };

  const cardAnim = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.4, ease: "easeOut" }
  } as const);

  if (isEditing && activePage) {
    return (
      <div className="fixed inset-0 z-[60] bg-background flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="rounded-xl">
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="font-bold text-lg">{activePage.productName}</h2>
              <p className="text-xs text-muted-foreground">تعديل صفحة الهبوط</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-muted p-1 rounded-xl mr-4">
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg"><Monitor className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground"><Tablet className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground"><Smartphone className="w-4 h-4" /></Button>
            </div>
            <Button variant="outline" className="rounded-xl gap-2">
              <Eye className="w-4 h-4" />
              معاينة
            </Button>
            <Button className="rounded-xl gap-2 bg-primary hover:bg-primary/90 px-6">
              <Save className="w-4 h-4" />
              حفظ التغييرات
            </Button>
          </div>
        </div>

        {/* Builder Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-l border-border bg-card overflow-y-auto p-6 space-y-8">
            <div className="space-y-4">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">القالب المختار</Label>
              <div className="grid grid-cols-2 gap-2">
                {templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActivePage({ ...activePage, template: t.id as any })}
                    className={`p-3 rounded-xl border-2 transition-all text-right ${activePage.template === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                  >
                    <span className="text-lg block mb-1">{t.icon}</span>
                    <span className="text-xs font-bold block">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">أقسام الصفحة</Label>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md"><Plus className="w-3 h-3" /></Button>
              </div>
              <div className="space-y-2">
                {activePage.sections.map((s, idx) => {
                  const section = availableSections.find(a => a.id === s);
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border/50 group hover:border-primary/30 transition-all cursor-move">
                      <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-primary">
                        {section?.icon || <LayoutTemplate className="w-4 h-4" />}
                      </div>
                      <span className="text-sm font-medium flex-1">{section?.name || s}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 rounded-lg">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-muted/30 p-8 overflow-y-auto scrollbar-hide">
            <div className={`max-w-4xl mx-auto bg-card min-h-[1200px] rounded-[3rem] shadow-2xl border border-border overflow-hidden`}>
              {/* Mock Landing Page Preview */}
              <div className={`h-96 bg-gradient-to-br ${templates.find(t => t.id === activePage.template)?.preview} flex flex-col items-center justify-center text-center p-12`}>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-black mb-6">
                  {activePage.productName}
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl text-muted-foreground max-w-2xl">
                  هذا مثال لصفحة الهبوط الخاصة بمنتجك. يمكنك تخصيص كل قسم لزيادة المبيعات والتحويلات.
                </motion.p>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="mt-10">
                  <Button size="lg" className="rounded-full px-12 py-7 text-xl font-bold h-auto shadow-xl hover:scale-105 transition-transform">
                    اطلب الآن
                  </Button>
                </motion.div>
              </div>
              
              <div className="p-12 space-y-24">
                <div className="grid grid-cols-3 gap-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                        <Check className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold">ميزة قوية {i}</h3>
                      <p className="text-muted-foreground">وصف مختصر يشرح قيمة هذه الميزة للعميل وكيف ستحل مشكلته.</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 lg:p-4 space-y-8">
      {/* Header */}
      <motion.div {...cardAnim()} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground mb-1">صفحات الهبوط</h1>
          <p className="text-muted-foreground">صمم صفحات احترافية لزيادة مبيعاتك بنقرة واحدة</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="بحث في الصفحات..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 h-12 w-[280px] bg-card border-border/50 rounded-2xl shadow-sm focus:ring-primary/20"
            />
          </div>
          <Button className="h-12 px-6 rounded-2xl gap-2 bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <Plus className="w-5 h-5" />
            صفحة جديدة
          </Button>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="bg-card p-5 rounded-[2rem] border border-border/50 animate-pulse">
              <div className="w-8 h-8 bg-muted rounded-xl mb-3" />
              <div className="h-6 w-16 bg-muted rounded-lg mb-2" />
              <div className="h-3 w-24 bg-muted rounded-md" />
            </div>
          ))
        ) : (
          [
            { label: "إجمالي الزيارات", value: pages.reduce((s, p) => s + p.views, 0).toLocaleString(), icon: Eye },
            { label: "التحويلات", value: pages.reduce((s, p) => s + p.conversions, 0).toLocaleString(), icon: ShoppingCart },
            { label: "معدل التحويل", value: `${pages.reduce((s, p) => s + p.views, 0) > 0 ? ((pages.reduce((s, p) => s + p.conversions, 0) / pages.reduce((s, p) => s + p.views, 0)) * 100).toFixed(1) : 0}%`, icon: Zap },
            { label: "نشط حالياً", value: pages.filter(p => p.status === 'published').length.toString(), icon: Rocket }
          ].map((stat, i) => (
            <motion.div key={i} {...cardAnim(i * 0.1)} className="bg-card p-5 rounded-[2rem] border border-border/50">
              <stat.icon className="w-5 h-5 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))
        )}
      </div>

      {/* Page cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            [1,2,3,4].map(i => (
              <div key={i} className="bg-card rounded-[2.5rem] border border-border/50 overflow-hidden animate-pulse">
                <div className="h-32 bg-muted" />
                <div className="p-6 space-y-4">
                  <div className="flex justify-between"><div className="h-4 w-20 bg-muted rounded" /><div className="h-4 w-16 bg-muted rounded" /></div>
                  <div className="flex gap-2"><div className="h-3 w-12 bg-muted rounded" /><div className="h-3 w-12 bg-muted rounded" /></div>
                  <div className="pt-4 border-t border-border flex gap-2"><div className="h-9 flex-1 bg-muted rounded-xl" /><div className="h-9 w-12 bg-muted rounded-xl" /></div>
                </div>
              </div>
            ))
          ) : (
            pages.map((page, i) => {
              const tmpl = templates.find(t => t.id === page.template);
              return (
                <motion.div key={page.id} layout
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }} className="dash-card-interactive overflow-hidden group">
                  <div className={`h-32 bg-gradient-to-br ${tmpl?.preview || "from-primary to-primary/80"} p-5 flex items-end relative`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative z-10">
                      <p className="text-white font-bold text-lg line-clamp-1">{page.productName}</p>
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
                      {page.sections?.length > 5 && (
                        <span className="text-[10px] text-muted-foreground">+{page.sections.length - 5}</span>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(page)} 
                        disabled={isFetchingDetails === page.id}
                        className="flex-1 rounded-xl gap-1.5"
                      >
                        {isFetchingDetails === page.id ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full" />
                        ) : (
                          <Paintbrush className="w-3.5 h-3.5" />
                        )}
                        تخصيص
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
            })
          )}
        </AnimatePresence>
      </div>

      {pages.length === 0 && !isLoading && (
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
