import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Copy, Check, Search, Filter, Eye, TrendingUp, SlidersHorizontal, 
  X, Facebook, Instagram, Phone, MessageSquare, Globe, Shield, 
  Info, Truck, ShieldCheck, CreditCard, MessageCircle, Star, 
  Flame, Shirt, Smartphone, Home, Sparkles, LayoutGrid, List,
  ChevronDown, ArrowRight, Heart, Share2, ZoomIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories, Product } from "@/data/mockProducts";
import { StoreSettings, defaultStoreSettings } from "@/data/storeSettings";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const priceRanges = [
  { label: "الكل", min: 0, max: Infinity },
  { label: "أقل من 2,000 دج", min: 0, max: 2000 },
  { label: "2,000 - 5,000 دج", min: 2000, max: 5000 },
  { label: "5,000 - 10,000 دج", min: 5000, max: 10000 },
  { label: "أكثر من 10,000 دج", min: 10000, max: Infinity },
];

const sortOptions = [
  { value: "default", label: "الافتراضي" },
  { value: "price-asc", label: "السعر: من الأقل" },
  { value: "price-desc", label: "السعر: من الأعلى" },
  { value: "commission-desc", label: "العمولة: من الأعلى" },
  { value: "stock-desc", label: "المخزون: الأكثر" },
];

const Products = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 20000]); // Max price from slider
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [stockFilter, setStockFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showOnlyTrending, setShowOnlyTrending] = useState(false);
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("affiliate_store_settings");
    if (saved) {
      setStoreSettings(JSON.parse(saved));
    }

    // Fetch products from backend
    const fetchProducts = async () => {
      try {
        const res = await fetch('https://profit-link-3eri.onrender.com/api/products');
        const json = await res.json();
        if (res.ok && json.data) {
          setProducts(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      }
    };
    fetchProducts();
  }, []);

  const [affiliateId, setAffiliateId] = useState("aff-demo-123");

  useEffect(() => {
    const userStr = localStorage.getItem("affiliate_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          setAffiliateId(user.id);
        }
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              product.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "الكل" || product.category === selectedCategory;
        const matchesPrice = product.price >= selectedPriceRange[0] && product.price <= selectedPriceRange[1];
        const matchesStock = stockFilter === "all" || 
                           (stockFilter === "in-stock" && product.stock > 0) || 
                           (stockFilter === "low" && product.stock <= 50 && product.stock > 0);
        const matchesTrending = !showOnlyTrending || product.isTrend;
        const matchesFeatured = !showOnlyFeatured || product.isFeatured;

        return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesTrending && matchesFeatured;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "commission-desc") return b.commission - a.commission;
        if (sortBy === "stock-desc") return b.stock - a.stock;
        return 0;
      });
  }, [searchQuery, selectedCategory, selectedPriceRange, stockFilter, showOnlyTrending, showOnlyFeatured, sortBy, products]);

  const categoryIcons: Record<string, any> = {
    "الكل": LayoutGrid,
    "إلكترونيات": Smartphone,
    "أزياء": Shirt,
    "جمال": Sparkles,
    "أجهزة منزلية": Home
  };

  const copyAffiliateLink = (productId: string, productName: string) => {
    const link = `${window.location.origin}/product/${productId}/${affiliateId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(productId);
    toast({
      title: "تم نسخ الرابط! 🔗",
      description: `رابط "${productName}" جاهز للمشاركة`
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div 
      className={cn(
        "min-h-screen transition-all duration-500",
        storeSettings.templateId === "dark" ? "bg-slate-950 text-slate-100 dark" : "bg-background text-foreground"
      )} 
      dir="rtl"
      style={{ 
        "--store-primary": storeSettings.primaryColor,
        fontFamily: storeSettings.fontFamily + ", sans-serif" 
      } as React.CSSProperties}
    >
      {/* Top Welcome Bar */}
      {storeSettings.welcomeBarText && (
        <div 
          className="text-primary-foreground py-2 text-center text-xs font-bold tracking-wide relative z-50 overflow-hidden"
          style={{ backgroundColor: "var(--store-primary)" }}
        >
           <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: "-100%" }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="whitespace-nowrap inline-block md:hidden"
           >
             {storeSettings.welcomeBarText} • {storeSettings.welcomeBarText} • {storeSettings.welcomeBarText}
           </motion.div>
           <div className="hidden md:block">
            {storeSettings.welcomeBarText}
           </div>
        </div>
      )}

      {/* Modern Hero Section */}
      {(storeSettings.hero?.enabled || storeSettings.storeName || storeSettings.storeLogo) && (
        <div className="relative h-[400px] lg:h-[600px] flex items-center justify-center overflow-hidden">
           <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0"
           >
             <img 
               src={storeSettings.hero?.bannerUrl} 
               alt="Hero Banner" 
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-background" />
           </motion.div>

           <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center">
             
             {/* Store Logo inside Hero */}
             {storeSettings.storeLogo && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
                 className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-background/20 shadow-2xl mb-6 mx-auto backdrop-blur-sm bg-black/20"
               >
                 <img src={storeSettings.storeLogo} alt={storeSettings.storeName} className="w-full h-full object-cover" />
               </motion.div>
             )}

             {/* Store Name & Intro inside Hero */}
             {storeSettings.storeName && (
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl"
                >
                  {storeSettings.storeName}
                </motion.h1>
             )}
             
             {storeSettings.storeIntro && (
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow-lg mb-8 font-medium bg-black/10 p-4 rounded-3xl backdrop-blur-md"
                >
                  {storeSettings.storeIntro}
                </motion.p>
             )}

             {/* Visual dash separator if both exists */}
             {(storeSettings.hero?.title || storeSettings.hero?.subtitle) && (storeSettings.storeName || storeSettings.storeIntro) && (
               <div className="w-16 h-1 bg-primary mx-auto mb-8 rounded-full opacity-80" />
             )}

             {/* Hero Subtitles/Promos */}
             {storeSettings.hero?.title && (
               <motion.h2 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8, delay: 0.3 }}
                 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-xl"
               >
                 {storeSettings.hero.title}
               </motion.h2>
             )}
             
             {storeSettings.hero?.subtitle && (
               <motion.p 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8, delay: 0.4 }}
                 className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto drop-shadow-md"
               >
                 {storeSettings.hero.subtitle}
               </motion.p>
             )}
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5, delay: 0.4 }}
               className="mt-10"
             >
                <Button 
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 px-10 py-8 text-xl font-black rounded-full shadow-2xl hover:scale-105 transition-all"
                  onClick={() => document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  تسوق الآن
                </Button>
             </motion.div>
           </div>
        </div>
      )}

      {/* Trust Badges Bar (USP) */}
      {storeSettings.usp?.enabled && (
        <div className="bg-muted/30 py-8 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {storeSettings.usp?.items?.map((item: any, idx: number) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: idx * 0.1 }}
                   className="flex items-center justify-center gap-4 group"
                 >
                   <div 
                    className="w-14 h-14 rounded-2xl bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"
                    style={{ color: "var(--store-primary)" }}
                   >
                     {item.icon === "Truck" && <Truck className="w-7 h-7" />}
                     {item.icon === "ShieldCheck" && <ShieldCheck className="w-7 h-7" />}
                     {item.icon === "CreditCard" && <CreditCard className="w-7 h-7" />}
                   </div>
                   <div className="text-right">
                     <p className="font-bold text-lg">{item.text}</p>
                     <p className="text-sm text-muted-foreground">خدمة موثوقة ومضمونة</p>
                   </div>
                 </motion.div>
               ))}
            </div>
          </div>
        </div>
      )}


      <div className="container mx-auto px-4 py-8">
        {/* Modern Search & View Actions */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="relative flex-1 w-full group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتج، فئة، أو عمولة..."
              className="pr-12 h-14 rounded-2xl bg-card border-none shadow-sm focus-visible:ring-primary/20 text-lg"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-card p-1 rounded-xl shadow-sm border border-border/50 flex gap-1">
              <Button 
                variant={viewMode === "grid" ? "secondary" : "ghost"} 
                size="icon" 
                onClick={() => setViewMode("grid")}
                className="rounded-lg w-10 h-10"
              >
                <LayoutGrid className="w-5 h-5" />
              </Button>
              <Button 
                variant={viewMode === "list" ? "secondary" : "ghost"} 
                size="icon" 
                onClick={() => setViewMode("list")}
                className="rounded-lg w-10 h-10"
              >
                <List className="w-5 h-5" />
              </Button>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button className="lg:hidden h-14 rounded-2xl gap-2 flex-1 md:flex-none">
                  <Filter className="w-5 h-5" />
                  الفلاتر
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]" dir="rtl">
                <SheetHeader>
                  <SheetTitle className="text-right">فلاتر المنتجات</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-8 text-right">
                   <FilterContent 
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedPriceRange={selectedPriceRange}
                    setSelectedPriceRange={setSelectedPriceRange}
                    stockFilter={stockFilter}
                    setStockFilter={setStockFilter}
                    showOnlyTrending={showOnlyTrending}
                    setShowOnlyTrending={setShowOnlyTrending}
                    showOnlyFeatured={showOnlyFeatured}
                    setShowOnlyFeatured={setShowOnlyFeatured}
                    categoryIcons={categoryIcons}
                   />
                </div>
              </SheetContent>
            </Sheet>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-14 rounded-2xl bg-card border-none shadow-sm w-[180px]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="ترتيب حسب" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-8 sticky top-24 h-fit">
            <div className="bg-card rounded-[2rem] p-8 border border-border/50 shadow-sm space-y-8">
               <FilterContent 
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedPriceRange={selectedPriceRange}
                setSelectedPriceRange={setSelectedPriceRange}
                stockFilter={stockFilter}
                setStockFilter={setStockFilter}
                showOnlyTrending={showOnlyTrending}
                setShowOnlyTrending={setShowOnlyTrending}
                showOnlyFeatured={showOnlyFeatured}
                setShowOnlyFeatured={setShowOnlyFeatured}
                categoryIcons={categoryIcons}
               />
               
               <Button 
                variant="ghost" 
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("الكل");
                  setSelectedPriceRange([0, 20000]);
                  setStockFilter("all");
                  setShowOnlyTrending(false);
                  setShowOnlyFeatured(false);
                }}
              >
                مسح كافة الفلاتر
              </Button>
            </div>

            {/* Support Bonus card */}
            <div className="bg-gradient-to-br from-primary to-navy-900 rounded-[2rem] p-6 text-white relative overflow-hidden group">
               <div className="relative z-10">
                 <h4 className="font-bold flex items-center gap-2">
                   <ShieldCheck className="w-5 h-5 text-secondary" /> دعم مباشر 24/7
                 </h4>
                 <p className="text-xs text-white/70 mt-2">فريقنا جاهز لمساعدتك في زيادة مبيعاتك.</p>
                 <Button className="w-full mt-4 bg-white/10 hover:bg-white/20 border-white/20 text-xs h-9 rounded-lg">
                   تواصل معنا
                 </Button>
               </div>
               <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            </div>
          </aside>

          {/* Main Grid Area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-full">
                  <span className="font-bold text-foreground">{filteredProducts.length}</span> منتج تم العثور عليه
               </div>
            </div>

            <div className={cn(
              "grid gap-8",
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                : "grid-cols-1"
            )}>
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    index={index}
                    viewMode={viewMode}
                    storeSettings={storeSettings}
                    copyAffiliateLink={copyAffiliateLink}
                    copiedId={copiedId}
                    affiliateId={affiliateId}
                    onQuickView={() => {
                      setQuickViewProduct(product);
                      setIsQuickViewOpen(true);
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>

            {filteredProducts.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-center py-20 bg-muted/20 rounded-[3rem] border-2 border-dashed border-border/50"
              >
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">لم نجد أي منتجات!</h3>
                <p className="text-muted-foreground mt-2">جرب تغيير إعدادات البحث أو الفلاتر</p>
                <Button 
                  variant="outline" 
                  className="mt-6 rounded-xl"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("الكل");
                    setSelectedPriceRange([0, 20000]);
                  }}
                >
                  إعادة ضبط الفلاتر
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Dialog */}
      <QuickViewModal 
        isOpen={isQuickViewOpen}
        onOpenChange={setIsQuickViewOpen}
        product={quickViewProduct}
        storeSettings={storeSettings}
        copyAffiliateLink={copyAffiliateLink}
        copiedId={copiedId}
        affiliateId={affiliateId}
      />

      {/* Floating WhatsApp Support */}
      {storeSettings.support?.whatsappFloating && storeSettings.socialLinks?.whatsapp && (
        <motion.a
          href={`https://wa.me/${storeSettings.socialLinks.whatsapp.replace(/\s+/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 z-[100] w-16 h-16 rounded-full bg-emerald-500 text-white shadow-2xl flex items-center justify-center group"
        >
          <div className="absolute -top-12 right-0 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            تواصل معنا مباشرة 👋
          </div>
          <MessageCircle className="w-8 h-8" />
          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-25" />
        </motion.a>
      )}

      {/* Branded Footer */}
      <footer className="bg-card border-t border-border mt-20 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md">
                  <img src={storeSettings.storeLogo} alt={storeSettings.storeName} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-black text-foreground">{storeSettings.storeName}</h3>
              </div>
              <p className="text-muted-foreground max-w-md leading-relaxed">
                {storeSettings.storeIntro}
              </p>
              <div className="flex gap-4">
                {storeSettings.socialLinks?.facebook && (
                  <a href={storeSettings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {storeSettings.socialLinks?.instagram && (
                  <a href={storeSettings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {storeSettings.socialLinks?.phone && (
                  <a href={`tel:${storeSettings.socialLinks.phone}`} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-secondary hover:text-white transition-colors">
                    <Phone className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-foreground">روابط قانونية</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href={storeSettings.footerInfo?.privacyPolicyLink || "#"} className="hover:text-primary transition-colors">سياسة الخصوصية</a></li>
                <li><a href={storeSettings.footerInfo?.termsLink || "#"} className="hover:text-primary transition-colors">الشروط والأحكام</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-foreground">اتصل بنا</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-secondary" />
                  <span>{storeSettings.socialLinks?.phone || "غير متوفر"}</span>
                </div>
                {storeSettings.socialLinks?.whatsapp && (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <span>واتساب</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} {storeSettings.storeName}. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Products;

// --- Sub-components ---

const FilterContent = ({ 
  selectedCategory, setSelectedCategory, 
  selectedPriceRange, setSelectedPriceRange,
  stockFilter, setStockFilter,
  showOnlyTrending, setShowOnlyTrending,
  showOnlyFeatured, setShowOnlyFeatured,
  categoryIcons 
}: any) => {
  return (
    <div className="space-y-10">
      {/* Categories */}
      <div className="space-y-4">
        <h4 className="font-bold text-foreground text-lg">الفئات</h4>
        <div className="space-y-2">
          {categories.map((category) => {
            const Icon = categoryIcons[category] || LayoutGrid;
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                  isActive ? "bg-white/20" : "bg-muted group-hover:bg-background"
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">{category}</span>
                {isActive && <motion.div layoutId="activeCat" className="mr-auto w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-foreground text-lg">نطاق السعر</h4>
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
            {selectedPriceRange[1].toLocaleString()} دج
          </span>
        </div>
        <Slider
          defaultValue={[0, 20000]}
          max={20000}
          step={500}
          value={selectedPriceRange}
          onValueChange={setSelectedPriceRange}
          className="py-4"
        />
        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <span>0 دج</span>
          <span>20,000+ دج</span>
        </div>
      </div>

      {/* Quick Toggles */}
      <div className="space-y-4">
        <h4 className="font-bold text-foreground text-lg">فرز سريع</h4>
        <div className="space-y-3">
          <button 
            onClick={() => setShowOnlyTrending(!showOnlyTrending)}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
              showOnlyTrending ? "border-orange-500 bg-orange-500/5" : "border-border hover:border-border/80"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", showOnlyTrending ? "bg-orange-500 text-white" : "bg-muted text-orange-500")}>
                <Flame className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm lowercase">Trending</span>
            </div>
            <div className={cn("w-10 h-5 rounded-full relative transition-colors", showOnlyTrending ? "bg-orange-500" : "bg-muted")}>
              <motion.div 
                animate={{ x: showOnlyTrending ? -20 : 0 }}
                className="absolute right-1 top-1 w-3 h-3 rounded-full bg-white shadow-sm"
              />
            </div>
          </button>

          <button 
            onClick={() => setShowOnlyFeatured(!showOnlyFeatured)}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
              showOnlyFeatured ? "border-yellow-500 bg-yellow-500/5" : "border-border hover:border-border/80"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", showOnlyFeatured ? "bg-yellow-500 text-white" : "bg-muted text-yellow-500")}>
                <Star className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm lowercase">Featured</span>
            </div>
            <div className={cn("w-10 h-5 rounded-full relative transition-colors", showOnlyFeatured ? "bg-yellow-500" : "bg-muted")}>
              <motion.div 
                animate={{ x: showOnlyFeatured ? -20 : 0 }}
                className="absolute right-1 top-1 w-3 h-3 rounded-full bg-white shadow-sm"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Stock Status */}
      <div className="space-y-4">
        <h4 className="font-bold text-foreground text-lg">حالة المخزون</h4>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none">
            <SelectValue placeholder="الكل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="in-stock">متوفر</SelectItem>
            <SelectItem value="low">مخزون منخفض</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const ProductCard = ({ product, index, viewMode, storeSettings, copyAffiliateLink, copiedId, onQuickView, affiliateId }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative bg-card transition-all duration-500 border border-border/50",
        viewMode === "grid" 
          ? "rounded-[2.5rem] overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2" 
          : "rounded-3xl p-4 flex flex-col md:flex-row gap-6 items-center"
      )}
    >
      {/* Image Container */}
      <div className={cn(
        "relative overflow-hidden shrink-0",
        viewMode === "grid" ? "aspect-square w-full" : "w-full md:w-56 h-56 rounded-2xl"
      )}>
        <motion.img
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.6 }}
          src={isHovered && product.images?.length > 1 ? product.images[1] : product.image}
          className="w-full h-full object-cover"
          alt={product.name}
        />
        
        {/* Glass Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {product.isTrend && (
            <Badge className="bg-orange-500/90 hover:bg-orange-600 backdrop-blur-md border-none text-[10px] font-black uppercase tracking-tighter">
              Trending
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="bg-yellow-500/90 hover:bg-yellow-600 backdrop-blur-md border-none text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-yellow-500/20">
              Featured
            </Badge>
          )}
        </div>

        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full px-3 py-1.5 text-white text-xs font-black shadow-lg">
          -{discount}%
        </div>

        {/* Quick View Overlay */}
        <AnimatePresence>
          {isHovered && viewMode === "grid" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6"
            >
              <div className="flex flex-col gap-2 w-full max-w-[200px]">
                <Button 
                  onClick={onQuickView}
                  variant="secondary" 
                  className="rounded-full font-bold gap-2 h-12 bg-white text-black hover:bg-white/90 shadow-xl"
                >
                  <ZoomIn className="w-5 h-5" /> نظرة سريعة
                </Button>
                <Link to={`/product/${product.id}/${affiliateId}`} className="w-full">
                  <Button variant="outline" className="w-full rounded-full font-bold h-12 bg-white/10 border-white/30 text-white hover:bg-white/20">
                    صفحة المنتج
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Area */}
      <div className={cn(
        "p-6 flex-1 flex flex-col w-full",
        viewMode === "list" && "text-right"
      )}>
        <div className="mb-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
              <div className={cn("w-1.5 h-1.5 rounded-full", product.stock > 0 ? "bg-emerald-500" : "bg-destructive")} />
              {product.stock > 50 ? "متوفر" : `متبقي ${product.stock}`}
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className={cn(
          "mt-6 flex items-end justify-between",
          viewMode === "list" && "md:justify-start md:gap-12"
        )}>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground">{product.price.toLocaleString()}</span>
              <span className="text-xs font-bold text-muted-foreground">دج</span>
            </div>
            <span className="text-sm text-muted-foreground line-through opacity-60">
              {product.originalPrice.toLocaleString()} دج
            </span>
          </div>

          <div className="bg-primary/5 rounded-2xl p-3 border border-primary/10 flex flex-col items-center min-w-[100px] group-hover:bg-primary group-hover:border-primary transition-all duration-500 shadow-sm">
            <span className="text-[9px] font-black text-primary uppercase group-hover:text-white/80 transition-colors">ربحك الصافي</span>
            <div className="flex items-center gap-1 text-primary group-hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
              <span className="text-lg font-black">{product.commission.toLocaleString()}</span>
              <span className="text-[10px] font-bold">دج</span>
            </div>
          </div>
        </div>

        <div className={cn(
          "mt-6 flex flex-col sm:flex-row gap-3",
          viewMode === "list" && "md:max-w-md"
        )}>
          <Button 
            className="flex-1 h-12 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20"
            style={{ backgroundColor: "var(--store-primary)" }}
            onClick={() => copyAffiliateLink(product.id, product.name)}
          >
            {copiedId === product.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copiedId === product.id ? "تم النسخ" : "نسخ الرابط"}
          </Button>
          
          {viewMode === "list" && (
            <Button variant="outline" className="rounded-2xl h-12 font-bold px-8" onClick={onQuickView}>
              معاينة
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const QuickViewModal = ({ isOpen, onOpenChange, product, storeSettings, copyAffiliateLink, copiedId, affiliateId }: any) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl" dir="rtl">
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Gallery Sidebar */}
          <div className="lg:w-1/2 bg-muted/30 p-8 space-y-6 overflow-y-auto">
            <div className="aspect-square rounded-3xl overflow-hidden bg-white shadow-xl">
              <img src={product.image} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images?.map((img: string, i: number) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all cursor-pointer">
                  <img src={img} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Content side */}
          <div className="lg:w-1/2 p-10 space-y-8 flex flex-col overflow-y-auto">
            <DialogHeader className="text-right p-0">
               <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="rounded-md px-3 py-1 font-bold text-primary">
                    {product.category}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-red-500">
                      <Heart className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
               </div>
               <DialogTitle className="text-3xl font-black text-foreground leading-tight">
                 {product.name}
               </DialogTitle>
            </DialogHeader>

            <div className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">السعر الحالي</p>
                  <p className="text-3xl font-black text-foreground">{product.price.toLocaleString()} دج</p>
               </div>
               <div className="text-left">
                  <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">عمولتك</p>
                  <div className="flex items-center gap-1 text-2xl font-black text-secondary">
                    <TrendingUp className="w-5 h-5" />
                    {product.commission.toLocaleString()} دج
                  </div>
               </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> تفاصيل المنتج
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="space-y-4 pt-4 mt-auto">
               <Button 
                className="w-full h-14 rounded-2xl font-black text-lg gap-3 shadow-xl shadow-primary/20"
                style={{ backgroundColor: "var(--store-primary)" }}
                onClick={() => copyAffiliateLink(product.id, product.name)}
              >
                {copiedId === product.id ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                {copiedId === product.id ? "تم النسخ" : "نسخ رابط الإحالة الآن"}
              </Button>
               <Link to={`/product/${product.id}/${affiliateId}`} className="block">
                <Button variant="outline" className="w-full h-14 rounded-2xl font-bold gap-2">
                  زيارة صفحة المنتج الكاملة
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
