import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { 
  Search, Filter, Eye, SlidersHorizontal, 
  X, ZoomIn, LayoutGrid, List,
  Smartphone, Shirt, Home, Sparkles, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const sortOptions = [
  { value: "default", label: "الافتراضي" },
  { value: "price-asc", label: "السعر: من الأقل" },
  { value: "price-desc", label: "السعر: من الأعلى" }
];

const categoryIcons: Record<string, any> = {
  "الكل": LayoutGrid,
  "إلكترونيات": Smartphone,
  "ملابس": Shirt,
  "المنزل": Home,
  "موضة": Sparkles,
};

const Storefront = () => {
  const { storeName } = useParams<{ storeName: string }>();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<any[]>([]);
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch store data
  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch(`https://profit-link-3eri.onrender.com/api/store/public/${storeName}`);
        if (res.ok) {
          const json = await res.json();
          setStoreInfo(json.data.storeInfo);
          setProducts(json.data.products);
        } else {
          toast({ title: "متجر غير موجود", variant: "destructive" });
        }
      } catch (err) {
        console.error('Failed to fetch store', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (storeName) fetchStore();
  }, [storeName]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              product.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "الكل" || product.category === selectedCategory;
        const matchesPrice = product.price >= selectedPriceRange[0] && product.price <= selectedPriceRange[1];

        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return 0;
      });
  }, [searchQuery, selectedCategory, selectedPriceRange, sortBy, products]);

  const uniqueCategories = ["الكل", ...Array.from(new Set(products.map(p => p.category)))];

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">جاري تحميل المتجر...</div>;
  }

  if (!storeInfo) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">هذا المتجر غير موجود</div>;
  }

  const primaryColor = storeInfo.primaryColor || '#000000';

  return (
    <div className="min-h-screen bg-background" dir="rtl" style={{ '--store-primary': primaryColor } as React.CSSProperties}>
      
      {/* Store Header */}
      <div className="bg-slate-900 text-white pb-20 pt-10 px-4 relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto max-w-7xl relative z-10 flex flex-col items-center text-center">
          {storeInfo.storeLogo && (
            <img src={storeInfo.storeLogo} alt={storeInfo.storeName} className="w-24 h-24 rounded-2xl shadow-xl mb-4 object-cover" />
          )}
          <h1 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-lg">{storeInfo.storeName}</h1>
          <p className="text-white/80 text-lg max-w-2xl">
            {storeInfo.config?.usp || "مرحباً بكم في متجرنا! استكشف تشكيلة واسعة من أفضل المنتجات المختارة بعناية لتناسب جميع احتياجاتك."}
          </p>
        </div>
      </div>

      <main className="container mx-auto max-w-7xl px-4 py-8 -mt-12 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-card rounded-3xl p-6 border shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-foreground font-black text-lg">
                <Filter className="w-5 h-5 text-primary" style={{ color: "var(--store-primary)" }} />
                تصفية النتائج
              </div>

              {/* Search */}
              <div className="space-y-4 mb-8">
                <label className="text-sm font-bold text-muted-foreground">البحث</label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="ابحث عن منتج..." 
                    className="pr-10 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-4 mb-8">
                <label className="text-sm font-bold text-muted-foreground">الأقسام</label>
                <div className="flex flex-col gap-2">
                  {uniqueCategories.map(cat => {
                    const Icon = categoryIcons[cat] || LayoutGrid;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                          selectedCategory === cat 
                            ? "bg-primary text-primary-foreground shadow-md" 
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                        style={selectedCategory === cat ? { backgroundColor: "var(--store-primary)" } : {}}
                      >
                        <Icon className="w-4 h-4" />
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-6 mb-8">
                <label className="text-sm font-bold text-muted-foreground flex justify-between">
                  <span>السعر</span>
                  <span className="text-primary" style={{ color: "var(--store-primary)" }}>{selectedPriceRange[1].toLocaleString()} دج</span>
                </label>
                <Slider
                  defaultValue={[0, 50000]}
                  max={50000}
                  step={100}
                  value={selectedPriceRange}
                  onValueChange={setSelectedPriceRange}
                  className="[&>span:first-child]:bg-muted [&>span:first-child>span]:bg-primary"
                />
              </div>

            </div>
          </aside>

          {/* Main Grid Area */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 bg-card p-4 rounded-2xl border shadow-sm">
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">{filteredProducts.length}</span> منتج
               </div>

               <div className="flex items-center gap-4 w-full sm:w-auto">
                 <Select value={sortBy} onValueChange={setSortBy}>
                   <SelectTrigger className="h-10 rounded-xl bg-muted/50 border-transparent w-full sm:w-[180px]">
                     <SelectValue placeholder="ترتيب حسب" />
                   </SelectTrigger>
                   <SelectContent>
                     {sortOptions.map(opt => (
                       <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>

                 <div className="hidden sm:flex bg-muted/50 p-1 rounded-xl">
                   <button 
                     onClick={() => setViewMode("grid")}
                     className={cn("p-2 rounded-lg transition-all", viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                   >
                     <LayoutGrid className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => setViewMode("list")}
                     className={cn("p-2 rounded-lg transition-all", viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                   >
                     <List className="w-4 h-4" />
                   </button>
                 </div>
               </div>
            </div>

            <div className={cn(
              "grid gap-6",
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            )}>
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => {
                  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
                  
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: (index % 6) * 0.05 }}
                      key={product.id}
                      className={cn(
                        "group relative bg-card transition-all duration-300 border border-border/50 hover:shadow-xl hover:-translate-y-1",
                        viewMode === "grid" 
                          ? "rounded-3xl overflow-hidden flex flex-col" 
                          : "rounded-3xl p-4 flex flex-col md:flex-row gap-6 items-center"
                      )}
                    >
                      <div className={cn(
                        "relative overflow-hidden shrink-0",
                        viewMode === "grid" ? "aspect-square w-full" : "w-full md:w-48 h-48 rounded-2xl"
                      )}>
                        <img
                          src={product.image}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={product.name}
                        />
                        
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-black rounded-full px-2 py-1 text-xs font-black shadow-sm">
                          -{discount}%
                        </div>
                      </div>

                      <div className={cn(
                        "p-5 flex-1 flex flex-col w-full",
                        viewMode === "list" && "text-right"
                      )}>
                        <div className="mb-auto">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2 py-1 rounded-md">
                            {product.category}
                          </span>
                          
                          <h3 className="text-lg font-bold text-foreground mt-3 mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors" style={{ color: "var(--store-primary)" }}>
                            {product.name}
                          </h3>
                        </div>

                        <div className={cn(
                          "mt-4 flex items-center justify-between",
                          viewMode === "list" && "md:justify-start md:gap-8"
                        )}>
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-foreground">{product.price.toLocaleString()}</span>
                              <span className="text-xs font-bold text-muted-foreground">دج</span>
                            </div>
                            <span className="text-xs text-muted-foreground line-through">
                              {product.originalPrice.toLocaleString()} دج
                            </span>
                          </div>

                          <Link to={`/product/${product.id}/${storeInfo.id}`}>
                            <Button className="rounded-xl font-bold px-6" style={{ backgroundColor: "var(--store-primary)" }}>
                              شراء الآن
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20 bg-card rounded-3xl border border-dashed">
                <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">لا توجد منتجات</h3>
                <p className="text-muted-foreground">جرب تغيير كلمات البحث أو خيارات التصفية</p>
                <Button 
                  variant="outline" 
                  className="mt-6 rounded-xl"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("الكل");
                    setSelectedPriceRange([0, 50000]);
                  }}
                >
                  إعادة ضبط الفلاتر
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Storefront;
