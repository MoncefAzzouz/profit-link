import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Star, ThumbsUp, Camera, Play, Image as ImageIcon, Truck, Clock,
  ShoppingCart, Shield, MessageSquare, ChevronDown,
} from "lucide-react";

/**
 * Shared landing-page section components, reused across every template
 * (original / modern / AI premium) so that toggling any section in the builder
 * works everywhere. Each component is self-contained and derives what it needs
 * from the page config `p`, with optional `dark` / `accent` overrides so it can
 * sit nicely on both light and dark themed pages.
 */

const isDarkColor = (hex?: string) => {
  if (!hex || typeof hex !== "string") return false;
  const c = hex.replace("#", "");
  if (c.length < 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
};

interface BaseProps {
  p: any;
  /** Force dark styling (e.g. on AI dark themes). Defaults from p.backgroundColor. */
  dark?: boolean;
  /** Accent color override. Defaults to p.primaryColor. */
  accent?: string;
  className?: string;
}

const resolve = (p: any, dark?: boolean, accent?: string) => ({
  dark: dark ?? isDarkColor(p?.backgroundColor),
  accent: accent || p?.primaryColor || "#10b981",
  radius: typeof p?.borderRadius === "number" ? p.borderRadius : 16,
});

const wrap = "px-4 sm:px-6 pb-8";
const cardBorder = (dark: boolean) => (dark ? "#334155" : "#e2e8f0");
const subText = (dark: boolean) => (dark ? "#94a3b8" : "#64748b");

// ─────────────────────────────────────────── Urgency bar
export function UrgencyBar({ p, accent }: BaseProps) {
  const { accent: a } = resolve(p, false, accent);
  return (
    <div className="py-2.5 px-4 text-center text-xs font-bold text-white" style={{ backgroundColor: a }}>
      <span className="animate-pulse">🔥</span> {p.urgencyText || "⏰ العرض ينتهي قريباً! تبقى عدد محدود"}{" "}
      <span className="animate-pulse">🔥</span>
    </div>
  );
}

// ─────────────────────────────────────────── Social proof stats
export function SocialProofStats({ p, dark, accent, className = "" }: BaseProps) {
  const r = resolve(p, dark, accent);
  const stats = [
    { icon: Users, val: "2,340+", label: "عميل سعيد" },
    { icon: Star, val: "4.9/5", label: "تقييم عام" },
    { icon: ThumbsUp, val: "98%", label: "معدل الرضا" },
  ];
  return (
    <div className={`${wrap} ${className}`}>
      <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-2xl border text-center shadow-sm"
            style={{ borderColor: cardBorder(r.dark), borderRadius: r.radius }}
          >
            <s.icon className="w-6 h-6 mx-auto mb-2" style={{ color: r.accent }} />
            <p className="text-xl font-black">{s.val}</p>
            <p className="text-xs mt-1" style={{ color: subText(r.dark) }}>{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────── Gallery
export function GallerySection({ p, dark, accent, className = "" }: BaseProps) {
  const r = resolve(p, dark, accent);
  const images: string[] = p.galleryImages || [];
  if (images.length === 0) return null;
  return (
    <div className={`${wrap} ${className}`}>
      <h2 className="text-2xl font-black text-center mb-6 flex items-center justify-center gap-2">
        <Camera className="w-6 h-6" style={{ color: r.accent }} /> صور إضافية
      </h2>
      <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
        {images.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="aspect-square overflow-hidden bg-muted border shadow-sm"
            style={{ borderColor: cardBorder(r.dark), borderRadius: r.radius }}
          >
            <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────── Video
export function VideoSection({ p, accent, className = "" }: BaseProps) {
  const { accent: a } = resolve(p, false, accent);
  const r = resolve(p, false, accent);
  const url: string = p.videoUrl || "";
  const isEmbed = url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com");
  return (
    <div className={`${wrap} ${className}`}>
      <div
        className="relative aspect-video rounded-2xl overflow-hidden bg-muted flex items-center justify-center max-w-3xl mx-auto shadow-md"
        style={{ borderRadius: r.radius }}
      >
        {url ? (
          isEmbed ? (
            <iframe src={url} className="w-full h-full" allowFullScreen />
          ) : (
            <video src={url} className="w-full h-full object-cover" controls playsInline />
          )
        ) : (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl" style={{ backgroundColor: a }}>
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
            <p className="absolute bottom-4 text-sm font-bold opacity-70">شاهد الفيديو التوضيحي</p>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────── Before / After
export function BeforeAfterSection({ p, accent, className = "" }: BaseProps) {
  const r = resolve(p, false, accent);
  const imgs = p.beforeAfterImages || {};
  return (
    <div className={`${wrap} ${className}`}>
      <h2 className="text-2xl font-black text-center mb-6">قبل وبعد الاستخدام</h2>
      <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
        <div className="rounded-2xl overflow-hidden border-2 border-red-300 shadow-sm" style={{ borderRadius: r.radius }}>
          <div className="bg-red-500 text-center py-2 text-sm font-bold text-white">قبل ❌</div>
          <div className="aspect-square bg-muted flex items-center justify-center">
            {imgs.before ? <img src={imgs.before} className="w-full h-full object-cover" /> : <ImageIcon className="w-12 h-12 opacity-20" />}
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden border-2 shadow-sm" style={{ borderColor: r.accent, borderRadius: r.radius }}>
          <div className="text-center py-2 text-sm font-bold text-white" style={{ backgroundColor: r.accent }}>بعد ✅</div>
          <div className="aspect-square bg-muted flex items-center justify-center">
            {imgs.after ? <img src={imgs.after} className="w-full h-full object-cover" /> : <ImageIcon className="w-12 h-12 opacity-20" />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────── Trust badges
export function TrustBadgesSection({ p, dark, accent, className = "" }: BaseProps) {
  const r = resolve(p, dark, accent);
  const badges = [
    { icon: Truck, t: "توصيل سريع", s: "3-5 أيام" },
    { icon: Shield, t: "ضمان الجودة", s: "منتج أصلي" },
    { icon: Clock, t: "شحن مجاني", s: "لكل الولايات" },
    { icon: ShoppingCart, t: "دفع عند الاستلام", s: "آمن 100%" },
  ];
  return (
    <div className={`${wrap} ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
        {badges.map((badge, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center gap-2 p-4 border rounded-2xl text-center shadow-sm"
            style={{ borderColor: cardBorder(r.dark), borderRadius: r.radius }}
          >
            <badge.icon className="w-6 h-6" style={{ color: r.accent }} />
            <span className="text-xs font-bold">{badge.t}</span>
            <span className="text-[10px] opacity-60">{badge.s}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────── Countdown (self-contained timer)
export function CountdownSection({ p, dark, accent, className = "" }: BaseProps) {
  const r = resolve(p, dark, accent);
  const target = p.countdownDate ? new Date(p.countdownDate).getTime() : Date.now() + 24 * 60 * 60 * 1000;
  const calc = () => {
    const diff = Math.max(0, target - Date.now());
    return {
      hours: Math.floor(diff / 3.6e6),
      minutes: Math.floor((diff % 3.6e6) / 6e4),
      seconds: Math.floor((diff % 6e4) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.countdownDate]);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className={`${wrap} ${className}`}>
      <div className="p-6 rounded-2xl text-center space-y-4 max-w-xl mx-auto shadow-sm" style={{ backgroundColor: `${r.accent}10`, borderRadius: r.radius }}>
        <p className="text-lg font-bold" style={{ color: r.accent }}>⏰ العرض ينتهي خلال</p>
        <div className="flex justify-center gap-4" dir="ltr">
          {[
            { v: pad(time.hours), l: "ساعة" },
            { v: pad(time.minutes), l: "دقيقة" },
            { v: pad(time.seconds), l: "ثانية" },
          ].map((tt, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black text-white shadow-lg" style={{ backgroundColor: r.accent }}>
                {tt.v}
              </div>
              <p className="text-xs mt-2 font-medium" style={{ color: subText(r.dark) }}>{tt.l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────── Guarantee
export function GuaranteeSection({ p, accent, className = "" }: BaseProps) {
  const r = resolve(p, false, accent);
  return (
    <div className={`${wrap} ${className}`}>
      <div className="p-6 rounded-2xl border-2 border-dashed text-center space-y-3 max-w-xl mx-auto shadow-sm" style={{ borderColor: r.accent, borderRadius: r.radius }}>
        <Shield className="w-12 h-12 mx-auto" style={{ color: r.accent }} />
        <p className="text-xl font-black">ضمان 30 يوم</p>
        <p className="text-sm opacity-70">إذا لم يعجبك المنتج، يمكنك إرجاعه واسترداد أموالك بالكامل</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────── Shipping
export function ShippingSection({ p, dark, accent, className = "" }: BaseProps) {
  const r = resolve(p, dark, accent);
  const items = [
    { icon: Clock, text: "التوصيل خلال 2-5 أيام عمل" },
    { icon: ShoppingCart, text: "الدفع عند الاستلام COD 💵" },
  ];
  return (
    <div className={`${wrap} ${className}`}>
      <div className="p-6 rounded-2xl border space-y-4 max-w-xl mx-auto shadow-sm" style={{ borderColor: cardBorder(r.dark), borderRadius: r.radius }}>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Truck className="w-5 h-5" style={{ color: r.accent }} /> معلومات التوصيل
        </h3>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <item.icon className="w-5 h-5" style={{ color: r.accent }} />
            <span className="text-sm font-medium">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────── FAQ (self-contained open state)
export function FaqSection({ p, dark, accent, className = "" }: BaseProps) {
  const r = resolve(p, dark, accent);
  const items = p.faqItems || [];
  const [open, setOpen] = useState<number | null>(null);
  if (items.length === 0) return null;
  return (
    <div className={`${wrap} ${className}`}>
      <h2 className="text-2xl font-black text-center mb-6 flex items-center justify-center gap-2">
        <MessageSquare className="w-6 h-6" style={{ color: r.accent }} /> أسئلة شائعة
      </h2>
      <div className="space-y-3 max-w-xl mx-auto">
        {items.map((faq: any, i: number) => (
          <div key={i} className="border rounded-2xl overflow-hidden shadow-sm" style={{ borderColor: cardBorder(r.dark), borderRadius: r.radius }}>
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-4 text-sm font-bold text-right">
              <span>{faq.q}</span>
              <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${open === i ? "rotate-180" : ""}`} style={{ color: r.accent }} />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <p className="px-4 pb-4 text-sm" style={{ color: subText(r.dark) }}>{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────── Sticky CTA (fixed bottom bar)
export function StickyCtaBar({ p, accent }: BaseProps) {
  const { accent: a } = resolve(p, false, accent);
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 px-3 py-2.5 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl flex items-center justify-between gap-3" dir="rtl">
      <div className="flex flex-col">
        <span className="text-base font-black text-gray-900 num">{(p.price || 0).toLocaleString()} دج</span>
        {p.originalPrice > p.price && (
          <span className="text-[11px] line-through text-gray-400 num">{(p.originalPrice || 0).toLocaleString()} دج</span>
        )}
      </div>
      <button
        onClick={() => document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth" })}
        className="flex-1 max-w-[60%] py-3 rounded-xl text-white text-sm font-black shadow-lg active:scale-95 transition-transform"
        style={{ backgroundColor: a }}
      >
        {p.ctaText || "اطلب الآن"} 🛒
      </button>
    </div>
  );
}
