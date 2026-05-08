import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Star, Users, ThumbsUp, Shield, Truck, Clock,
  Award, Check, Play, Image, Gift, MessageSquare, Timer, Package,
  ChevronDown, Phone, MapPin, User, AlertTriangle, Heart, Flame,
  ArrowRight, Sparkles, X, Camera
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from '@/config/api';


declare global {
  interface Window {
    fbq: any;
    _fbq: any;
    ttq: any;
    TiktokAnalyticsObject: any;
  }
}

export interface BundlePack {
  id: string;
  name: string;
  image: string;
  price: number;
}

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
  productId?: string;
  ownerId?: string;
  logo?: string;
  availableColors?: string[];
  availableSizes?: string[];
  commission?: number;
  galleryImages?: string[];
  bundles?: BundlePack[];
}

const defaultStoreName = "متجري";


const LandingPageView = () => {
  const { pageId, productId, affiliateId } = useParams();
  const { toast } = useToast();
  const [page, setPage] = useState<LandingPageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: "", phone: "", wilaya: "", commune: "", address: "", deliveryType: "home" as "home" | "desk", selectedColor: "", selectedSize: "" });

  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 14, seconds: 35 });
  const [wilayas, setWilayas] = useState<any[]>([]);
  const [communes, setCommunes] = useState<any[]>([]);
  const [shippingRate, setShippingRate] = useState({ home: 0, desk: 0 });
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [storeName, setStoreName] = useState<string>(defaultStoreName);
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const url = pageId 
          ? `${API_BASE_URL}/store/pages/${pageId}/public`
          : `${API_BASE_URL}/store/product-page/${productId}/${affiliateId}`;
        
        const res = await fetch(url);
        const json = await res.json();
        if (res.ok && json.data) {
          const found = json.data;
          // Ensure arrays and nested objects exist to prevent crashes
          const safeFound = {
            ...found,
            features: found.features || [],
            socialProof: found.socialProof || [],
            faqItems: found.faqItems || [],
            trustBadges: found.trustBadges || [],
            beforeAfterImages: found.beforeAfterImages || { before: "", after: "" },
            availableColors: found.availableColors || [],
            availableSizes: found.availableSizes || []
          };
          setPage(safeFound);

          if (safeFound.ownerId) {
            try {
              const storeRes = await fetch(`${API_BASE_URL}/store/public/${safeFound.ownerId}`);
              if (storeRes.ok) {
                const storeJson = await storeRes.json();
                if (storeJson.data?.storeInfo?.storeName) {
                  setStoreName(storeJson.data.storeInfo.storeName);
                }
              }
            } catch (err) {
              console.error("Failed to fetch store info", err);
            }
          }
        } else {
          // Fallback to localStorage for existing unsaved pages (optional/backward compatibility)
          const stored = localStorage.getItem("landing_pages");
          if (stored) {
            const pages: LandingPageConfig[] = JSON.parse(stored);
            const foundLocal = pages.find(p => p.id === pageId);
            if (foundLocal) setPage(foundLocal);
          }
        }
      } catch (err) {
        console.error('Failed to fetch page', err);
      } finally {
        setLoading(false);
      }
    };
    if (pageId || (productId && affiliateId)) fetchPage();
  }, [pageId, productId, affiliateId]);

  // Fetch Wilayas on mount
  useEffect(() => {
    const fetchWilayas = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/delivery/wilayas`);
        const data = await res.json();
        if (data.data) setWilayas(data.data);
      } catch (err) {
        console.error("Failed to fetch wilayas", err);
      }
    };
    fetchWilayas();
  }, []);

  // Fetch Communes and Rates when Wilaya changes
  useEffect(() => {
    if (!orderForm.wilaya) {
      setCommunes([]);
      setShippingRate({ home: 0, desk: 0 });
      return;
    }

    const fetchCommunesAndRates = async () => {
      setLoadingDelivery(true);
      try {
        // Fetch Communes
        const cRes = await fetch(`${API_BASE_URL}/delivery/communes?wilaya_id=${orderForm.wilaya}`);
        const cData = await cRes.json();
        if (cData.data) setCommunes(cData.data);

        // Fetch Rates
        const rRes = await fetch(`${API_BASE_URL}/delivery/rates?wilaya_id=${orderForm.wilaya}`);
        const rData = await rRes.json();
        if (rData.data) setShippingRate(rData.data);
      } catch (err) {
        console.error("Failed to fetch delivery data", err);
      } finally {
        setLoadingDelivery(false);
      }
    };

    fetchCommunesAndRates();
  }, [orderForm.wilaya]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Social proof notifications
  useEffect(() => {
    if (!page?.sections.includes("notification-popup")) return;
    const names = ["محمد من وهران", "سارة من الجزائر", "أحمد من قسنطينة", "فاطمة من باتنة", "يوسف من سطيف"];
    let i = 0;
    const interval = setInterval(() => {
      setShowNotification(true);
      i = (i + 1) % names.length;
      setTimeout(() => setShowNotification(false), 4000);
    }, 8000);
    setTimeout(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
    }, 3000);
    return () => clearInterval(interval);
  }, [page]);

  // Inject Tracking Pixels
  useEffect(() => {
    if (!page?.pixels) return;

    // Facebook Pixel Injection
    if (page.pixels.facebook) {
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", page.pixels.facebook);
      window.fbq("track", "PageView");
    }

    // TikTok Pixel Injection
    if (page.pixels.tiktok) {
      (function (w: any, d: any, t: any) {
        w.TiktokAnalyticsObject = t;
        var ttq = (w[t] = w[t] || []);
        ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
        ttq.setAndDefer = function (t: any, e: any) {
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        };
        for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
        ttq.instance = function (t: any) {
          for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
          return e;
        };
        ttq.load = function (e: any, n?: any) {
          var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
          ttq._i = ttq._i || {};
          ttq._i[e] = [];
          ttq._i[e]._u = i;
          ttq._t = ttq._t || {};
          ttq._t[e] = +new Date();
          ttq._o = ttq._o || {};
          ttq._o[e] = n || {};
          n = document.createElement("script");
          n.type = "text/javascript";
          n.async = !0;
          n.src = i + "?sdkid=" + e + "&lib=" + t;
          var s: any = document.getElementsByTagName("script")[0];
          s.parentNode.insertBefore(n, s);
        };
        ttq.load(page.pixels.tiktok);
        ttq.page();
      })(window, document, "ttq");
    }
  }, [page]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.name || !orderForm.phone || !orderForm.wilaya || !orderForm.commune || !orderForm.address) {
      toast({ title: "⚠️ يرجى ملء جميع الحقول الإجبارية بما في ذلك العنوان", variant: "destructive" });
      return;
    }

    // @ts-ignore
    if (p.availableColors?.length > 0 && !orderForm.selectedColor) {
      toast({ title: "تنبيه", description: "يرجى اختيار اللون المطلوب", variant: "destructive" });
      return;
    }

    // @ts-ignore
    if (p.availableSizes?.length > 0 && !orderForm.selectedSize) {
      toast({ title: "تنبيه", description: "يرجى اختيار المقاس المطلوب", variant: "destructive" });
      return;
    }

    const selectedBundle = p.bundles?.find(b => b.id === selectedBundleId);
    let activePrice = selectedBundle ? selectedBundle.price : p.price;
    let activeCommission = p.commission || 500;
    let selectedSizeLabel = orderForm.selectedSize;

    if (selectedOffer) {
      activePrice = selectedOffer.price;
      activeCommission = selectedOffer.commission;
      selectedSizeLabel = orderForm.selectedSize ? `${orderForm.selectedSize} - ${selectedOffer.name}` : selectedOffer.name;
    } else if (selectedBundle) {
      selectedSizeLabel = orderForm.selectedSize ? `${orderForm.selectedSize} - ${selectedBundle.name}` : selectedBundle.name;
    }

    const currentShipping = orderForm.deliveryType === "home" ? shippingRate.home : shippingRate.desk;
    const finalAmount = (activePrice * quantity) + currentShipping;

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: p.productId || p.id,
          affiliateId: p.ownerId || "aff-demo-123",
          customerName: orderForm.name,
          customerPhone: orderForm.phone,
          wilaya: orderForm.wilaya,
          commune: orderForm.commune,
          address: orderForm.address,
          quantity: quantity,
          totalAmount: finalAmount,
          commissionAmount: activeCommission * quantity,
          shippingFee: currentShipping,
          stopDesk: orderForm.deliveryType === "desk" ? 1 : 0,
          selectedColor: orderForm.selectedColor,
          selectedSize: selectedSizeLabel
        })

      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Order creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create order');
      }

      setOrderSubmitted(true);
      toast({ title: "✅ تم تسجيل طلبك بنجاح!", description: "سنتواصل معك قريباً لتأكيد الطلب" });

      // Fire Conversion Events if Pixels exist
      const conversionValue = p.price || 0;
      
      if (page?.pixels?.facebook && typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "Purchase", { value: conversionValue, currency: "DZD" });
      }
      
      if (page?.pixels?.tiktok && typeof window !== "undefined" && window.ttq) {
        window.ttq.track("CompletePayment", { contents: [{ content_id: page.id, content_name: page.productName, price: conversionValue, quantity: quantity }], value: conversionValue, currency: "DZD" });
      }
    } catch (err) {
      toast({ title: "خطأ", description: "فشل تسجيل الطلب، يرجى المحاولة لاحقاً", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">جاري التحميل...</p>
        </motion.div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 p-8">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <AlertTriangle className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-black text-foreground">الصفحة غير موجودة</h1>
          <p className="text-muted-foreground">هذه الصفحة غير متاحة أو تم حذفها (رقم الصفحة: {pageId})</p>
        </motion.div>
      </div>
    );
  }

  const p = page;
  const isDark = (bg: string) => bg.startsWith("#0") || bg.startsWith("#1") || bg.startsWith("#2") || bg === "#020617";
  const tc = isDark(p.backgroundColor) ? "#f1f5f9" : "#0f172a";
  const stc = isDark(p.backgroundColor) ? "#94a3b8" : "#64748b";
  const br = `${p.borderRadius}px`;
  const discountPercent = Math.round((1 - p.price / p.originalPrice) * 100);
  const shadowMap = { none: "", sm: "shadow-sm", md: "shadow-md", lg: "shadow-lg", xl: "shadow-xl" };

  const notificationNames = ["محمد من وهران", "سارة من الجزائر", "أحمد من قسنطينة", "فاطمة من باتنة"];

  // const wilayas = [ ... removed hardcoded list ... ]

  if (p.template === "original") {
    const currentShipping = orderForm.deliveryType === "home" ? shippingRate.home : shippingRate.desk;
    const selectedBundle = p.bundles?.find(b => b.id === selectedBundleId);
    let activePrice = selectedBundle ? selectedBundle.price : p.price;
    let activeOriginalPrice = p.originalPrice;

    if (selectedOffer) {
      activePrice = selectedOffer.price;
      activeOriginalPrice = selectedOffer.originalPrice;
    }

    const totalPrice = (activePrice * quantity) + currentShipping;
    const savings = (activeOriginalPrice - activePrice) * quantity;

    return (
      <div className="min-h-screen" style={{ backgroundColor: p.backgroundColor, fontFamily: p.fontFamily, color: tc }} dir="rtl">
        <link href={`https://fonts.googleapis.com/css2?family=${p.fontFamily === "cairo" ? "Cairo" : p.fontFamily === "tajawal" ? "Tajawal" : p.fontFamily === "almarai" ? "Almarai" : p.fontFamily === "changa" ? "Changa" : p.fontFamily === "ibm-plex" ? "IBM+Plex+Sans+Arabic" : p.fontFamily === "noto-kufi" ? "Noto+Kufi+Arabic" : "Readex+Pro"}:wght@400;600;700;800;900&display=swap`} rel="stylesheet" />
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-white" style={{ backgroundColor: p.logo ? "#fff" : p.primaryColor }}>
                 {p.logo ? (
                   <img src={p.logo} alt="Logo" className="w-full h-full object-contain p-1.5" />
                 ) : (
                   <ShoppingCart className="w-6 h-6 text-white" />
                 )}
               </div>
               <span className="font-bold text-lg hidden sm:block">{storeName}</span>
            </div>

            <a href="#order-form">
              <Button style={{ backgroundColor: p.primaryColor }} className="text-white font-bold rounded-full px-6">
                اطلب الآن
              </Button>
            </a>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className={`relative aspect-square overflow-hidden bg-muted ${shadowMap[p.shadowIntensity]}`} style={{ borderRadius: br }}>
                {p.heroImage ? (
                  <img src={p.heroImage} alt={p.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Image className="w-12 h-12 opacity-20" />
                    <span>صورة المنتج</span>
                  </div>
                )}
                {discountPercent > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                    خصم {discountPercent}%
                  </div>
                )}
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                {p.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-muted/50 rounded-xl p-3 border border-border/50">
                    <Check className="w-5 h-5" style={{ color: p.primaryColor }} />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Product Info & Form */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <span className="font-medium" style={{ color: p.primaryColor }}>{p.category}</span>
                <h1 className="text-3xl lg:text-4xl font-bold mt-2">{p.productName}</h1>
                <p className="mt-4 text-lg leading-relaxed" style={{ color: stc }}>{p.heroSubtitle}</p>
              </div>

              {/* Price Block */}
              <div className="rounded-2xl p-6 border transition-all" style={{ backgroundColor: `${p.primaryColor}08`, borderColor: `${p.primaryColor}20` }}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold" style={{ color: p.primaryColor }}>{activePrice.toLocaleString()} دج</span>
                  {activeOriginalPrice > activePrice && (
                    <span className="text-xl line-through opacity-50">{activeOriginalPrice.toLocaleString()} دج</span>
                  )}
                </div>
                {savings > 0 && <p className="font-semibold mt-2 opacity-80">وفّر {savings.toLocaleString()} دج</p>}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Truck, t: "توصيل مجاني", s: "لكل الولايات" },
                  { icon: Shield, t: "ضمان الجودة", s: "منتجات أصلية" },
                  { icon: Clock, t: "توصيل سريع", s: "3-5 أيام" },
                  { icon: Phone, t: "دعم متواصل", s: "24/7" },
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-sm border border-border/50">
                    <badge.icon className="w-8 h-8" style={{ color: p.primaryColor }} />
                    <div>
                      <p className="font-semibold text-sm">{badge.t}</p>
                      <p className="text-xs opacity-60">{badge.s}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Form */}
              <form id="order-form" onSubmit={handleOrder} className="bg-card rounded-2xl p-6 shadow-xl border border-border space-y-5">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6" style={{ color: p.primaryColor }} /> اطلب الآن
                </h2>

                <div className="space-y-4">
                  {/* @ts-ignore */}
                  {p.availableColors && p.availableColors.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold opacity-70">اختر اللون *</label>
                      <div className="flex flex-wrap gap-2">
                        {/* @ts-ignore */}
                        {p.availableColors.map((color: string) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setOrderForm({ ...orderForm, selectedColor: color })}
                            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                              orderForm.selectedColor === color 
                                ? "border-primary bg-primary/5 text-primary" 
                                : "border-muted bg-muted/30 text-muted-foreground hover:border-muted-foreground/30"
                            }`}
                            style={{ 
                              borderColor: orderForm.selectedColor === color ? p.primaryColor : undefined,
                              color: orderForm.selectedColor === color ? p.primaryColor : undefined,
                              backgroundColor: orderForm.selectedColor === color ? `${p.primaryColor}10` : undefined,
                            }}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* @ts-ignore */}
                  {p.availableSizes && p.availableSizes.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold opacity-70">اختر المقاس *</label>
                      <div className="flex flex-wrap gap-2">
                        {/* @ts-ignore */}
                        {p.availableSizes.map((size: string) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setOrderForm({ ...orderForm, selectedSize: size })}
                            className={`min-w-[50px] h-10 rounded-xl text-sm font-bold border-2 transition-all ${
                              orderForm.selectedSize === size 
                                ? "border-secondary bg-secondary/5 text-secondary" 
                                : "border-muted bg-muted/30 text-muted-foreground hover:border-muted-foreground/30"
                            }`}
                            style={{ 
                              borderColor: orderForm.selectedSize === size ? p.accentColor : undefined,
                              color: orderForm.selectedSize === size ? p.accentColor : undefined,
                              backgroundColor: orderForm.selectedSize === size ? `${p.accentColor}10` : undefined,
                            }}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">

                    <label className="text-sm font-bold opacity-70">الاسم الكامل *</label>
                    <Input 
                      placeholder="أدخل اسمك الكامل" 
                      value={orderForm.name} 
                      onChange={e => setOrderForm(f => ({ ...f, name: e.target.value }))}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold opacity-70">رقم الهاتف *</label>
                    <Input 
                      placeholder="07XXXXXXXX" 
                      value={orderForm.phone} 
                      onChange={e => setOrderForm(f => ({ ...f, phone: e.target.value }))}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold opacity-70">الولاية *</label>
                      <select 
                        className="w-full h-12 rounded-xl border bg-transparent px-3 appearance-none focus:ring-2"
                        style={{ outlineColor: p.primaryColor }}
                        value={orderForm.wilaya}
                        onChange={e => setOrderForm(f => ({ ...f, wilaya: e.target.value, commune: "", deliveryType: "home" }))}
                      >
                        <option value="">اختر الولاية</option>
                        {wilayas.map(w => <option key={w.wilaya_id} value={w.wilaya_id}>{w.wilaya_id} - {w.wilaya_name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold opacity-70">نوع التوصيل</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          type="button"
                          onClick={() => setOrderForm(f => ({ ...f, deliveryType: "home", commune: "" }))}
                          className={`h-12 rounded-xl border flex items-center justify-center gap-2 transition-all ${orderForm.deliveryType === "home" ? "ring-2 ring-primary border-primary bg-primary/5" : "bg-transparent"}`}
                          style={{ 
                            borderColor: orderForm.deliveryType === "home" ? p.primaryColor : undefined,
                            color: orderForm.deliveryType === "home" ? p.primaryColor : undefined,
                            backgroundColor: orderForm.deliveryType === "home" ? `${p.primaryColor}10` : undefined,
                          }}
                        >
                          <Truck className="w-4 h-4" /> للمنزل
                        </button>
                        <button 
                          type="button"
                          onClick={() => setOrderForm(f => ({ ...f, deliveryType: "desk", commune: "" }))}
                          className={`h-12 rounded-xl border flex items-center justify-center gap-2 transition-all ${orderForm.deliveryType === "desk" ? "ring-2 ring-primary border-primary bg-primary/5" : "bg-transparent"}`}
                          style={{ 
                            borderColor: orderForm.deliveryType === "desk" ? p.primaryColor : undefined,
                            color: orderForm.deliveryType === "desk" ? p.primaryColor : undefined,
                            backgroundColor: orderForm.deliveryType === "desk" ? `${p.primaryColor}10` : undefined,
                          }}
                        >
                          <MapPin className="w-4 h-4" /> للمكتب
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold opacity-70">البلدية *</label>
                    <select 
                      className="w-full h-12 rounded-xl border bg-transparent px-3 appearance-none focus:ring-2"
                      style={{ outlineColor: p.primaryColor }}
                      value={orderForm.commune}
                      onChange={e => setOrderForm(f => ({ ...f, commune: e.target.value }))}
                      disabled={!orderForm.wilaya || loadingDelivery}
                    >
                      <option value="">اختر البلدية</option>
                      {(orderForm.deliveryType === "desk"
                        ? communes.filter(c => c.has_stop_desk === 1)
                        : communes
                      ).map(c => <option key={c.commune_id || c.nom} value={c.nom}>{c.nom}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold opacity-70">العنوان بالتفصيل *</label>
                    <Input 
                      placeholder="البلدية، الحي، الشارع..." 
                      value={orderForm.address} 
                      onChange={e => setOrderForm(f => ({ ...f, address: e.target.value }))}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  {p.sections.includes("bundle") && p.bundles && p.bundles.length > 0 && !p.hasMarketingOffers && (
                    <div className="space-y-3 pt-2 text-right">
                      <label className="text-sm font-bold opacity-70">عروض الحزم (اختياري)</label>
                      <div className="grid grid-cols-1 gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedBundleId(null)}
                          className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                            selectedBundleId === null 
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                              : "border-muted bg-muted/20 hover:border-muted-foreground/30"
                          }`}
                        >
                          <span className="font-bold text-sm">المنتج الأساسي (قطعة واحدة)</span>
                          <span className="font-black" style={{ color: p.primaryColor }}>{p.price.toLocaleString()} دج</span>
                        </button>
                        
                        {p.bundles.map((bundle) => (
                          <button
                            key={bundle.id}
                            type="button"
                            onClick={() => setSelectedBundleId(bundle.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                              selectedBundleId === bundle.id 
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                                : "border-muted bg-muted/20 hover:border-muted-foreground/30"
                            }`}
                          >
                            {bundle.image && (
                              <img src={bundle.image} alt={bundle.name} className="w-12 h-12 rounded-lg object-cover border" />
                            )}
                            <div className="flex-1 text-right">
                              <p className="font-bold text-sm">{bundle.name}</p>
                            </div>
                            <div className="text-left shrink-0">
                              <span className="font-black text-lg block" style={{ color: p.primaryColor }}>{bundle.price.toLocaleString()} دج</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Marketing Offers */}
                  {p.hasMarketingOffers && p.marketingOffers && p.marketingOffers.length > 0 && (
                    <div className="space-y-3 pt-2 text-right">
                      <label className="text-sm font-bold opacity-70 flex items-center gap-2">
                        <Gift className="w-4 h-4" style={{ color: p.primaryColor }} /> العروض التسويقية
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {/* Standard Offer */}
                        <button
                          type="button"
                          onClick={() => setSelectedOffer(null)}
                          className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                            selectedOffer === null 
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                              : "border-muted bg-card hover:border-primary/30"
                          }`}
                          style={{ borderColor: selectedOffer === null ? p.primaryColor : undefined }}
                        >
                          <div className="space-y-1">
                            <p className="font-bold text-sm flex items-center gap-2">
                              {selectedOffer === null && <Check className="w-4 h-4" style={{ color: p.primaryColor }} />}
                              قطعة واحدة (عرض عادي)
                            </p>
                            <p className="text-xs text-muted-foreground line-through">{p.originalPrice.toLocaleString()} دج</p>
                          </div>
                          <p className="font-black text-lg" style={{ color: p.primaryColor }}>{p.price.toLocaleString()} دج</p>
                        </button>

                        {/* Custom Offers */}
                        {p.marketingOffers.map((offer: any, idx: number) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedOffer(offer)}
                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                              selectedOffer === offer 
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                                : "border-muted bg-card hover:border-primary/30"
                            }`}
                            style={{ borderColor: selectedOffer === offer ? p.primaryColor : undefined }}
                          >
                            <div className="space-y-1">
                              <p className="font-bold text-sm flex items-center gap-2">
                                {selectedOffer === offer && <Check className="w-4 h-4" style={{ color: p.primaryColor }} />}
                                {offer.name}
                              </p>
                              <p className="text-xs text-muted-foreground line-through">{offer.originalPrice.toLocaleString()} دج</p>
                            </div>
                            <p className="font-black text-lg" style={{ color: p.primaryColor }}>{offer.price.toLocaleString()} دج</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/50">
                    <span className="font-bold">الكمية</span>
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-background hover:bg-muted transition-colors">-</button>
                      <span className="font-black text-lg w-4 text-center">{quantity}</span>
                      <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-background hover:bg-muted transition-colors">+</button>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-2xl p-6 space-y-3 mt-6">
                   <div className="flex justify-between text-sm">
                     <span className="opacity-60">السعر</span>
                     <span className="font-bold">{(activePrice * quantity).toLocaleString()} دج</span>
                   </div>
                   {savings > 0 && (
                     <div className="flex justify-between text-sm text-green-600 font-bold">
                       <span>التوفير</span>
                       <span>-{savings.toLocaleString()} دج</span>
                     </div>
                   )}
                   <div className="flex justify-between text-sm">
                     <span className="opacity-60">التوصيل</span>
                     <span className="font-medium">{orderForm.wilaya ? `${currentShipping.toLocaleString()} دج` : "اختر الولاية"}</span>
                   </div>
                   <div className="flex justify-between font-black text-xl border-t border-border/50 pt-3 mt-2">
                     <span>المجموع</span>
                     <span style={{ color: p.primaryColor }}>{totalPrice.toLocaleString()} دج</span>
                   </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={orderSubmitted} 
                  className="w-full h-16 text-xl font-black rounded-2xl text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all" 
                  style={{ backgroundColor: p.primaryColor }}
                >
                   {orderSubmitted ? "تم الطلب بنجاح ✅" : "تأكيد الطلب الآن"}
                </Button>
                <p className="text-center text-[10px] opacity-40">بضغطك على الزر فأنت توافق على شروط الخدمة وسياسة الخصوصية</p>
              </form>
              {/* Additional Sections for Original Template */}
              {p.sections.includes("video") && (
                <div className="space-y-4 pt-8" id="video">
                  <h2 className="text-2xl font-bold border-r-4 border-primary pr-3">فيديو المنتج</h2>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                    {p.videoUrl ? (
                      p.videoUrl.includes("youtube.com") || p.videoUrl.includes("youtu.be") || p.videoUrl.includes("vimeo.com") ? (
                        <iframe 
                          className="w-full h-full"
                          src={p.videoUrl.includes("youtube.com") ? p.videoUrl.replace("watch?v=", "embed/") : p.videoUrl}
                          title="Product Video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <video 
                          src={p.videoUrl} 
                          className="w-full h-full object-cover" 
                          controls 
                          playsInline
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <Play className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {p.sections.includes("before-after") && (
                <div className="space-y-4 pt-8" id="before-after">
                  <h2 className="text-2xl font-bold border-r-4 border-primary pr-3">قبل وبعد الاستخدام</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl overflow-hidden border-2 border-red-300 shadow-lg">
                      <div className="bg-red-500 text-center py-2 text-sm font-bold text-white">قبل ❌</div>
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        {p.beforeAfterImages?.before ? <img src={p.beforeAfterImages.before} className="w-full h-full object-cover" /> : <Image className="w-12 h-12 opacity-20" />}
                      </div>
                    </div>
                    <div className="rounded-2xl overflow-hidden border-2 shadow-lg" style={{ borderColor: p.primaryColor }}>
                      <div className="text-center py-2 text-sm font-bold text-white" style={{ backgroundColor: p.primaryColor }}>بعد ✅</div>
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        {p.beforeAfterImages?.after ? <img src={p.beforeAfterImages.after} className="w-full h-full object-cover" /> : <Image className="w-12 h-12 opacity-20" />}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {p.sections.includes("reviews") && (
                <div className="space-y-6 pt-8" id="reviews">
                  <h2 className="text-2xl font-bold border-r-4 border-primary pr-3">آراء العملاء</h2>
                  <div className="grid gap-4">
                    {p.socialProof.map((review, i) => (
                      <div key={i} className="p-5 bg-card rounded-2xl border shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: p.primaryColor }}>
                              {review.name[0]}
                            </div>
                            <span className="font-bold">{review.name}</span>
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: review.rating }).map((_, j) => (
                              <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed opacity-80">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {p.sections.includes("faq") && (
                <div className="space-y-6 pt-8" id="faq">
                  <h2 className="text-2xl font-bold border-r-4 border-primary pr-3">الأسئلة الشائعة</h2>
                  <div className="grid gap-3">
                    {p.faqItems.map((faq, i) => (
                      <div key={i} className="p-5 border rounded-2xl bg-card">
                        <p className="font-bold mb-2">{faq.q}</p>
                        <p className="text-sm opacity-70 leading-relaxed">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Handle other templates
  if (p.template === "bold" || p.template === "minimal" || p.template === "dark") {
    // These will use the modern layout but with different styling injected via p
    // For "dark", we force dark mode styles
    if (p.template === "dark") {
      p.backgroundColor = "#0f172a";
      p.primaryColor = p.primaryColor || "#38bdf8";
    }
    if (p.template === "bold") {
      p.borderRadius = 0;
      p.fontFamily = "cairo";
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: p.backgroundColor, fontFamily: p.fontFamily, color: tc }} dir="rtl">
      {/* Google Fonts */}
      <link href={`https://fonts.googleapis.com/css2?family=${p.fontFamily === "cairo" ? "Cairo" : p.fontFamily === "tajawal" ? "Tajawal" : p.fontFamily === "almarai" ? "Almarai" : p.fontFamily === "changa" ? "Changa" : p.fontFamily === "ibm-plex" ? "IBM+Plex+Sans+Arabic" : p.fontFamily === "noto-kufi" ? "Noto+Kufi+Arabic" : "Readex+Pro"}:wght@400;600;700;800;900&display=swap`} rel="stylesheet" />

      {/* Urgency Bar */}
      {p.sections.includes("urgency-bar") && (
        <motion.div initial={{ y: -40 }} animate={{ y: 0 }} className="py-3 px-4 text-center text-sm font-bold text-white" style={{ backgroundColor: p.primaryColor }}>
          <span className="animate-pulse">🔥</span> {p.urgencyText} <span className="animate-pulse">🔥</span>
        </motion.div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ backgroundColor: isDark(p.backgroundColor) ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.9)", borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-white" style={{ backgroundColor: p.logo ? "#fff" : p.primaryColor }}>
              {p.logo ? (
                <img src={p.logo} alt="Logo" className="w-full h-full object-contain p-1.5" />
              ) : (
                <ShoppingCart className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <span className="text-sm font-bold block">{storeName}</span>
              <span className="text-xs" style={{ color: stc }}>شحن مجاني لكل الولايات 🚚</span>
            </div>
          </div>

          <a href="#order-form" className="text-xs font-bold px-5 py-2.5 rounded-full text-white shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: p.primaryColor }}>
            {p.ctaText}
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        {p.sections.includes("hero") && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="px-4 sm:px-6 py-8 sm:py-12">
            <div className={`${p.heroLayout === "split" ? "grid md:grid-cols-2 gap-8 items-center" : "space-y-6 text-center"}`}>
              {/* Image */}
              <div className={`relative overflow-hidden ${shadowMap[p.shadowIntensity]} ${p.imageStyle === "circle" ? "rounded-full aspect-square max-w-[400px] mx-auto" : p.imageStyle === "blob" ? "rounded-[30%_70%_70%_30%/30%_30%_70%_70%]" : ""}`}
                style={{ borderRadius: p.imageStyle === "rounded" ? br : p.imageStyle === "sharp" ? "0" : undefined }}>
                {p.heroImage ? (
                  <img src={p.heroImage} alt={p.productName} className="w-full h-full object-cover" style={{ aspectRatio: p.imageStyle === "circle" ? "1" : "4/3" }} />
                ) : (
                  <div className="w-full flex flex-col items-center justify-center gap-3 py-24 bg-muted" style={{ color: stc }}>
                    <Image className="w-16 h-16 opacity-20" />
                    <span className="text-sm">صورة المنتج</span>
                  </div>
                )}
                {discountPercent > 0 && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
                    className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-xl">
                    خصم {discountPercent}% 🔥
                  </motion.div>
                )}
              </div>

              {/* Text */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className={`space-y-4 ${p.heroLayout !== "split" ? "max-w-2xl mx-auto" : ""}`}>
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block" style={{ color: p.primaryColor, backgroundColor: `${p.primaryColor}15` }}>
                  {p.category}
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">{p.heroTitle}</h1>
                <p className="text-base sm:text-lg leading-relaxed" style={{ color: stc }}>{p.heroSubtitle}</p>

                <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
                  <div className="px-5 py-3 rounded-2xl inline-flex items-center gap-3" style={{ backgroundColor: `${p.primaryColor}15`, borderRadius: br }}>
                    <span className="text-3xl font-black" style={{ color: p.primaryColor }}>{p.price.toLocaleString()} دج</span>
                    {p.originalPrice > p.price && (
                      <span className="text-lg line-through" style={{ color: stc }}>{p.originalPrice.toLocaleString()} دج</span>
                    )}
                  </div>
                </div>

                <a href="#order-form"
                  className={`inline-block text-center text-lg font-black text-white px-10 py-4 shadow-2xl transition-all hover:scale-105 ${
                    p.ctaAnimation === "pulse" ? "animate-pulse" : p.ctaAnimation === "bounce" ? "animate-bounce" : ""
                  } ${p.ctaStyle === "pill" ? "rounded-full" : p.ctaStyle === "rounded" ? "rounded-xl" : "rounded-none"}`}
                  style={{ backgroundColor: p.primaryColor }}>
                  {p.ctaText} <ArrowRight className="w-5 h-5 inline-block mr-2 rotate-180" />
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Social Proof Numbers */}
        {p.sections.includes("social-proof") && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="px-4 sm:px-6 pb-8">
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
              {[
                { icon: Users, val: "2,340+", label: "عميل سعيد" },
                { icon: Star, val: "4.9/5", label: "تقييم عام" },
                { icon: ThumbsUp, val: "98%", label: "معدل الرضا" },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`p-4 rounded-2xl border text-center ${shadowMap[p.shadowIntensity]}`}
                  style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
                  <s.icon className="w-6 h-6 mx-auto mb-2" style={{ color: p.primaryColor }} />
                  <p className="text-xl font-black">{s.val}</p>
                  <p className="text-xs mt-1" style={{ color: stc }}>{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Features */}
        {p.sections.includes("features") && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="px-4 sm:px-6 pb-8">
            <h2 className="text-2xl font-black text-center mb-6 flex items-center justify-center gap-2">
              <Star className="w-6 h-6" style={{ color: p.primaryColor }} /> لماذا تختار هذا المنتج؟
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {p.features.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-3 p-4 border rounded-2xl ${shadowMap[p.shadowIntensity]}`}
                  style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${p.primaryColor}15` }}>
                    <Check className="w-5 h-5" style={{ color: p.primaryColor }} />
                  </div>
                  <span className="text-sm font-bold">{f}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Gallery Section */}
        {p.sections.includes("gallery") && p.galleryImages && p.galleryImages.length > 0 && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="px-4 sm:px-6 pb-8">
            <h2 className="text-2xl font-black text-center mb-6 flex items-center justify-center gap-2">
              <Camera className="w-6 h-6" style={{ color: p.primaryColor }} /> صور إضافية
            </h2>
            <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
              {(p.galleryImages || []).map((img, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`aspect-square overflow-hidden bg-muted border ${shadowMap[p.shadowIntensity]}`}
                  style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
                  <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Video */}
        {p.sections.includes("video") && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="px-4 sm:px-6 pb-8">
            <div className={`relative aspect-video rounded-2xl overflow-hidden bg-muted flex items-center justify-center max-w-3xl mx-auto ${shadowMap[p.shadowIntensity]}`}
              style={{ borderRadius: br }}>
              {p.videoUrl ? (
                p.videoUrl.includes("youtube.com") || p.videoUrl.includes("youtu.be") || p.videoUrl.includes("vimeo.com") ? (
                  <iframe src={p.videoUrl} className="w-full h-full" allowFullScreen />
                ) : (
                  <video src={p.videoUrl} className="w-full h-full object-cover" controls playsInline />
                )
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl cursor-pointer transition-transform hover:scale-110" style={{ backgroundColor: p.primaryColor }}>
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                  <p className="absolute bottom-4 text-sm font-bold" style={{ color: stc }}>شاهد الفيديو التوضيحي</p>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Before/After */}
        {p.sections.includes("before-after") && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="px-4 sm:px-6 pb-8">
            <h2 className="text-2xl font-black text-center mb-6">قبل وبعد الاستخدام</h2>
            <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
              <div className={`rounded-2xl overflow-hidden border-2 border-red-300 ${shadowMap[p.shadowIntensity]}`} style={{ borderRadius: br }}>
                <div className="bg-red-500 text-center py-2 text-sm font-bold text-white">قبل ❌</div>
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {p.beforeAfterImages.before ? <img src={p.beforeAfterImages.before} className="w-full h-full object-cover" /> : <Image className="w-12 h-12 opacity-20" />}
                </div>
              </div>
              <div className={`rounded-2xl overflow-hidden border-2 ${shadowMap[p.shadowIntensity]}`} style={{ borderColor: p.primaryColor, borderRadius: br }}>
                <div className="text-center py-2 text-sm font-bold text-white" style={{ backgroundColor: p.primaryColor }}>بعد ✅</div>
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {p.beforeAfterImages.after ? <img src={p.beforeAfterImages.after} className="w-full h-full object-cover" /> : <Image className="w-12 h-12 opacity-20" />}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Trust Badges */}
        {p.sections.includes("trust-badges") && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="px-4 sm:px-6 pb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {[
                { icon: Truck, t: "توصيل سريع", s: "3-5 أيام" },
                { icon: Shield, t: "ضمان الجودة", s: "منتج أصلي" },
                { icon: Clock, t: "شحن مجاني", s: "لكل الولايات" },
                { icon: Phone, t: "دعم متواصل", s: "24/7" },
              ].map((badge, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`flex flex-col items-center gap-2 p-4 border rounded-2xl text-center ${shadowMap[p.shadowIntensity]}`}
                  style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
                  <badge.icon className="w-6 h-6" style={{ color: p.primaryColor }} />
                  <span className="text-xs font-bold">{badge.t}</span>
                  <span className="text-[10px] opacity-60">{badge.s}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reviews */}
        {p.sections.includes("reviews") && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="px-4 sm:px-6 pb-8">
            <h2 className="text-2xl font-black text-center mb-6 flex items-center justify-center gap-2">
              <MessageSquare className="w-6 h-6" style={{ color: p.primaryColor }} /> آراء العملاء
            </h2>
            <div className="space-y-4 max-w-xl mx-auto">
              {p.socialProof.map((review, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  className={`p-5 border rounded-2xl space-y-3 ${shadowMap[p.shadowIntensity]}`}
                  style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: p.primaryColor }}>
                        {review.name[0]}
                      </div>
                      <div>
                        <span className="text-sm font-bold block">{review.name}</span>
                        <span className="text-xs" style={{ color: stc }}>مشتري مؤكد ✅</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: stc }}>{review.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Countdown */}
        {p.sections.includes("countdown") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="px-4 sm:px-6 pb-8">
            <div className={`p-6 rounded-2xl text-center space-y-4 max-w-xl mx-auto ${shadowMap[p.shadowIntensity]}`}
              style={{ backgroundColor: `${p.primaryColor}10`, borderRadius: br }}>
              <p className="text-lg font-bold" style={{ color: p.primaryColor }}>⏰ العرض ينتهي خلال</p>
              <div className="flex justify-center gap-4" dir="ltr">
                {[
                  { v: String(countdown.hours).padStart(2, "0"), l: "ساعة" },
                  { v: String(countdown.minutes).padStart(2, "0"), l: "دقيقة" },
                  { v: String(countdown.seconds).padStart(2, "0"), l: "ثانية" },
                ].map((t, i) => (
                  <div key={i} className="text-center">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black text-white shadow-lg"
                      style={{ backgroundColor: p.primaryColor }}>
                      {t.v}
                    </div>
                    <p className="text-xs mt-2 font-medium" style={{ color: stc }}>{t.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Bundle Offers */}
        {p.sections.includes("bundle") && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="px-4 sm:px-6 pb-8">
            <h2 className="text-2xl font-black text-center mb-6 flex items-center justify-center gap-2">
              <Gift className="w-6 h-6" style={{ color: p.primaryColor }} /> عروض خاصة
            </h2>
            <div className="space-y-3 max-w-xl mx-auto">
              {[
                { qty: "1x", price: p.price, label: "قطعة واحدة", save: 0, popular: false },
                { qty: "2x", price: Math.round(p.price * 1.7), label: "قطعتين", save: 15, popular: true },
                { qty: "3x", price: Math.round(p.price * 2.3), label: "ثلاث قطع", save: 25, popular: false },
              ].map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`flex items-center justify-between p-5 border-2 rounded-2xl relative cursor-pointer transition-all hover:shadow-lg ${b.popular ? "shadow-md" : ""}`}
                  style={{ borderColor: b.popular ? p.primaryColor : (isDark(p.backgroundColor) ? "#334155" : "#e2e8f0"), borderRadius: br }}>
                  {b.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg" style={{ backgroundColor: p.primaryColor }}>
                      ⭐ الأكثر طلباً
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black" style={{ color: p.primaryColor }}>{b.qty}</span>
                    <span className="text-sm font-bold">{b.label}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-lg font-black">{b.price.toLocaleString()} دج</span>
                    {b.save > 0 && <span className="text-xs font-bold text-red-500 mr-2">وفّر {b.save}%</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* FAQ */}
        {p.sections.includes("faq") && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="px-4 sm:px-6 pb-8">
            <h2 className="text-2xl font-black text-center mb-6 flex items-center justify-center gap-2">
              <MessageSquare className="w-6 h-6" style={{ color: p.primaryColor }} /> أسئلة شائعة
            </h2>
            <div className="space-y-3 max-w-xl mx-auto">
              {p.faqItems.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                  className={`border rounded-2xl overflow-hidden ${shadowMap[p.shadowIntensity]}`}
                  style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-sm font-bold text-right">
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${faqOpen === i ? "rotate-180" : ""}`} style={{ color: p.primaryColor }} />
                  </button>
                  <AnimatePresence>
                    {faqOpen === i && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <p className="px-4 pb-4 text-sm" style={{ color: stc }}>{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Guarantee */}
        {p.sections.includes("guarantee") && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="px-4 sm:px-6 pb-8">
            <div className={`p-6 rounded-2xl border-2 border-dashed text-center space-y-3 max-w-xl mx-auto ${shadowMap[p.shadowIntensity]}`}
              style={{ borderColor: p.primaryColor, borderRadius: br }}>
              <Shield className="w-12 h-12 mx-auto" style={{ color: p.primaryColor }} />
              <p className="text-xl font-black">ضمان 30 يوم</p>
              <p className="text-sm" style={{ color: stc }}>إذا لم يعجبك المنتج، يمكنك إرجاعه واسترداد أموالك بالكامل</p>
            </div>
          </motion.div>
        )}

        {/* Shipping */}
        {p.sections.includes("shipping") && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="px-4 sm:px-6 pb-8">
            <div className={`p-6 rounded-2xl border space-y-4 max-w-xl mx-auto ${shadowMap[p.shadowIntensity]}`}
              style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Truck className="w-5 h-5" style={{ color: p.primaryColor }} /> معلومات التوصيل
              </h3>
              {[
                { icon: Truck, text: "توصيل مجاني لجميع الولايات 58" },
                { icon: Clock, text: "التوصيل خلال 2-5 أيام عمل" },
                { icon: ShoppingCart, text: "الدفع عند الاستلام COD 💵" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" style={{ color: p.primaryColor }} />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ORDER FORM */}
        {p.sections.includes("cta") && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            id="order-form" className="px-4 sm:px-6 pb-12">
            <div className={`p-6 sm:p-8 border-2 rounded-2xl space-y-5 max-w-xl mx-auto ${shadowMap[p.shadowIntensity]}`}
              style={{ borderColor: p.primaryColor, borderRadius: br }}>
              {orderSubmitted ? (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center space-y-4 py-8">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg" style={{ backgroundColor: `${p.primaryColor}15` }}>
                    <Check className="w-10 h-10" style={{ color: p.primaryColor }} />
                  </div>
                  <h3 className="text-2xl font-black">تم تسجيل طلبك بنجاح! 🎉</h3>
                  <p className="text-sm" style={{ color: stc }}>سنتواصل معك عبر الهاتف لتأكيد الطلب</p>
                </motion.div>
              ) : (
                <form onSubmit={handleOrder} className="space-y-4 text-right" dir="rtl">
                  <div className="text-center space-y-2 mb-6">
                    <h3 className="text-xl font-black flex items-center justify-center gap-2">
                      <ShoppingCart className="w-5 h-5" style={{ color: p.primaryColor }} /> اطلب الآن
                    </h3>
                    <p className="text-sm" style={{ color: stc }}>املأ النموذج التالي وسنتواصل معك لتأكيد الطلب</p>
                  </div>

                  <div className="space-y-4">
                    {/* @ts-ignore */}
                    {p.availableColors && p.availableColors.length > 0 && (
                      <div className="space-y-2 text-right">
                        <label className="text-sm font-bold opacity-70">اختر اللون *</label>
                        <div className="flex flex-wrap gap-2 justify-start">
                          {/* @ts-ignore */}
                          {p.availableColors.map((color: string) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setOrderForm({ ...orderForm, selectedColor: color })}
                              className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                                orderForm.selectedColor === color 
                                  ? "border-primary bg-primary/5 text-primary" 
                                  : "border-muted bg-muted/30 text-muted-foreground hover:border-muted-foreground/30"
                              }`}
                              style={{ 
                                borderRadius: `${Math.min(p.borderRadius, 16)}px`,
                                borderColor: orderForm.selectedColor === color ? p.primaryColor : undefined,
                                color: orderForm.selectedColor === color ? p.primaryColor : undefined,
                                backgroundColor: orderForm.selectedColor === color ? `${p.primaryColor}10` : undefined,
                              }}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* @ts-ignore */}
                    {p.availableSizes && p.availableSizes.length > 0 && (
                      <div className="space-y-2 text-right">
                        <label className="text-sm font-bold opacity-70">اختر المقاس *</label>
                        <div className="flex flex-wrap gap-2 justify-start">
                          {/* @ts-ignore */}
                          {p.availableSizes.map((size: string) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => setOrderForm({ ...orderForm, selectedSize: size })}
                              className={`min-w-[50px] h-10 rounded-xl text-sm font-bold border-2 transition-all ${
                                orderForm.selectedSize === size 
                                  ? "border-secondary bg-secondary/5 text-secondary" 
                                  : "border-muted bg-muted/30 text-muted-foreground hover:border-muted-foreground/30"
                              }`}
                              style={{ 
                                borderRadius: `${Math.min(p.borderRadius, 16)}px`,
                                borderColor: orderForm.selectedSize === size ? p.accentColor : undefined,
                                color: orderForm.selectedSize === size ? p.accentColor : undefined,
                                backgroundColor: orderForm.selectedSize === size ? `${p.accentColor}10` : undefined,
                              }}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {p.sections.includes("bundle") && p.bundles && p.bundles.length > 0 && !p.hasMarketingOffers && (
                      <div className="space-y-3 pt-2 text-right">
                        <label className="text-sm font-bold opacity-70">عروض الحزم (اختياري)</label>
                        <div className="grid grid-cols-1 gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedBundleId(null)}
                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                              selectedBundleId === null 
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                                : "border-muted bg-muted/20 hover:border-muted-foreground/30"
                            }`}
                          >
                            <span className="font-bold text-sm">المنتج الأساسي (قطعة واحدة)</span>
                            <span className="font-black" style={{ color: p.primaryColor }}>{p.price.toLocaleString()} دج</span>
                          </button>
                          
                          {p.bundles.map((bundle) => (
                            <button
                              key={bundle.id}
                              type="button"
                              onClick={() => setSelectedBundleId(bundle.id)}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                selectedBundleId === bundle.id 
                                  ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                                  : "border-muted bg-muted/20 hover:border-muted-foreground/30"
                              }`}
                            >
                              {bundle.image && (
                                <img src={bundle.image} alt={bundle.name} className="w-12 h-12 rounded-lg object-cover border" />
                              )}
                              <div className="flex-1 text-right">
                                <p className="font-bold text-sm">{bundle.name}</p>
                              </div>
                              <div className="text-left shrink-0">
                                <span className="font-black text-lg block" style={{ color: p.primaryColor }}>{bundle.price.toLocaleString()} دج</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Marketing Offers */}
                  {p.hasMarketingOffers && p.marketingOffers && p.marketingOffers.length > 0 && (
                    <div className="space-y-3 pt-2 text-right">
                      <label className="text-sm font-bold opacity-70 flex items-center gap-2">
                        <Gift className="w-4 h-4" style={{ color: p.primaryColor }} /> العروض التسويقية
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {/* Standard Offer */}
                        <button
                          type="button"
                          onClick={() => setSelectedOffer(null)}
                          className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                            selectedOffer === null 
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                              : "border-muted bg-card hover:border-primary/30"
                          }`}
                          style={{ borderColor: selectedOffer === null ? p.primaryColor : undefined }}
                        >
                          <div className="space-y-1">
                            <p className="font-bold text-sm flex items-center gap-2">
                              {selectedOffer === null && <Check className="w-4 h-4" style={{ color: p.primaryColor }} />}
                              قطعة واحدة (عرض عادي)
                            </p>
                            <p className="text-xs text-muted-foreground line-through">{p.originalPrice.toLocaleString()} دج</p>
                          </div>
                          <p className="font-black text-lg" style={{ color: p.primaryColor }}>{p.price.toLocaleString()} دج</p>
                        </button>

                        {/* Custom Offers */}
                        {p.marketingOffers.map((offer: any, idx: number) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedOffer(offer)}
                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                              selectedOffer === offer 
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                                : "border-muted bg-card hover:border-primary/30"
                            }`}
                            style={{ borderColor: selectedOffer === offer ? p.primaryColor : undefined }}
                          >
                            <div className="space-y-1">
                              <p className="font-bold text-sm flex items-center gap-2">
                                {selectedOffer === offer && <Check className="w-4 h-4" style={{ color: p.primaryColor }} />}
                                {offer.name}
                              </p>
                              <p className="text-xs text-muted-foreground line-through">{offer.originalPrice.toLocaleString()} دج</p>
                            </div>
                            <p className="font-black text-lg" style={{ color: p.primaryColor }}>{offer.price.toLocaleString()} دج</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">

                      <label className="text-sm font-bold opacity-70">الاسم الكامل *</label>
                      <Input 
                        placeholder="أدخل اسمك الكامل" 
                        value={orderForm.name} 
                        onChange={e => setOrderForm(f => ({ ...f, name: e.target.value }))}
                        className="h-12 rounded-xl"
                        style={{ borderRadius: `${Math.min(p.borderRadius, 16)}px`, borderColor: isDark(p.backgroundColor) ? "#334155" : "#d1d5db", backgroundColor: isDark(p.backgroundColor) ? "#1e293b" : "#fff", color: tc }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-bold opacity-70">رقم الهاتف *</label>
                      <Input 
                        placeholder="07XXXXXXXX" 
                        value={orderForm.phone} 
                        onChange={e => setOrderForm(f => ({ ...f, phone: e.target.value }))}
                        className="h-12 rounded-xl"
                        style={{ borderRadius: `${Math.min(p.borderRadius, 16)}px`, borderColor: isDark(p.backgroundColor) ? "#334155" : "#d1d5db", backgroundColor: isDark(p.backgroundColor) ? "#1e293b" : "#fff", color: tc }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold opacity-70">الولاية *</label>
                        <select 
                          className="w-full h-12 rounded-xl border bg-transparent px-3 appearance-none focus:ring-2"
                          style={{ 
                            borderRadius: `${Math.min(p.borderRadius, 16)}px`, 
                            borderColor: isDark(p.backgroundColor) ? "#334155" : "#d1d5db", 
                            backgroundColor: isDark(p.backgroundColor) ? "#1e293b" : "#fff", 
                            color: tc,
                            outlineColor: p.primaryColor 
                          }}
                          value={orderForm.wilaya}
                          onChange={e => setOrderForm(f => ({ ...f, wilaya: e.target.value, commune: "", deliveryType: "home" }))}
                        >
                          <option value="">اختر الولاية</option>
                          {wilayas.map(w => <option key={w.wilaya_id} value={w.wilaya_id}>{w.wilaya_id} - {w.wilaya_name}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold opacity-70">نوع التوصيل</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            type="button"
                            onClick={() => setOrderForm(f => ({ ...f, deliveryType: "home", commune: "" }))}
                            className={`h-12 rounded-xl border flex items-center justify-center gap-2 transition-all ${orderForm.deliveryType === "home" ? "ring-2 ring-primary" : ""}`}
                            style={{ 
                              borderRadius: `${Math.min(p.borderRadius, 16)}px`,
                              borderColor: orderForm.deliveryType === "home" ? p.primaryColor : (isDark(p.backgroundColor) ? "#334155" : "#d1d5db"),
                              color: orderForm.deliveryType === "home" ? p.primaryColor : tc,
                              backgroundColor: orderForm.deliveryType === "home" ? `${p.primaryColor}15` : "transparent",
                            }}
                          >
                            <Truck className="w-4 h-4" /> للمنزل
                          </button>
                          <button 
                            type="button"
                            onClick={() => setOrderForm(f => ({ ...f, deliveryType: "desk", commune: "" }))}
                            className={`h-12 rounded-xl border flex items-center justify-center gap-2 transition-all ${orderForm.deliveryType === "desk" ? "ring-2 ring-primary" : ""}`}
                            style={{ 
                              borderRadius: `${Math.min(p.borderRadius, 16)}px`,
                              borderColor: orderForm.deliveryType === "desk" ? p.primaryColor : (isDark(p.backgroundColor) ? "#334155" : "#d1d5db"),
                              color: orderForm.deliveryType === "desk" ? p.primaryColor : tc,
                              backgroundColor: orderForm.deliveryType === "desk" ? `${p.primaryColor}15` : "transparent",
                            }}
                          >
                            <MapPin className="w-4 h-4" /> للمكتب
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold opacity-70">البلدية *</label>
                      <select 
                        className="w-full h-12 rounded-xl border bg-transparent px-3 appearance-none focus:ring-2"
                        style={{ 
                          borderRadius: `${Math.min(p.borderRadius, 16)}px`, 
                          borderColor: isDark(p.backgroundColor) ? "#334155" : "#d1d5db", 
                          backgroundColor: isDark(p.backgroundColor) ? "#1e293b" : "#fff", 
                          color: tc,
                          outlineColor: p.primaryColor 
                        }}
                        value={orderForm.commune}
                        onChange={e => setOrderForm(f => ({ ...f, commune: e.target.value }))}
                        disabled={!orderForm.wilaya || loadingDelivery}
                      >
                        <option value="">اختر البلدية</option>
                        {(orderForm.deliveryType === "desk"
                          ? communes.filter(c => c.has_stop_desk === 1)
                          : communes
                        ).map(c => <option key={c.commune_id || c.nom} value={c.nom}>{c.nom}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold opacity-70">العنوان بالتفصيل *</label>
                      <Input 
                        placeholder="البلدية، الحي، الشارع..." 
                        value={orderForm.address} 
                        onChange={e => setOrderForm(f => ({ ...f, address: e.target.value }))}
                        className="h-12 rounded-xl"
                        style={{ borderRadius: `${Math.min(p.borderRadius, 16)}px`, borderColor: isDark(p.backgroundColor) ? "#334155" : "#d1d5db", backgroundColor: isDark(p.backgroundColor) ? "#1e293b" : "#fff", color: tc }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/30">
                      <span className="font-bold">الكمية</span>
                      <div className="flex items-center gap-4">
                        <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-background hover:bg-muted transition-colors">-</button>
                        <span className="font-black text-lg w-4 text-center">{quantity}</span>
                        <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-background hover:bg-muted transition-colors">+</button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/10 rounded-2xl p-4 border border-border/20 space-y-2 mt-6">
                     {/* Dynamic pricing calculation */}
                     {(() => {
                        const currentShipping = orderForm.deliveryType === "home" ? shippingRate.home : shippingRate.desk;
                        const totalPrice = (p.price * quantity) + currentShipping;
                        const savings = (p.originalPrice - p.price) * quantity;
                        return (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="opacity-60">السعر</span>
                              <span className="font-bold">{(p.price * quantity).toLocaleString()} دج</span>
                            </div>
                            {savings > 0 && (
                              <div className="flex justify-between text-sm text-green-600 font-bold">
                                <span>التوفير</span>
                                <span>-{savings.toLocaleString()} دج</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="opacity-60">التوصيل</span>
                              <span className="font-medium">{orderForm.wilaya ? `${currentShipping.toLocaleString()} دج` : "اختر الولاية"}</span>
                            </div>
                            <div className="flex justify-between font-black text-xl border-t border-border/20 pt-3 mt-2">
                              <span>المجموع</span>
                              <span style={{ color: p.primaryColor }}>{totalPrice.toLocaleString()} دج</span>
                            </div>
                          </>
                        );
                     })()}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={orderSubmitted} 
                    className="w-full h-16 text-xl font-black rounded-2xl text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-4" 
                    style={{ backgroundColor: p.primaryColor }}
                  >
                     تأكيد الطلب الآن
                  </Button>
                  <p className="text-center text-[10px] opacity-40">بضغطك على الزر فأنت توافق على شروط الخدمة وسياسة الخصوصية</p>
                </form>
              )}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="border-t py-8 text-center mt-12" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0" }}>
          <p className="text-xs opacity-60" style={{ color: tc }}>© {new Date().getFullYear()} {storeName} — جميع الحقوق محفوظة</p>
          <p className="text-[10px] opacity-40 mt-2">نحن نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا</p>
        </div>
      </div>

      {/* Floating WhatsApp / CTA */}
      {p.showFloatingCta && (
        <motion.a 
          href="#order-form" 
          initial={{ y: 100, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 2, type: "spring" }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 text-white font-black px-10 py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-base transition-all hover:scale-110 active:scale-95 flex items-center gap-2"
          style={{ backgroundColor: p.primaryColor }}
        >
          <ShoppingCart className="w-5 h-5" /> {p.ctaText}
        </motion.a>
      )}

      {/* Social Proof Notification Popup */}
      <AnimatePresence>
        {showNotification && p.sections.includes("notification-popup") && (
          <motion.div 
            initial={{ x: -300, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: -300, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 p-4 border rounded-2xl flex items-center gap-3 shadow-2xl max-w-xs"
            style={{ 
              borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", 
              borderRadius: br, 
              backgroundColor: isDark(p.backgroundColor) ? "#1e293b" : "#ffffff" 
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${p.primaryColor}15` }}>
              <ShoppingCart className="w-6 h-6" style={{ color: p.primaryColor }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: tc }}>{notificationNames[Math.floor(Math.random() * notificationNames.length)]}</p>
              <p className="text-xs" style={{ color: stc }}>اشترى هذا المنتج منذ {Math.floor(Math.random() * 10) + 1} دقائق</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom CSS */}
      {p.customCss && <style>{p.customCss}</style>}
    </div>
  );
};

export default LandingPageView;
