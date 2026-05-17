import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
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
import { Product } from "@/data/mockProducts";
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
import { API_BASE_URL } from '@/config/api';
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

const Storefront = () => {
  const { storeName } = useParams<{ storeName: string }>();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 20000]); // Max price from slider
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [stockFilter, setStockFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [products, setProducts] = useState<any[]>([]);
  const [affiliateId, setAffiliateId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  const activeCategories = useMemo(() => {
    return ["الكل", ...dbCategories.filter(c => c.isActive).map(c => c.name)];
  }, [dbCategories]);

  useEffect(() => {
    // Fetch products and store settings from public backend endpoint
    const fetchStore = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/store/public/${storeName}`);
        const json = await res.json();
        if (res.ok && json.data) {
          setStoreSettings(json.data.storeInfo);
          setProducts(json.data.products);
          setAffiliateId(json.data.storeInfo.id);
        } else {
          toast({ title: "متجر غير موجود", variant: "destructive" });
        }
      } catch (err) {
        console.error('Failed to fetch store', err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/categories`);
        const json = await res.json();
        if (res.ok && json.data) {
          setDbCategories(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };

    if (storeName) fetchStore();
    fetchCategories();
  }, [storeName, toast]);

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
        return matchesSearch && matchesCategory && matchesPrice && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "commission-desc") return b.commission - a.commission;
        if (sortBy === "stock-desc") return b.stock - a.stock;
        return 0;
      });
  }, [searchQuery, selectedCategory, selectedPriceRange, stockFilter, sortBy, products]);

  const categoryIcons: Record<string, any> = {
    "الكل": LayoutGrid,
    "إلكترونيات": Smartphone,
    "أزياء": Shirt,
    "جمال": Sparkles,
    "أجهزة منزلية": Home
  };

  const templateId = storeSettings.templateId;
  const isLuxury = templateId === "luxury";
  const isDarkTpl = templateId === "dark";
  const isModern = !isLuxury && !isDarkTpl;

  const templateShell =
    isDarkTpl ? "bg-[#06060F] text-white dark"
    : isLuxury ? "bg-[#FAFAF7] text-[#0A0A0A]"
    : "bg-white text-slate-900";

  const templateBgOverlay =
    isDarkTpl ? "bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.18),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(14,165,233,0.12),transparent_55%)]"
    : isLuxury ? "bg-[radial-gradient(circle_at_70%_30%,rgba(160,133,82,0.06),transparent_60%)]"
    : "";

  const templateFontStack =
    isLuxury ? `'Cormorant Garamond', ${storeSettings.fontFamily}, serif`
    : `${storeSettings.fontFamily}, sans-serif`;

  // Per-template visual tokens — applied across hero, USP, search, grid, footer
  const tpl = {
    // Welcome bar
    welcomeBar: isDarkTpl
      ? "bg-gradient-to-r from-[#06060F] via-[#1F1B3D] to-[#06060F] border-b border-white/[0.08] text-[#A5B4FC] tracking-[0.25em] uppercase text-[11px] font-medium"
      : isLuxury
      ? "bg-[#0A0A0A] text-[#E8E1D1] tracking-[0.35em] uppercase text-[11px] font-light"
      : "bg-slate-900 text-white tracking-wider uppercase text-[11px] font-semibold",
    // Hero overlay (gradient over banner)
    heroOverlay: isDarkTpl
      ? "bg-gradient-to-b from-[#06060F]/40 via-[#06060F]/65 to-[#06060F]"
      : isLuxury
      ? "bg-gradient-to-b from-[#FAFAF7]/0 via-[#FAFAF7]/20 to-[#FAFAF7]"
      : "bg-gradient-to-b from-black/40 via-black/30 to-white",
    heroTagline: isDarkTpl
      ? "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-xl text-[11px] font-medium text-[#C4B5FD] tracking-widest uppercase"
      : isLuxury
      ? "inline-flex items-center gap-2 px-4 py-1.5 border border-white/30 text-[10px] font-light text-white tracking-[0.35em] uppercase"
      : "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-xl text-[11px] font-bold text-slate-800 tracking-wider uppercase shadow-sm",
    heroTitle: isDarkTpl
      ? "font-bold tracking-tight"
      : isLuxury
      ? "font-serif font-light tracking-tight italic"
      : "font-black tracking-tight",
    heroSubtitle: isDarkTpl
      ? "text-white/70"
      : isLuxury
      ? "font-serif text-white/85 font-light italic"
      : "text-white/85 font-medium",
    heroBtn: isDarkTpl
      ? "bg-gradient-to-b from-[#7C3AED] to-[#5B21B6] hover:from-[#8B5CF6] hover:to-[#6D28D9] text-white font-semibold rounded-xl px-10 py-7 text-base shadow-[0_20px_50px_-12px_rgba(124,58,237,0.7),inset_0_1px_0_rgba(255,255,255,0.2)] border border-[#A78BFA]/30"
      : isLuxury
      ? "bg-[#0A0A0A] hover:bg-[#1F1F1F] text-[#FAFAF7] font-light rounded-none px-14 py-7 text-xs tracking-[0.35em] uppercase shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]"
      : "bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full px-12 py-7 text-base shadow-2xl",
    heroDivider: isLuxury
      ? "w-px h-16 bg-white/40 mx-auto"
      : isDarkTpl
      ? "w-12 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-400 mx-auto rounded-full"
      : "w-16 h-1 bg-slate-900 mx-auto rounded-full",
    // USP / Trust strip
    uspWrap: isDarkTpl
      ? "bg-[#0A0A18] border-y border-white/[0.06] py-12"
      : isLuxury
      ? "bg-[#F5F1E8]/30 border-y border-[#0A0A0A]/10 py-14"
      : "bg-slate-50 border-y border-slate-200 py-10",
    uspItem: isDarkTpl
      ? "flex flex-col items-center text-center gap-3 p-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl"
      : isLuxury
      ? "flex flex-col items-center text-center gap-4 border-x border-[#0A0A0A]/8 px-6 py-2 first:border-r-0 last:border-l-0"
      : "flex flex-col items-center text-center gap-3 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm",
    uspIcon: isDarkTpl
      ? "w-14 h-14 rounded-xl bg-gradient-to-br from-[#7C3AED]/30 to-[#5B21B6]/30 border border-[#7C3AED]/40 text-[#C4B5FD] flex items-center justify-center backdrop-blur-xl shadow-[0_8px_30px_-8px_rgba(124,58,237,0.5)]"
      : isLuxury
      ? "w-12 h-12 rounded-none bg-[#0A0A0A] text-[#E8E1D1] flex items-center justify-center"
      : "w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center",
    uspTitle: isDarkTpl
      ? "font-bold text-base text-white"
      : isLuxury
      ? "font-serif font-light text-base text-[#0A0A0A] tracking-[0.15em] uppercase"
      : "font-bold text-base text-slate-900",
    uspText: isDarkTpl ? "text-[#9CA3AF] text-xs" : isLuxury ? "text-[#737070] text-[11px] tracking-wider" : "text-slate-500 text-xs",
    // Section title (above product grid)
    sectionEyebrow: isDarkTpl
      ? "text-[10px] font-medium text-[#C4B5FD] tracking-[0.3em] uppercase mb-2"
      : isLuxury
      ? "text-[10px] font-light text-[#A08552] tracking-[0.35em] uppercase mb-2"
      : "text-[10px] font-bold text-blue-600 tracking-[0.25em] uppercase mb-2",
    sectionTitle: isDarkTpl
      ? "text-3xl sm:text-4xl font-bold tracking-tight text-white"
      : isLuxury
      ? "text-3xl sm:text-5xl font-serif font-light italic tracking-tight text-[#0A0A0A]"
      : "text-3xl sm:text-4xl font-black tracking-tight text-slate-900",
    // Search input
    searchInput: isDarkTpl
      ? "pr-12 h-14 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 focus-visible:border-[#7C3AED]/50 focus-visible:ring-[#7C3AED]/30 backdrop-blur-xl rounded-2xl text-base"
      : isLuxury
      ? "pr-12 h-14 bg-transparent border-0 border-b border-[#0A0A0A] text-[#0A0A0A] placeholder:text-[#737070]/60 placeholder:tracking-widest placeholder:uppercase placeholder:text-xs rounded-none focus-visible:ring-0 focus-visible:border-[#0A0A0A] text-base font-serif"
      : "pr-12 h-14 bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-sm focus-visible:border-blue-500 focus-visible:ring-blue-500/20 text-base",
    searchIcon: isDarkTpl ? "text-white/40" : isLuxury ? "text-[#0A0A0A]" : "text-slate-400",
    // Filter/view toolbar
    toolbarBox: isDarkTpl
      ? "bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-1"
      : isLuxury
      ? "bg-transparent border border-[#0A0A0A]/15 rounded-none p-0.5"
      : "bg-white border border-slate-200 shadow-sm rounded-2xl p-1",
    // Filter sidebar card
    sidebarCard: isDarkTpl
      ? "bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-3xl p-8 space-y-8"
      : isLuxury
      ? "bg-transparent border border-[#0A0A0A]/10 rounded-none p-8 space-y-8"
      : "bg-white border border-slate-100 shadow-sm rounded-[2rem] p-8 space-y-8",
    // Product card
    productCard: isDarkTpl
      ? "bg-white/[0.03] border border-white/[0.08] hover:border-[#7C3AED]/40 backdrop-blur-xl rounded-2xl hover:shadow-[0_30px_60px_-15px_rgba(124,58,237,0.4)] transition-all duration-500"
      : isLuxury
      ? "bg-transparent border border-[#0A0A0A]/10 hover:border-[#0A0A0A]/40 rounded-none transition-all duration-500"
      : "bg-white shadow-sm hover:shadow-2xl border border-slate-100 rounded-2xl hover:-translate-y-1 transition-all duration-300",
    productTitle: isDarkTpl
      ? "text-lg font-bold text-white group-hover:text-[#C4B5FD] transition-colors"
      : isLuxury
      ? "text-lg font-serif font-medium text-[#0A0A0A] tracking-tight"
      : "text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors",
    productPrice: isDarkTpl
      ? "text-2xl font-bold text-white num"
      : isLuxury
      ? "text-2xl font-serif font-light text-[#0A0A0A] num"
      : "text-2xl font-black text-slate-900 num",
    productCategory: isDarkTpl
      ? "text-[10px] font-medium text-[#C4B5FD] tracking-[0.2em] uppercase bg-[#7C3AED]/15 border border-[#7C3AED]/30 px-2 py-0.5 rounded-md"
      : isLuxury
      ? "text-[9px] font-light text-[#A08552] tracking-[0.3em] uppercase"
      : "text-[10px] font-bold text-blue-600 tracking-widest uppercase bg-blue-50 px-2 py-0.5 rounded-md",
    // Footer
    footerWrap: isDarkTpl
      ? "bg-[#06060F] border-t border-white/[0.06] text-white mt-20 pt-16 pb-8"
      : isLuxury
      ? "bg-[#0A0A0A] text-[#E8E1D1] mt-20 pt-20 pb-10"
      : "bg-slate-50 border-t border-slate-200 text-slate-900 mt-20 pt-16 pb-8",
    footerHeading: isDarkTpl
      ? "text-2xl font-bold text-white"
      : isLuxury
      ? "text-2xl font-serif font-light tracking-[0.2em] uppercase text-[#E8E1D1]"
      : "text-2xl font-black text-slate-900",
  };

  return (
    <div
      className={cn(
        "min-h-screen transition-all duration-500 relative",
        templateShell
      )}
      dir="rtl"
      style={{
        "--store-primary": storeSettings.primaryColor,
        fontFamily: templateFontStack
      } as React.CSSProperties}
    >
      {templateBgOverlay && <div className={cn("pointer-events-none absolute inset-0", templateBgOverlay)} aria-hidden="true" />}
      {/* Top Welcome Bar */}
      {storeSettings.welcomeBarText && (
        <div className={cn("py-2.5 text-center relative z-50 overflow-hidden", tpl.welcomeBar)}>
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
               className={cn("w-full h-full object-cover", isLuxury && "grayscale-[20%] contrast-95")}
             />
             <div className={cn("absolute inset-0", tpl.heroOverlay)} />
             {isDarkTpl && (
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#06060F_85%)] pointer-events-none" />
             )}
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

             {/* Eyebrow tagline (template-aware) */}
             <motion.div
               initial={{ opacity: 0, y: 12 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
               className="mb-6"
             >
               <span className={tpl.heroTagline}>
                 {isLuxury ? "Maison" : isDarkTpl ? "New Collection" : "Welcome"}
               </span>
             </motion.div>

             {/* Store Name & Intro inside Hero */}
             {storeSettings.storeName && (
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className={cn(
                    "text-white mb-4 drop-shadow-2xl",
                    tpl.heroTitle,
                    isLuxury ? "text-4xl md:text-7xl" : "text-5xl md:text-7xl"
                  )}
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
                  className={cn(
                    "max-w-2xl mx-auto drop-shadow-lg mb-8 text-lg md:text-2xl",
                    tpl.heroSubtitle,
                    !isLuxury && !isDarkTpl && "p-4 rounded-3xl bg-black/10 backdrop-blur-md"
                  )}
                >
                  {storeSettings.storeIntro}
                </motion.p>
             )}

             {/* Divider */}
             {(storeSettings.hero?.title || storeSettings.hero?.subtitle) && (storeSettings.storeName || storeSettings.storeIntro) && (
               <div className={cn("mb-8 opacity-80", tpl.heroDivider)} />
             )}

             {/* Hero Subtitles/Promos */}
             {storeSettings.hero?.title && (
               <motion.h2
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8, delay: 0.3 }}
                 className={cn("text-white mb-4 drop-shadow-xl text-3xl md:text-5xl", tpl.heroTitle)}
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
                 className={cn("max-w-3xl mx-auto drop-shadow-md text-base md:text-xl", tpl.heroSubtitle)}
               >
                 {storeSettings.hero.subtitle}
               </motion.p>
             )}
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5, delay: 0.4 }}
               className="mt-12"
             >
                <button
                  className={cn("inline-flex items-center gap-3 transition-all", tpl.heroBtn)}
                  onClick={() => document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {isLuxury ? "Discover" : isDarkTpl ? "Explore Collection" : "تسوق الآن"}
                  <ArrowRight className={cn("w-5 h-5 transition-transform group-hover:translate-x-1", isLuxury ? "rotate-180" : "rtl:rotate-180")} />
                </button>
             </motion.div>
           </div>
        </div>
      )}

      {/* Trust Badges Bar (USP) */}
      {storeSettings.usp?.enabled && (
        <div className={cn("relative z-10", tpl.uspWrap)}>
          <div className="container mx-auto px-4">
            <div className={cn(
              "grid grid-cols-1 md:grid-cols-3",
              isLuxury ? "gap-0 max-w-5xl mx-auto" : "gap-4 md:gap-6"
            )}>
               {storeSettings.usp?.items?.map((item: any, idx: number) => (
                 <motion.div
                   key={idx}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: idx * 0.1 }}
                   className={cn(tpl.uspItem, "group")}
                 >
                   <div className={cn(tpl.uspIcon, "group-hover:scale-110 transition-transform shrink-0")}>
                     {item.icon === "Truck" && <Truck className="w-6 h-6" />}
                     {item.icon === "ShieldCheck" && <ShieldCheck className="w-6 h-6" />}
                     {item.icon === "CreditCard" && <CreditCard className="w-6 h-6" />}
                   </div>
                   <div className={cn(isLuxury ? "text-center" : "text-center")}>
                     <p className={tpl.uspTitle}>{item.text}</p>
                     <p className={cn("mt-1", tpl.uspText)}>خدمة موثوقة ومضمونة</p>
                   </div>
                 </motion.div>
               ))}
            </div>
          </div>
        </div>
      )}


      <div className="container mx-auto px-4 py-12 relative">
        {/* Section title above the grid */}
        <div id="product-grid" className={cn("mb-10 text-center", isLuxury && "mb-14")}>
          <p className={tpl.sectionEyebrow}>{isLuxury ? "Collection" : isDarkTpl ? "Curated For You" : "تشكيلة المنتجات"}</p>
          <h2 className={tpl.sectionTitle}>{isLuxury ? "The Collection" : isDarkTpl ? "Featured Products" : "اكتشف منتجاتنا"}</h2>
        </div>

        {/* Modern Search & View Actions */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="relative flex-1 w-full group">
            <Search className={cn("absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors", tpl.searchIcon)} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isLuxury ? "SEARCH" : "ابحث عن منتج، فئة، أو عمولة..."}
              className={tpl.searchInput}
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
                    categoryIcons={categoryIcons}
                    dbCategories={dbCategories}
                    activeCategories={activeCategories}
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
                categoryIcons={categoryIcons}
                dbCategories={dbCategories}
                activeCategories={activeCategories}
               />
               
               <Button 
                variant="ghost" 
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("الكل");
                  setSelectedPriceRange([0, 20000]);
                  setStockFilter("all");
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
      <footer className={cn("relative z-10", tpl.footerWrap)}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 overflow-hidden", isLuxury ? "rounded-none" : "rounded-2xl shadow-md")}>
                  <img src={storeSettings.storeLogo} alt={storeSettings.storeName} className="w-full h-full object-cover" />
                </div>
                <h3 className={tpl.footerHeading}>{storeSettings.storeName}</h3>
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

export default Storefront;

// --- Sub-components ---

const FilterContent = ({ 
  selectedCategory, setSelectedCategory, 
  selectedPriceRange, setSelectedPriceRange,
  stockFilter, setStockFilter,
  categoryIcons,
  dbCategories,
  activeCategories
}: any) => {
  return (
    <div className="space-y-10">
      {/* Categories */}
      <div className="space-y-4">
        <h4 className="font-bold text-foreground text-lg">الفئات</h4>
        <div className="space-y-2">
          {activeCategories?.map((category: string) => {
            const catObj = dbCategories?.find((c: any) => c.name === category);
            const isAll = category === "الكل";
            const iconChar = isAll ? "🏷️" : (catObj ? catObj.icon : "📦");
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
                  "w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-lg",
                  isActive ? "bg-white/20" : "bg-muted group-hover:bg-background"
                )}>
                  {iconChar}
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

const ProductCard = ({ product, index, viewMode, storeSettings, onQuickView, affiliateId }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  const isLuxuryCard = storeSettings.templateId === "luxury";
  const isDarkCard = storeSettings.templateId === "dark";

  const cardWrap = isDarkCard
    ? "bg-white/[0.03] border border-white/[0.08] hover:border-[#7C3AED]/40 backdrop-blur-xl hover:shadow-[0_30px_60px_-15px_rgba(124,58,237,0.4)]"
    : isLuxuryCard
    ? "bg-transparent border border-[#0A0A0A]/10 hover:border-[#0A0A0A]/40"
    : "bg-white shadow-sm hover:shadow-2xl border border-slate-100";

  const cardRadius = isLuxuryCard ? "rounded-none" : "rounded-2xl";

  const titleCls = isDarkCard
    ? "text-lg font-bold text-white group-hover:text-[#C4B5FD] transition-colors"
    : isLuxuryCard
    ? "text-lg font-serif font-medium text-[#0A0A0A] tracking-tight"
    : "text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors";

  const priceCls = isDarkCard
    ? "text-3xl font-bold text-white"
    : isLuxuryCard
    ? "text-3xl font-serif font-light text-[#0A0A0A]"
    : "text-3xl font-black text-slate-900";

  const categoryCls = isDarkCard
    ? "text-[10px] font-medium text-[#C4B5FD] tracking-[0.2em] uppercase bg-[#7C3AED]/15 border border-[#7C3AED]/30 px-2 py-0.5 rounded-md"
    : isLuxuryCard
    ? "text-[9px] font-light text-[#A08552] tracking-[0.3em] uppercase"
    : "text-[10px] font-bold text-blue-600 tracking-widest uppercase bg-blue-50 px-2 py-0.5 rounded-md";

  const descCls = isDarkCard ? "text-[#9CA3AF]" : isLuxuryCard ? "text-[#737070] font-serif italic" : "text-slate-500";

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
        "group relative transition-all duration-500",
        cardWrap,
        viewMode === "grid"
          ? `${cardRadius} overflow-hidden flex flex-col ${!isLuxuryCard ? "hover:-translate-y-2" : ""}`
          : `${cardRadius} p-4 flex flex-col md:flex-row gap-6 items-center`
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
          <div className="flex items-center justify-between mb-2.5">
            <span className={categoryCls}>
              {product.category}
            </span>
            <div className={cn("flex items-center gap-1 text-[10px] font-bold", isDarkCard ? "text-white/60" : isLuxuryCard ? "text-[#737070] tracking-wider uppercase" : "text-slate-500")}>
              <div className={cn("w-1.5 h-1.5 rounded-full", product.stock > 0 ? "bg-emerald-500" : "bg-destructive")} />
              {product.stock > 50 ? "متوفر" : `متبقي ${product.stock}`}
            </div>
          </div>

          <h3 className={cn("line-clamp-1", titleCls)}>
            {product.name}
          </h3>
          <p className={cn("text-sm mt-2 line-clamp-2 leading-relaxed", descCls)}>
            {product.description}
          </p>
        </div>

        <div className={cn(
          "mt-6 flex items-end justify-between",
          viewMode === "list" && "md:justify-start md:gap-12"
        )}>
          <div>
            <div className="flex items-baseline gap-2">
              <span className={priceCls}>{product.price.toLocaleString()}</span>
              <span className={cn("text-xs font-bold", isDarkCard ? "text-white/50" : isLuxuryCard ? "text-[#737070] tracking-widest uppercase" : "text-slate-500")}>دج</span>
            </div>
            <span className={cn("text-sm line-through opacity-60", isDarkCard ? "text-white/40" : isLuxuryCard ? "text-[#737070] font-serif italic" : "text-slate-500")}>
              {product.originalPrice.toLocaleString()} دج
            </span>
          </div>
        </div>

        <div className={cn(
          "mt-6 flex flex-col sm:flex-row gap-3",
          viewMode === "list" && "md:max-w-md"
        )}>
          <Link to={`/product/${product.id}/${affiliateId}`} className="flex-1 block">
            <button
              className={cn(
                "w-full h-12 font-bold gap-2 transition-all flex items-center justify-center",
                isDarkCard
                  ? "bg-gradient-to-b from-[#7C3AED] to-[#5B21B6] hover:from-[#8B5CF6] hover:to-[#6D28D9] text-white rounded-xl shadow-[0_10px_30px_-8px_rgba(124,58,237,0.5)] border border-[#A78BFA]/30"
                  : isLuxuryCard
                  ? "bg-[#0A0A0A] hover:bg-[#1F1F1F] text-[#FAFAF7] uppercase tracking-[0.3em] text-[11px] font-light rounded-none"
                  : "bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-lg"
              )}
            >
              {isLuxuryCard ? "Order" : isDarkCard ? "Buy Now" : "شراء الآن"}
            </button>
          </Link>
          
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

const QuickViewModal = ({ isOpen, onOpenChange, product, storeSettings, affiliateId }: any) => {
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
               <Link to={`/product/${product.id}/${affiliateId}`} className="block">
                 <Button 
                  className="w-full h-14 rounded-2xl font-black text-lg gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                  style={{ backgroundColor: "var(--store-primary)" }}
                 >
                   شراء الآن
                 </Button>
               </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
