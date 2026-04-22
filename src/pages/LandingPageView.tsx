import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Star, Users, ThumbsUp, Shield, Truck, Clock,
  Award, Check, Play, Image, Gift, MessageSquare, Timer, Package,
  ChevronDown, Phone, MapPin, User, AlertTriangle, Heart, Flame,
  ArrowRight, Sparkles, X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
    ttq: any;
    TiktokAnalyticsObject: any;
  }
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
}

const LandingPageView = () => {
  const { pageId } = useParams();
  const { toast } = useToast();
  const [page, setPage] = useState<LandingPageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: "", phone: "", wilaya: "", commune: "", deliveryType: "home" as "home" | "desk" });
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 14, seconds: 35 });
  const [wilayas, setWilayas] = useState<any[]>([]);
  const [communes, setCommunes] = useState<any[]>([]);
  const [shippingRate, setShippingRate] = useState({ home: 0, desk: 0 });
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const stored = localStorage.getItem("landing_pages");
    if (stored) {
      const pages: LandingPageConfig[] = JSON.parse(stored);
      const found = pages.find(p => p.id === pageId);
      console.log("LandingPageView -> Found page:", found);
      if (found) {
        // Ensure arrays and nested objects exist to prevent crashes from old mock data
        const safeFound = {
          ...found,
          features: found.features || [],
          socialProof: found.socialProof || [],
          faqItems: found.faqItems || [],
          trustBadges: found.trustBadges || [],
          beforeAfterImages: found.beforeAfterImages || { before: "", after: "" }
        };
        setPage(safeFound);
        // Increment views
        const updated = pages.map(p => p.id === pageId ? { ...safeFound, views: (safeFound.views || 0) + 1 } : p);
        localStorage.setItem("landing_pages", JSON.stringify(updated));
      }
    }
    setLoading(false);
  }, [pageId]);

  // Fetch Wilayas on mount
  useEffect(() => {
    const fetchWilayas = async () => {
      try {
        const res = await fetch('https://profit-link.onrender.com/api/delivery/wilayas');
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
        const cRes = await fetch(`https://profit-link.onrender.com/api/delivery/communes?wilaya_id=${orderForm.wilaya}`);
        const cData = await cRes.json();
        if (cData.data) setCommunes(cData.data);

        // Fetch Rates
        const rRes = await fetch(`https://profit-link.onrender.com/api/delivery/rates?wilaya_id=${orderForm.wilaya}`);
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
    if (!orderForm.name || !orderForm.phone || !orderForm.wilaya || !orderForm.commune) {
      toast({ title: "⚠️ يرجى ملء جميع الحقول", variant: "destructive" });
      return;
    }

    const currentShipping = orderForm.deliveryType === "home" ? shippingRate.home : shippingRate.desk;
    const finalAmount = (p.price * quantity) + currentShipping;

    try {
      const response = await fetch('https://profit-link.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: p.productId || p.id,
          affiliateId: p.ownerId || "aff-demo-123",
          customerName: orderForm.name,
          customerPhone: orderForm.phone,
          wilaya: orderForm.wilaya,
          commune: orderForm.commune,
          address: orderForm.wilaya + " " + orderForm.commune, // Basic address for now
          quantity: quantity,
          totalAmount: finalAmount,
          commissionAmount: 500, // Placeholder
          shippingFee: currentShipping,
          stopDesk: orderForm.deliveryType === "desk" ? 1 : 0
        })
      });

      if (!response.ok) throw new Error('Failed to create order');

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
    const totalPrice = (p.price * quantity) + currentShipping;
    const savings = (p.originalPrice - p.price) * quantity;

    return (
      <div className="min-h-screen" style={{ backgroundColor: p.backgroundColor, fontFamily: p.fontFamily, color: tc }} dir="rtl">
        <link href={`https://fonts.googleapis.com/css2?family=${p.fontFamily === "cairo" ? "Cairo" : p.fontFamily === "tajawal" ? "Tajawal" : p.fontFamily === "almarai" ? "Almarai" : p.fontFamily === "changa" ? "Changa" : p.fontFamily === "ibm-plex" ? "IBM+Plex+Sans+Arabic" : p.fontFamily === "noto-kufi" ? "Noto+Kufi+Arabic" : "Readex+Pro"}:wght@400;600;700;800;900&display=swap`} rel="stylesheet" />
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: p.primaryColor }}>
                 <ShoppingCart className="w-5 h-5 text-white" />
               </div>
               <span className="font-bold text-lg hidden sm:block">{p.productName}</span>
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
              <div className="rounded-2xl p-6 border" style={{ backgroundColor: `${p.primaryColor}08`, borderColor: `${p.primaryColor}20` }}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold" style={{ color: p.primaryColor }}>{p.price.toLocaleString()} دج</span>
                  {p.originalPrice > p.price && (
                    <span className="text-xl line-through opacity-50">{p.originalPrice.toLocaleString()} دج</span>
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
                  <Input 
                    placeholder="الاسم الكامل" 
                    value={orderForm.name} 
                    onChange={e => setOrderForm(f => ({ ...f, name: e.target.value }))}
                    className="h-12 rounded-xl"
                  />
                  <Input 
                    placeholder="رقم الهاتف" 
                    value={orderForm.phone} 
                    onChange={e => setOrderForm(f => ({ ...f, phone: e.target.value }))}
                    className="h-12 rounded-xl"
                  />
                  <select 
                    className="w-full h-12 rounded-xl border bg-transparent px-3 appearance-none"
                    value={orderForm.wilaya}
                    onChange={e => setOrderForm(f => ({ ...f, wilaya: e.target.value, commune: "" }))}
                  >
                    <option value="">اختر الولاية</option>
                    {wilayas.map(w => <option key={w.wilaya_id} value={w.wilaya_id}>{w.wilaya_id} - {w.wilaya_name}</option>)}
                  </select>

                  <select 
                    className="w-full h-12 rounded-xl border bg-transparent px-3 appearance-none"
                    value={orderForm.commune}
                    onChange={e => setOrderForm(f => ({ ...f, commune: e.target.value }))}
                    disabled={!orderForm.wilaya || loadingDelivery}
                  >
                    <option value="">اختر البلدية</option>
                    {communes.map(c => <option key={c.commune_id || c.nom} value={c.nom}>{c.nom}</option>)}
                  </select>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setOrderForm(f => ({ ...f, deliveryType: "home" }))}
                      className={`h-12 rounded-xl border flex items-center justify-center gap-2 transition-all ${orderForm.deliveryType === "home" ? "ring-2 ring-primary border-primary bg-primary/5" : "bg-transparent"}`}
                    >
                      <Truck className="w-4 h-4" /> بيت
                    </button>
                    <button 
                      type="button"
                      onClick={() => setOrderForm(f => ({ ...f, deliveryType: "desk" }))}
                      className={`h-12 rounded-xl border flex items-center justify-center gap-2 transition-all ${orderForm.deliveryType === "desk" ? "ring-2 ring-primary border-primary bg-primary/5" : "bg-transparent"}`}
                    >
                      <MapPin className="w-4 h-4" /> مكتب
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <span className="font-bold">الكمية</span>
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-full border border-border flex items-center justify-center">-</button>
                      <span className="font-bold w-4 text-center">{quantity}</span>
                      <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center">+</button>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-1">
                   <div className="flex justify-between text-sm opacity-70">
                     <span>السعر</span>
                     <span>{(p.price * quantity).toLocaleString()} دج</span>
                   </div>
                   <div className="flex justify-between text-sm opacity-70">
                     <span>مصاريف التوصيل ({orderForm.deliveryType === "home" ? "للبيت" : "للمكتب"})</span>
                     <span>{currentShipping.toLocaleString()} دج</span>
                   </div>
                   <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                     <span>المجموع</span>
                     <span style={{ color: p.primaryColor }}>{totalPrice.toLocaleString()} دج</span>
                   </div>
                </div>

                <Button type="submit" disabled={orderSubmitted} className="w-full h-14 text-lg font-bold rounded-xl text-white shadow-lg" style={{ backgroundColor: p.primaryColor }}>
                   {orderSubmitted ? "تم الطلب بنجاح ✅" : "إرسال الطلب الآن"}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    );
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
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: p.primaryColor }}>
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold block">{p.productName}</span>
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

        {/* Video */}
        {p.sections.includes("video") && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="px-4 sm:px-6 pb-8">
            <div className={`relative aspect-video rounded-2xl overflow-hidden bg-muted flex items-center justify-center max-w-3xl mx-auto ${shadowMap[p.shadowIntensity]}`}
              style={{ borderRadius: br }}>
              {p.videoUrl ? (
                <iframe src={p.videoUrl} className="w-full h-full" allowFullScreen />
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
              {p.trustBadges.map((badge, i) => {
                const icons = [Shield, Truck, Award, Check];
                const Icon = icons[i % icons.length];
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className={`flex flex-col items-center gap-2 p-4 border rounded-2xl text-center ${shadowMap[p.shadowIntensity]}`}
                    style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br }}>
                    <Icon className="w-6 h-6" style={{ color: p.primaryColor }} />
                    <span className="text-xs font-bold">{badge}</span>
                  </motion.div>
                );
              })}
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
                <form onSubmit={handleOrder} className="space-y-4">
                  <div className="text-center space-y-2 mb-6">
                    <h3 className="text-xl font-black flex items-center justify-center gap-2">
                      <ShoppingCart className="w-5 h-5" style={{ color: p.primaryColor }} /> اطلب الآن
                    </h3>
                    <p className="text-sm" style={{ color: stc }}>املأ النموذج التالي وسنتواصل معك</p>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: stc }} />
                      <Input
                        placeholder="الاسم الكامل"
                        value={orderForm.name}
                        onChange={(e) => setOrderForm(f => ({ ...f, name: e.target.value }))}
                        className="pr-10 h-12 rounded-xl text-sm"
                        style={{ borderRadius: `${Math.min(p.borderRadius, 16)}px`, borderColor: isDark(p.backgroundColor) ? "#334155" : "#d1d5db", backgroundColor: isDark(p.backgroundColor) ? "#1e293b" : "#fff", color: tc }}
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: stc }} />
                      <Input
                        placeholder="رقم الهاتف (مثال: 0555123456)"
                        value={orderForm.phone}
                        onChange={(e) => setOrderForm(f => ({ ...f, phone: e.target.value }))}
                        className="pr-10 h-12 rounded-xl text-sm"
                        style={{ borderRadius: `${Math.min(p.borderRadius, 16)}px`, borderColor: isDark(p.backgroundColor) ? "#334155" : "#d1d5db", backgroundColor: isDark(p.backgroundColor) ? "#1e293b" : "#fff", color: tc }}
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: stc }} />
                      <select
                        value={orderForm.wilaya}
                        onChange={(e) => setOrderForm(f => ({ ...f, wilaya: e.target.value, commune: "" }))}
                        className="w-full pr-10 h-12 text-sm border bg-transparent appearance-none cursor-pointer"
                        style={{ borderRadius: `${Math.min(p.borderRadius, 16)}px`, borderColor: isDark(p.backgroundColor) ? "#334155" : "#d1d5db", backgroundColor: isDark(p.backgroundColor) ? "#1e293b" : "#fff", color: tc, paddingLeft: "12px" }}
                      >
                        <option value="">اختر الولاية</option>
                        {wilayas.map(w => <option key={w.wilaya_id} value={w.wilaya_id}>{w.wilaya_id} - {w.wilaya_name}</option>)}
                      </select>
                    </div>

                    <div className="relative">
                      <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: stc }} />
                      <select
                        value={orderForm.commune}
                        onChange={(e) => setOrderForm(f => ({ ...f, commune: e.target.value }))}
                        disabled={!orderForm.wilaya || loadingDelivery}
                        className="w-full pr-10 h-12 text-sm border bg-transparent appearance-none cursor-pointer disabled:opacity-50"
                        style={{ borderRadius: `${Math.min(p.borderRadius, 16)}px`, borderColor: isDark(p.backgroundColor) ? "#334155" : "#d1d5db", backgroundColor: isDark(p.backgroundColor) ? "#1e293b" : "#fff", color: tc, paddingLeft: "12px" }}
                      >
                        <option value="">{loadingDelivery ? "جاري التحميل..." : "اختر البلدية"}</option>
                        {communes.map(c => <option key={c.commune_id || c.nom} value={c.nom}>{c.nom}</option>)}
                      </select>
                    </div>
                  </div>

                  <button type="submit"
                    className={`w-full py-4 text-lg font-black text-white shadow-2xl transition-all hover:scale-[1.02] ${
                      p.ctaAnimation === "pulse" ? "animate-pulse" : p.ctaAnimation === "bounce" ? "animate-bounce" : ""
                    } ${p.ctaStyle === "pill" ? "rounded-full" : p.ctaStyle === "rounded" ? "rounded-xl" : "rounded-none"}`}
                    style={{ backgroundColor: p.primaryColor }}>
                    {p.ctaText} — {p.price.toLocaleString()} دج
                  </button>

                  <div className="flex items-center justify-center gap-4 text-xs" style={{ color: stc }}>
                    <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> آمن</span>
                    <span className="flex items-center gap-1"><Truck className="w-4 h-4" /> شحن مجاني</span>
                    <span className="flex items-center gap-1"><Award className="w-4 h-4" /> ضمان</span>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="border-t py-6 text-center" style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0" }}>
          <p className="text-xs" style={{ color: stc }}>© 2024 {p.productName} — جميع الحقوق محفوظة</p>
        </div>
      </div>

      {/* Floating CTA */}
      {p.showFloatingCta && (
        <motion.a href="#order-form" initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 2 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 text-white font-bold px-8 py-4 rounded-full shadow-2xl text-sm transition-transform hover:scale-105"
          style={{ backgroundColor: p.primaryColor }}>
          {p.ctaText} 🛒
        </motion.a>
      )}

      {/* Social Proof Notification Popup */}
      <AnimatePresence>
        {showNotification && p.sections.includes("notification-popup") && (
          <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }}
            className="fixed bottom-6 left-6 z-50 p-4 border rounded-2xl flex items-center gap-3 shadow-2xl max-w-xs"
            style={{ borderColor: isDark(p.backgroundColor) ? "#334155" : "#e2e8f0", borderRadius: br, backgroundColor: isDark(p.backgroundColor) ? "#1e293b" : "#ffffff" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${p.primaryColor}15` }}>
              <ShoppingCart className="w-5 h-5" style={{ color: p.primaryColor }} />
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
