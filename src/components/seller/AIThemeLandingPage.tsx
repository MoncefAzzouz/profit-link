import { motion } from "framer-motion";
import { ShoppingCart, Star, Shield, Truck, Check, Clock, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAITheme } from "@/utils/aiThemes";

interface Props {
  p: any;
  storeName: string;
  orderForm: any;
  setOrderForm: (fn: any) => void;
  handleOrder: (e: React.FormEvent) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  wilayas: any[];
  communes: any[];
  loadingCommunes?: boolean;
  shippingRate: { home: number; desk: number };
  selectedOffer: any;
  setSelectedOffer: (o: any) => void;
  selectedBundleId: string | null;
  setSelectedBundleId: (id: string | null) => void;
  orderSubmitted: boolean;
  countdown: { hours: number; minutes: number; seconds: number };
}

export default function AIThemeLandingPage({
  p, storeName, orderForm, setOrderForm, handleOrder,
  quantity, setQuantity, wilayas, communes, loadingCommunes,
  shippingRate, selectedOffer, setSelectedOffer,
  selectedBundleId, setSelectedBundleId, orderSubmitted, countdown,
}: Props) {
  const t = getAITheme(p.template);
  if (!t) return null;

  const isDarkBg = ["dark_futuristic"].includes(p.template);
  const selectedBundle = p.bundles?.find((b: any) => b.id === selectedBundleId);
  let activePrice = selectedOffer ? selectedOffer.price : selectedBundle ? selectedBundle.price : p.price;
  let currentShipping = orderForm.deliveryType === "home" ? shippingRate.home : shippingRate.desk;
  if (selectedOffer?.freeDelivery || p.showFreeShipping) currentShipping = 0;
  const totalPrice = (activePrice * quantity) + currentShipping;
  const discount = Math.round((1 - p.price / p.originalPrice) * 100);
  const pad = (n: number) => String(n).padStart(2, "0");

  const fontLink = {
    "minimal_luxury": "Cairo", "dark_futuristic": "Cairo",
    "soft_beauty": "Tajawal", "viral_tiktok": "Cairo",
    "organic_nature": "Almarai", "bold_sales": "Changa",
  }[p.template] || "Cairo";

  const inputStyle = {
    backgroundColor: t.inputBg, borderColor: t.inputBorder,
    color: t.inputText, borderRadius: t.radius,
    border: `1.5px solid ${t.inputBorder}`,
  };

  return (
    <div style={{ backgroundColor: t.bg, fontFamily: t.font, color: t.text, minHeight: "100vh" }} dir="rtl" className="overflow-x-hidden">
      <link href={`https://fonts.googleapis.com/css2?family=${fontLink}:wght@400;600;700;800;900&display=swap`} rel="stylesheet" />

      {/* Promo Bar */}
      <div style={{ backgroundColor: t.promoBg, color: t.promoText }} className="text-center py-2.5 px-4 text-sm font-bold flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" />
        العرض ينتهي خلال: {pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)} — الشحن مجاني لجميع الولايات!
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b px-4 py-3" style={{ backgroundColor: t.headerBg, borderColor: t.headerBorder, backdropFilter: "blur(12px)" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="font-black text-xl">{storeName}</span>
          <a href="#order-form" className="font-bold text-sm px-5 py-2 transition-all hover:opacity-90" style={{ backgroundColor: t.btnBg, color: t.btnText, borderRadius: t.btnRadius, border: t.btnBorder }}>
            {p.ctaText || "اطلب الآن"}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-12 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <div className="relative">
            {p.heroImage ? (
              <img src={p.heroImage} alt={p.productName} className="w-full object-cover" style={{ borderRadius: t.radius, border: `2px solid ${t.cardBorder}` }} />
            ) : (
              <div className="w-full aspect-square flex items-center justify-center" style={{ backgroundColor: t.cardBg, borderRadius: t.radius, border: `2px solid ${t.cardBorder}` }}>
                <ShoppingCart className="w-16 h-16 opacity-20" />
              </div>
            )}
            {discount > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
                className="absolute top-4 left-4 text-white text-sm font-black px-3 py-1.5" style={{ backgroundColor: "#ef4444", borderRadius: t.radius }}>
                -{discount}% 🔥
              </motion.div>
            )}
          </div>

          {/* Text */}
          <div className="space-y-5">
            <div className="text-xs font-bold uppercase tracking-widest px-3 py-1 inline-block" style={{ color: t.accent, backgroundColor: `${t.accent}18`, borderRadius: t.radius }}>
              {p.category}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight">{p.heroTitle}</h1>
            <p className="text-base leading-relaxed" style={{ color: t.textSec }}>{p.heroSubtitle}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-black" style={{ color: t.accent }}>{p.price.toLocaleString()} دج</span>
              {p.originalPrice > p.price && (
                <span className="text-lg line-through" style={{ color: t.textSec }}>{p.originalPrice.toLocaleString()} دج</span>
              )}
            </div>
            <div className="flex gap-3 flex-wrap text-sm" style={{ color: t.textSec }}>
              <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> ضمان الجودة</span>
              <span className="flex items-center gap-1"><Truck className="w-4 h-4" /> دفع عند الاستلام</span>
            </div>
            <a href="#order-form" className="block text-center font-black text-base w-full py-4 transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ backgroundColor: t.btnBg, color: t.btnText, borderRadius: t.btnRadius, border: t.btnBorder }}>
              {p.ctaText || "اطلب الآن"} ←
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      {p.sections?.includes("features") && p.features?.length > 0 && (
        <section className="px-4 py-10" style={{ backgroundColor: t.sectionAltBg }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-center mb-8">لماذا تختار هذا المنتج؟</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {p.features.slice(0, 6).map((feat: string, i: number) => (
                <div key={i} className="p-4 flex items-center gap-3" style={{ backgroundColor: t.cardBg, borderRadius: t.radius, border: `1.5px solid ${t.cardBorder}` }}>
                  <div className="w-8 h-8 flex items-center justify-center rounded-full shrink-0" style={{ backgroundColor: `${t.accent}20` }}>
                    <Check className="w-4 h-4" style={{ color: t.accent }} />
                  </div>
                  <span className="font-bold text-sm">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Proof */}
      {p.sections?.includes("social-proof") && (
        <section className="px-4 py-8">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
            {[{ v: "2,340+", l: "عميل سعيد" }, { v: "4.9/5", l: "تقييم" }, { v: "98%", l: "نسبة الرضا" }].map((s, i) => (
              <div key={i} className="p-4" style={{ backgroundColor: t.cardBg, borderRadius: t.radius, border: `1.5px solid ${t.cardBorder}` }}>
                <div className="text-2xl font-black" style={{ color: t.accent }}>{s.v}</div>
                <div className="text-xs mt-1" style={{ color: t.textSec }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      {p.sections?.includes("reviews") && p.socialProof?.length > 0 && (
        <section className="px-4 py-10" style={{ backgroundColor: t.sectionAltBg }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-center mb-8">آراء العملاء</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {p.socialProof.slice(0, 3).map((r: any, i: number) => (
                <div key={i} className="p-5 space-y-3" style={{ backgroundColor: t.reviewCardBg, borderRadius: t.radius, border: `1.5px solid ${t.reviewCardBorder}` }}>
                  <div className="flex text-amber-400">{[...Array(r.rating || 5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400" />)}</div>
                  <p className="text-sm leading-relaxed italic" style={{ color: t.textSec }}>"{r.text}"</p>
                  <div className="font-bold text-sm">{r.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      {p.sections?.includes("trust-badges") && (
        <section className="px-4 py-6" style={{ backgroundColor: t.sectionDarkBg }}>
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
            {[{ icon: Shield, l: "ضمان الجودة" }, { icon: Truck, l: "دفع عند الاستلام" }, { icon: Check, l: "إرجاع مجاني" }].map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-2 py-3" style={{ color: t.sectionDarkText }}>
                <b.icon className="w-6 h-6" />
                <span className="text-xs font-bold">{b.l}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Marketing Offers / Bundles */}
      {(p.bundles?.length > 0 || p.hasMarketingOffers) && (
        <section className="px-4 py-8 max-w-4xl mx-auto">
          <h3 className="text-xl font-black mb-4 text-center">العروض المتاحة</h3>
          <div className="space-y-3">
            <button type="button" onClick={() => { setSelectedBundleId(null); setSelectedOffer(null); setQuantity(1); }}
              className="w-full flex justify-between items-center p-4 text-right font-bold transition-all"
              style={{ backgroundColor: !selectedBundleId && !selectedOffer ? `${t.accent}15` : t.cardBg, borderRadius: t.radius, border: `2px solid ${!selectedBundleId && !selectedOffer ? t.accent : t.cardBorder}` }}>
              <span>المنتج الأساسي (قطعة واحدة)</span>
              <span style={{ color: t.accent }}>{p.price.toLocaleString()} دج</span>
            </button>
            {p.bundles?.map((b: any) => (
              <button key={b.id} type="button" onClick={() => { setSelectedBundleId(b.id); setSelectedOffer(null); setQuantity(1); }}
                className="w-full flex justify-between items-center p-4 text-right font-bold transition-all"
                style={{ backgroundColor: selectedBundleId === b.id ? `${t.accent}15` : t.cardBg, borderRadius: t.radius, border: `2px solid ${selectedBundleId === b.id ? t.accent : t.cardBorder}` }}>
                <span>{b.name}</span>
                <span style={{ color: t.accent }}>{b.price.toLocaleString()} دج</span>
              </button>
            ))}
            {p.marketingOffers?.map((o: any, i: number) => (
              <button key={i} type="button" onClick={() => { setSelectedOffer(o); setSelectedBundleId(null); setQuantity(1); }}
                className="w-full flex justify-between items-center p-4 text-right font-bold transition-all"
                style={{ backgroundColor: selectedOffer === o ? `${t.accent}15` : t.cardBg, borderRadius: t.radius, border: `2px solid ${selectedOffer === o ? t.accent : t.cardBorder}` }}>
                <span>{o.name}</span>
                <span style={{ color: t.accent }}>{o.price.toLocaleString()} دج</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Order Form */}
      <section id="order-form" className="px-4 py-12" style={{ backgroundColor: t.sectionAltBg }}>
        <div className="max-w-lg mx-auto p-6 sm:p-8" style={{ backgroundColor: t.cardBg, borderRadius: t.radius, border: `2px solid ${t.cardBorder}` }}>
          <h2 className="text-2xl font-black mb-6 text-center">أكمل طلبك الآن</h2>
          {orderSubmitted ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: `${t.accent}20` }}>
                <Check className="w-8 h-8" style={{ color: t.accent }} />
              </div>
              <h3 className="text-xl font-black">تم استلام طلبك! ✅</h3>
              <p style={{ color: t.textSec }}>سيتصل بك فريقنا خلال 24 ساعة لتأكيد الطلب.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1.5">الاسم الكامل *</label>
                <input value={orderForm.name} onChange={e => setOrderForm((f: any) => ({ ...f, name: e.target.value }))}
                  placeholder="محمد أحمد..." required className="w-full px-4 py-3 outline-none transition-all font-medium" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">رقم الهاتف *</label>
                <input type="tel" value={orderForm.phone} maxLength={10}
                  onChange={e => setOrderForm((f: any) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))}
                  placeholder="0XXXXXXXXX" dir="ltr" required className="w-full px-4 py-3 outline-none transition-all font-medium" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">الولاية *</label>
                <div className="relative">
                  <select value={orderForm.wilaya} onChange={e => setOrderForm((f: any) => ({ ...f, wilaya: e.target.value, commune: "" }))}
                    required className="w-full px-4 py-3 outline-none appearance-none font-medium" style={inputStyle}>
                    <option value="">اختر ولايتك</option>
                    {wilayas.map((w: any) => <option key={w.id || w.wilaya_id} value={w.id || w.wilaya_id}>{w.nom || w.wilaya_name}</option>)}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: t.textSec }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">البلدية *</label>
                <div className="relative">
                  <select value={orderForm.commune} onChange={e => setOrderForm((f: any) => ({ ...f, commune: e.target.value }))}
                    required className="w-full px-4 py-3 outline-none appearance-none font-medium" style={inputStyle}>
                    <option value="">اختر بلديتك</option>
                    {communes.map((c: any, i: number) => <option key={i} value={c.nom || c.commune_name}>{c.nom || c.commune_name}</option>)}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: t.textSec }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">العنوان بالتفصيل *</label>
                <input value={orderForm.address} onChange={e => setOrderForm((f: any) => ({ ...f, address: e.target.value }))}
                  placeholder="الحي، الشارع..." required className="w-full px-4 py-3 outline-none font-medium" style={inputStyle} />
              </div>
              <div className="flex items-center justify-between p-4 font-bold" style={{ backgroundColor: `${t.accent}10`, borderRadius: t.radius, border: `1.5px solid ${t.cardBorder}` }}>
                <span>الكمية</span>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-full font-black" style={{ backgroundColor: t.cardBorder }}>-</button>
                  <span className="font-black text-lg">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-full font-black" style={{ backgroundColor: t.accent, color: t.btnText }}>+</button>
                </div>
              </div>

              {/* Price summary */}
              <div className="space-y-2 p-4" style={{ backgroundColor: `${t.accent}08`, borderRadius: t.radius, border: `1px solid ${t.cardBorder}` }}>
                <div className="flex justify-between text-sm"><span style={{ color: t.textSec }}>السعر</span><span className="font-bold">{(activePrice * quantity).toLocaleString()} دج</span></div>
                <div className="flex justify-between text-sm"><span style={{ color: t.textSec }}>التوصيل</span><span className="font-bold">{orderForm.wilaya ? `${currentShipping.toLocaleString()} دج` : "اختر الولاية"}</span></div>
                <div className="flex justify-between font-black text-lg border-t pt-2 mt-1" style={{ borderColor: t.cardBorder }}>
                  <span>المجموع</span><span style={{ color: t.accent }}>{totalPrice.toLocaleString()} دج</span>
                </div>
              </div>

              <button type="submit" disabled={orderSubmitted} className="w-full py-4 font-black text-lg transition-all hover:opacity-90 hover:scale-[1.01]"
                style={{ backgroundColor: t.btnBg, color: t.btnText, borderRadius: t.btnRadius, border: t.btnBorder, opacity: orderSubmitted ? 0.6 : 1 }}>
                تأكيد الطلب الآن ✅
              </button>
              <p className="text-center text-xs" style={{ color: t.textSec }}>دفع عند الاستلام — لا حاجة لبطاقة بنكية</p>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      {p.sections?.includes("faq") && p.faqItems?.length > 0 && (
        <section className="px-4 py-10 max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-6">الأسئلة الشائعة</h2>
          <div className="space-y-3">
            {p.faqItems.map((f: any, i: number) => (
              <div key={i} className="p-4" style={{ backgroundColor: t.cardBg, borderRadius: t.radius, border: `1.5px solid ${t.cardBorder}` }}>
                <p className="font-bold mb-1">{f.q}</p>
                <p className="text-sm" style={{ color: t.textSec }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="text-center py-8 text-xs border-t" style={{ backgroundColor: t.sectionAltBg, borderColor: t.cardBorder, color: t.textSec }}>
        © {new Date().getFullYear()} {storeName} — جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
