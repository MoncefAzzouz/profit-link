import React from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Filter, X, Heart, Maximize2, ShoppingCart, LayoutTemplate, Copy, Check, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductsTabProps {
  filteredProducts: any[];
  products: any[];
  productSearch: string;
  setProductSearch: (val: string) => void;
  productSort: string;
  setProductSort: (val: string) => void;
  productSortOptions: { value: string; label: string }[];
  showProductFilters: boolean;
  setShowProductFilters: (val: boolean) => void;
  activeCategories: string[];
  productCategory: string;
  setProductCategory: (val: string) => void;
  productPriceRange: number;
  setProductPriceRange: (val: number) => void;
  productPriceRanges: { label: string; min: number; max: number }[];
  productStockFilter: string;
  setProductStockFilter: (val: string) => void;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  storeProducts: Set<string>;
  toggleStoreProduct: (id: string) => void;
  openProductDetail: (product: any) => void;
  openOrderForm: (product: any) => void;
  setProductToEditLandingPage: (product: any) => void;
  setActiveTab: (tab: any) => void;
  copiedId: string | null;
  handleCopyLink: (product: any) => void;
}

const ProductsTab: React.FC<ProductsTabProps> = ({
  filteredProducts,
  products,
  productSearch,
  setProductSearch,
  productSort,
  setProductSort,
  productSortOptions,
  showProductFilters,
  setShowProductFilters,
  activeCategories,
  productCategory,
  setProductCategory,
  productPriceRange,
  setProductPriceRange,
  productPriceRanges,
  productStockFilter,
  setProductStockFilter,
  favorites,
  toggleFavorite,
  storeProducts,
  toggleStoreProduct,
  openProductDetail,
  openOrderForm,
  setProductToEditLandingPage,
  setActiveTab,
  copiedId,
  handleCopyLink
}) => {
  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="pr-12 h-12 rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            <Select value={productSort} onValueChange={setProductSort}>
              <SelectTrigger className="w-[180px] h-12 rounded-xl">
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {productSortOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showProductFilters ? "default" : "outline"}
              onClick={() => setShowProductFilters(!showProductFilters)}
              className="h-12 gap-2 rounded-xl"
            >
              <SlidersHorizontal className="w-4 h-4" />
              فلاتر
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 flex-wrap">
          {activeCategories.map((category) => (
            <Button
              key={category}
              variant={productCategory === category ? "default" : "outline"}
              onClick={() => setProductCategory(category)}
              className="rounded-full h-9 px-5 font-bold transition-all"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Advanced filters */}
        {showProductFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/50"
          >
            <div className="flex-1 space-y-2">
              <label className="text-sm font-bold text-muted-foreground">نطاق السعر</label>
              <Select value={String(productPriceRange)} onValueChange={(v) => setProductPriceRange(Number(v))}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {productPriceRanges.map((range, i) => (
                    <SelectItem key={i} value={String(i)}>{range.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-bold text-muted-foreground">المخزون</label>
              <Select value={productStockFilter} onValueChange={setProductStockFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
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
                onClick={() => { setProductPriceRange(0); setProductStockFilter("all"); setProductSort("default"); setProductCategory("الكل"); setProductSearch(""); }}
                className="gap-1.5 text-destructive hover:bg-destructive/10 font-bold"
              >
                <X className="w-4 h-4" /> مسح الفلاتر
              </Button>
            </div>
          </motion.div>
        )}

        {/* Active filter info */}
        {(productCategory !== "الكل" || productPriceRange !== 0 || productStockFilter !== "all") && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold">
            <Filter className="w-4 h-4" />
            <span>تم العثور على {filteredProducts.length} منتج</span>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredProducts.map((product, index) => {
          const isFavorite = favorites.has(product.id);
          const isInStore = storeProducts.has(product.id);

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-sm border border-border/50 hover:shadow-md transition-all group flex flex-col"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" className="rounded-full shadow-lg" onClick={() => openProductDetail(product)}>
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${isFavorite ? "bg-red-500 text-white" : "bg-white/80 text-muted-foreground hover:bg-white"
                    }`}
                >
                  <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? "fill-current" : ""}`} />
                </button>
                <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-[8px] sm:text-[10px] font-black text-primary border border-primary/20 shadow-sm">
                  {product.category}
                </div>
              </div>

              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-1 flex flex-col">
                <h3 className="font-black text-foreground text-xs sm:text-sm line-clamp-1">{product.name}</h3>

                <div className="flex flex-col gap-1 sm:gap-1.5 bg-muted/40 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-border/40">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground font-black">سعر الجملة</span>
                    <span className="text-[10px] sm:text-xs font-black text-orange-600">{(product.affiliatePrice || product.originalPrice || 0).toLocaleString()} دج</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground font-black">سعر البيع النهائي</span>
                    <span className="text-xs sm:text-sm font-black text-secondary">{(product.price || 0).toLocaleString()} دج</span>
                  </div>
                  <div className="h-px bg-border/50 my-0.5"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] sm:text-[10px] text-primary font-black">عمولة المسوق</span>
                    <span className="text-xs sm:text-sm font-black text-primary">{(product.commission || 0).toLocaleString()} دج</span>
                  </div>
                </div>

                {product.hasMarketingOffers && (
                  <div className="bg-orange-500/10 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-orange-500/20 text-center">
                    <p className="text-[8px] sm:text-[10px] text-orange-700 font-black leading-tight">
                      🎁 عروض تسويقية متوفرة
                    </p>
                  </div>
                )}
                {product.hasAffiliateGift && (
                  <div className="bg-purple-500/10 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-purple-500/20 text-center mt-1">
                    <p className="text-[8px] sm:text-[10px] text-purple-700 font-black leading-tight">
                      🎁 هذا المنتج يحتوي على هدية خاصة بالمسوق عند بيعه
                    </p>
                  </div>
                )}

                <div className="mt-auto pt-2">
                  <Button
                    variant="outline"
                    onClick={() => toggleStoreProduct(product.id)}
                    className={`w-full gap-2 rounded-lg sm:rounded-xl h-10 sm:h-11 text-[10px] sm:text-xs font-black ${isInStore ? "border-secondary text-secondary bg-secondary/5" : "border-border hover:bg-muted"
                      }`}
                  >
                    {isInStore ? <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <PackagePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    {isInStore ? "إزالة من المتجر" : "إضافة للمتجر"}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductsTab;
