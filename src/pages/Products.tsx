import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Copy, Check, Search, Filter, Eye, TrendingUp, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockProducts, categories } from "@/data/mockProducts";
import { useToast } from "@/hooks/use-toast";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-navy-800 text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              منتجاتنا المميزة
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              اختر المنتج وانسخ رابط الإحالة الخاص بك وابدأ بالربح
            </p>
          </motion.div>
        </div>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden shadow-lg hover-lift group"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full text-sm font-bold">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </div>
                <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-bold">
                  {product.category}
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Link to={`/product/${product.id}/${affiliateId}`}>
                    <Button variant="glass" size="lg" className="gap-2">
                      <Eye className="w-5 h-5" />
                      معاينة صفحة المنتج
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-foreground line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                    {product.description}
                  </p>
                </div>

                {/* Price & Commission */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-secondary">
                      {product.price.toLocaleString()} دج
                    </p>
                    <p className="text-sm text-muted-foreground line-through">
                      {product.originalPrice.toLocaleString()} دج
                    </p>
                  </div>
                  <div className="bg-accent/10 rounded-xl px-4 py-2 text-center">
                    <p className="text-xs text-muted-foreground">عمولتك</p>
                    <p className="text-lg font-bold text-accent flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {product.commission.toLocaleString()} دج
                    </p>
                  </div>
                </div>

                {/* Stock */}
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${product.stock > 50 ? "bg-secondary" : "bg-accent"}`} />
                  <span className="text-muted-foreground">
                    {product.stock > 50 ? "متوفر بكميات كبيرة" : `متبقي ${product.stock} قطعة`}
                  </span>
                </div>

                {/* Copy Link Button */}
                <Button
                  onClick={() => copyAffiliateLink(product.id, product.name)}
                  variant={copiedId === product.id ? "secondary" : "default"}
                  className="w-full gap-2"
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
    </div>
  );
};

export default Products;
