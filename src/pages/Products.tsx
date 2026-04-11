import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Copy, Check, Search, Filter, Eye, TrendingUp, SlidersHorizontal, X, Facebook, Instagram, Phone, MessageSquare, Globe, Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockProducts, categories } from "@/data/mockProducts";
import { StoreSettings, defaultStoreSettings } from "@/data/storeSettings";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [stockFilter, setStockFilter] = useState("all");

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);

  useEffect(() => {
    const saved = localStorage.getItem("affiliate_store_settings");
    if (saved) {
      setStoreSettings(JSON.parse(saved));
    }
  }, []);

  const affiliateId = "aff-demo-123";

  const filteredProducts = mockProducts
    .filter(product => {
      const matchesSearch = product.name.includes(searchQuery) || product.description.includes(searchQuery);
      const matchesCategory = selectedCategory === "الكل" || product.category === selectedCategory;
      const range = priceRanges[selectedPriceRange];
      const matchesPrice = product.price >= range.min && product.price <= range.max;
      const matchesStock = stockFilter === "all" || (stockFilter === "in-stock" && product.stock > 0) || (stockFilter === "low" && product.stock <= 50 && product.stock > 0);
      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "commission-desc") return b.commission - a.commission;
      if (sortBy === "stock-desc") return b.stock - a.stock;
      return 0;
    });

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
        "min-h-screen transition-colors duration-500",
        storeSettings.templateId === "dark" ? "bg-slate-950 text-slate-100 dark" : "bg-background text-foreground"
      )} 
      dir="rtl"
      style={{ "--store-primary": storeSettings.primaryColor } as React.CSSProperties}
    >
      {/* Top Welcome Bar */}
      {storeSettings.welcomeBarText && (
        <div 
          className="text-primary-foreground py-2 text-center text-xs font-bold tracking-wide"
          style={{ backgroundColor: "var(--store-primary)" }}
        >
          {storeSettings.welcomeBarText}
        </div>
      )}

      {/* Branded Header */}
      <div className={cn(
        "py-12 relative overflow-hidden transition-all duration-500",
        storeSettings.templateId === "modern" && "bg-card/40 backdrop-blur-xl border-b border-border/50",
        storeSettings.templateId === "minimal" && "bg-background border-b border-border",
        storeSettings.templateId === "bold" && "border-b-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]",
        storeSettings.templateId === "dark" && "bg-slate-900 border-b border-slate-800",
        storeSettings.templateId === "bold" ? "" : "bg-card border-b border-border"
      )}
      style={storeSettings.templateId === "bold" ? { backgroundColor: "var(--store-primary)", color: "white" } : {}}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Store Info (Left on Desktop) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-right md:flex-1"
            >
              <h1 className={cn(
                "text-4xl lg:text-6xl font-black mb-4 tracking-tight",
                storeSettings.templateId === "minimal" && "font-light",
                storeSettings.templateId === "bold" && "uppercase italic",
                storeSettings.templateId === "dark" ? "text-slate-50" : "text-foreground"
              )}
              style={storeSettings.templateId === "bold" ? { color: "white" } : {}}
              >
                {storeSettings.storeName}
              </h1>
              <p className={cn(
                "text-xl max-w-2xl leading-relaxed",
                storeSettings.templateId === "dark" ? "text-slate-400" : "text-muted-foreground"
              )}
              style={storeSettings.templateId === "bold" ? { color: "rgba(255,255,255,0.8)" } : {}}
              >
                {storeSettings.storeIntro}
              </p>
            </motion.div>

            {/* Store Logo (Right on Desktop) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="shrink-0"
            >
              <div className={cn(
                "w-32 h-32 md:w-44 md:h-44 overflow-hidden shadow-2xl transition-all duration-500",
                storeSettings.templateId === "modern" && "rounded-[3rem] border-4 border-background/50 backdrop-blur-md",
                storeSettings.templateId === "minimal" && "rounded-none border-2 border-foreground",
                storeSettings.templateId === "bold" && "rounded-2xl border-4 border-white rotate-3",
                storeSettings.templateId === "dark" && "rounded-full border-4 border-slate-800"
              )}>
                <img 
                  src={storeSettings.storeLogo} 
                  alt={storeSettings.storeName} 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
        {/* Decorative elements based on template */}
        {storeSettings.templateId === "modern" && (
          <>
            <div className="absolute top-0 right-0 w-64 h-64 opacity-20 rounded-full blur-3xl -mr-32 -mt-32" style={{ backgroundColor: "var(--store-primary)" }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -ml-32 -mb-32" />
          </>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 shadow-lg mb-8 space-y-4"
        >
          {/* Search + Sort row */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="pr-12 h-12"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-12 rounded-xl">
                  <SelectValue placeholder="ترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 gap-2 rounded-xl"
              >
                <SlidersHorizontal className="w-4 h-4" />
                فلاتر
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border"
            >
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-muted-foreground">نطاق السعر</label>
                <Select value={String(selectedPriceRange)} onValueChange={(v) => setSelectedPriceRange(Number(v))}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range, i) => (
                      <SelectItem key={i} value={String(i)}>{range.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-muted-foreground">المخزون</label>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="in-stock">متوفر</SelectItem>
                    <SelectItem value="low">مخزون منخفض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSelectedPriceRange(0); setStockFilter("all"); setSortBy("default"); setSelectedCategory("الكل"); setSearchQuery(""); }}
                  className="gap-1.5 text-destructive"
                >
                  <X className="w-4 h-4" /> مسح الفلاتر
                </Button>
              </div>
            </motion.div>
          )}

          {/* Active filter count */}
          {(selectedCategory !== "الكل" || selectedPriceRange !== 0 || stockFilter !== "all") && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span>{filteredProducts.length} منتج من أصل {mockProducts.length}</span>
            </div>
          )}
        </motion.div>

        {/* Products Grid */}
        <div className={cn(
          "grid gap-6",
          storeSettings.gridColumns === 2 && "md:grid-cols-2",
          storeSettings.gridColumns === 3 && "md:grid-cols-2 lg:grid-cols-3",
          storeSettings.gridColumns === 4 && "md:grid-cols-2 lg:grid-cols-4",
          storeSettings.gridColumns === 5 && "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
          storeSettings.gridColumns === 6 && "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        )}>
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "overflow-hidden transition-all duration-500 group",
                storeSettings.templateId === "modern" && "bg-card/50 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/20 hover-lift",
                storeSettings.templateId === "minimal" && "bg-background rounded-none border border-border shadow-sm hover:shadow-lg",
                storeSettings.templateId === "bold" && "bg-background rounded-2xl border-2 border-foreground shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none",
                storeSettings.templateId === "dark" && "bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl hover:border-slate-700 hover:-translate-y-2"
              )}
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div 
                  className="absolute top-4 left-4 text-white px-3 py-1.5 rounded-full text-sm font-black shadow-lg"
                  style={{ backgroundColor: "var(--store-primary)" }}
                >
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </div>
                <div className={cn(
                  "absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-bold shadow-md",
                  storeSettings.templateId === "dark" ? "bg-slate-800 text-slate-200" : "bg-white/90 backdrop-blur-sm text-foreground"
                )}>
                  {product.category}
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Link to={`/product/${product.id}/${affiliateId}`}>
                    <Button 
                      variant="glass" 
                      size="lg" 
                      className="gap-2 rounded-full font-bold"
                    >
                      <Eye className="w-5 h-5" />
                      معاينة صفحة المنتج
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className={cn(
                    "font-bold text-lg line-clamp-1",
                    storeSettings.templateId === "dark" ? "text-slate-100" : "text-foreground"
                  )}>
                    {product.name}
                  </h3>
                  <p className={cn(
                    "text-sm line-clamp-2 mt-1",
                    storeSettings.templateId === "dark" ? "text-slate-400" : "text-muted-foreground"
                  )}>
                    {product.description}
                  </p>
                </div>

                {/* Price & Commission */}
                <div className="flex items-center justify-between">
                  <div>
                    <p 
                      className={cn(
                        "text-2xl font-black",
                        storeSettings.templateId === "dark" ? "text-slate-100" : "text-foreground"
                      )}
                      style={storeSettings.templateId !== "dark" ? { color: "var(--store-primary)" } : {}}
                    >
                      {product.price.toLocaleString()} دج
                    </p>
                    <p className="text-sm text-muted-foreground line-through">
                      {product.originalPrice.toLocaleString()} دج
                    </p>
                  </div>
                  <div className={cn(
                    "rounded-xl px-4 py-2 text-center",
                    storeSettings.templateId === "dark" ? "bg-slate-800" : "bg-muted"
                  )}>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">عملتك</p>
                    <p 
                      className="text-lg font-black flex items-center gap-1"
                      style={{ color: "var(--store-primary)" }}
                    >
                      <TrendingUp className="w-4 h-4" />
                      {product.commission.toLocaleString()} دج
                    </p>
                  </div>
                </div>

                {/* Stock */}
                <div className="flex items-center gap-2 text-sm">
                  <div 
                    className={cn(
                      "w-2 h-2 rounded-full",
                      product.stock > 50 ? "bg-emerald-500" : "bg-orange-500"
                    )} 
                  />
                  <span className={storeSettings.templateId === "dark" ? "text-slate-400" : "text-muted-foreground"}>
                    {product.stock > 50 ? "متوفر بكميات كبيرة" : `متبقي ${product.stock} قطعة`}
                  </span>
                </div>

                {/* Copy Link Button */}
                <Button
                  onClick={() => copyAffiliateLink(product.id, product.name)}
                  variant={copiedId === product.id ? "secondary" : "default"}
                  className={cn(
                    "w-full gap-2 h-12 text-base font-bold transition-all duration-300",
                    storeSettings.templateId === "modern" && "rounded-2xl shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5",
                    storeSettings.templateId === "minimal" && "rounded-none border-2 border-foreground hover:bg-foreground hover:text-background",
                    storeSettings.templateId === "bold" && "rounded-xl border-b-4 border-black/20 hover:border-b-0 active:translate-y-1",
                    storeSettings.templateId === "dark" && "bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl"
                  )}
                  style={storeSettings.templateId !== "minimal" && storeSettings.templateId !== "dark" ? { backgroundColor: "var(--store-primary)" } : {}}
                >
                  {copiedId === product.id ? (
                    <>
                      <Check className="w-5 h-5" />
                      تم النسخ!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      نسخ رابط الإحالة
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">لا توجد منتجات مطابقة للبحث</p>
          </div>
        )}
      </div>

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
                {storeSettings.socialLinks.facebook && (
                  <a href={storeSettings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {storeSettings.socialLinks.instagram && (
                  <a href={storeSettings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {storeSettings.socialLinks.phone && (
                  <a href={`tel:${storeSettings.socialLinks.phone}`} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-secondary hover:text-white transition-colors">
                    <Phone className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-foreground">روابط قانونية</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href={storeSettings.footerInfo.privacyPolicyLink} className="hover:text-primary transition-colors">سياسة الخصوصية</a></li>
                <li><a href={storeSettings.footerInfo.termsLink} className="hover:text-primary transition-colors">الشروط والأحكام</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-foreground">اتصل بنا</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-secondary" />
                  <span>{storeSettings.socialLinks.phone}</span>
                </div>
                {storeSettings.socialLinks.whatsapp && (
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
