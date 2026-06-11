import { motion } from "framer-motion";
import { ShoppingCart, Star, Shield, Truck, Check, Clock, ChevronDown, Sparkles, ArrowLeft, Award, Lock, RotateCcw, Zap, MapPin, Palette, Ruler } from "lucide-react";
import { themeTokens, layoutTokens, AITemplateName } from "@/utils/aiThemeTokens";
import ProductDescriptionSection from "@/components/seller/ProductDescriptionSection";
import PurchaseNotificationPopup from "@/components/seller/PurchaseNotificationPopup";
import {
  SocialProofStats, GallerySection, VideoSection, BeforeAfterSection,
  CountdownSection, GuaranteeSection, ShippingSection, FaqSection, StickyCtaBar,
} from "@/components/seller/LandingSections";

interface Props {
  p: any; storeName: string;
  orderForm: any; setOrderForm: (fn: any) => void;
  handleOrder: (e: React.FormEvent) => void;
  quantity: number; setQuantity: (q: number) => void;
  wilayas: any[]; communes: any[];
  shippingRate: { home: number; desk: number };
  selectedOffer: any; setSelectedOffer: (o: any) => void;
  selectedBundleId: string | null; setSelectedBundleId: (id: string | null) => void;
  orderSubmitted: boolean;
  countdown: { hours: number; minutes: number; seconds: number };
  /** When true, suppress the floating purchase popup (used in the builder preview). */
  disablePopups?: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");

const FONT_MAP: Record<string,string> = {
  minimal_luxury:'Cormorant+Garamond:wght@400;500;600;700',
  dark_futuristic:'Inter:wght@400;500;600;700;800;900',
  soft_beauty:'Cormorant+Garamond:wght@400;500;600;700',
  viral_tiktok:'Space+Grotesk:wght@400;500;600;700',
  organic_nature:'Cormorant+Garamond:wght@400;500;600;700',
  bold_sales:'Inter:wght@400;500;600;700;800;900',
  royal_gold:'Playfair+Display:wght@400;500;600;700;800;900',
  clean_tech:'Inter:wght@400;500;600;700;800',
  aurora_glass:'Space+Grotesk:wght@400;500;600;700',
};

const SECONDARY_FONT_MAP: Record<string,string> = {
  minimal_luxform:'Cairo:wght@300;400;500;600;700',
  minimal_luxury:'Cairo:wght@300;400;500;600;700',
  dark_futuristic:'Cairo:wght@400;500;600;700;800',
  soft_beauty:'Tajawal:wght@300;400;500;700',
  viral_tiktok:'Cairo:wght@600;700;800;900',
  organic_nature:'Almarai:wght@300;400;700',
  bold_sales:'Changa:wght@500;700;800',
  royal_gold:'Cairo:wght@300;400;500;600;700',
  clean_tech:'Cairo:wght@400;500;600;700',
  aurora_glass:'Cairo:wght@400;500;600;700;800',
};

export default function AIThemeLandingPage({ p, storeName, orderForm, setOrderForm, handleOrder, quantity, setQuantity, wilayas, communes, shippingRate, selectedOffer, setSelectedOffer, selectedBundleId, setSelectedBundleId, orderSubmitted, countdown, disablePopups }: Props) {
  const t = themeTokens[p.template as AITemplateName];
  const l = layoutTokens[p.template as AITemplateName];
  if (!t || !l) return null;

  const selectedBundle = p.bundles?.find((b: any) => b.id === selectedBundleId);
  const activePrice = selectedOffer ? selectedOffer.price : selectedBundle ? selectedBundle.price : p.price;
  const currentShipping = (selectedOffer?.freeDelivery || p.showFreeShipping) ? 0 : (orderForm.deliveryType === "home" ? shippingRate.home : shippingRate.desk);
  const totalPrice = (activePrice * quantity) + currentShipping;
  const discount = Math.round((1 - p.price / p.originalPrice) * 100);
  const isCentered = ['soft_beauty','viral_tiktok','bold_sales','aurora_glass'].includes(p.template);
  const isDarkTheme = ['dark_futuristic','bold_sales','royal_gold','aurora_glass'].includes(p.template);
  const primaryFont = FONT_MAP[p.template] || 'Inter:wght@400;500;600;700;800';
  const secondaryFont = SECONDARY_FONT_MAP[p.template] || 'Cairo:wght@400;500;600;700';

  // Headline font family per template — sets the "international brand" feel
  const headlineFontFamily: Record<string,string> = {
    minimal_luxury: "'Cormorant Garamond', 'Cairo', serif",
    dark_futuristic: "'Inter', 'Cairo', sans-serif",
    soft_beauty: "'Cormorant Garamond', 'Tajawal', serif",
    viral_tiktok: "'Space Grotesk', 'Cairo', sans-serif",
    organic_nature: "'Cormorant Garamond', 'Almarai', serif",
    bold_sales: "'Inter', 'Changa', sans-serif",
    royal_gold: "'Playfair Display', 'Cairo', serif",
    clean_tech: "'Inter', 'Cairo', sans-serif",
    aurora_glass: "'Space Grotesk', 'Cairo', sans-serif",
  };
  const hFont = headlineFontFamily[p.template] || "'Inter', 'Cairo', sans-serif";

  // Per-theme headline character (size, weight, tracking)
  const headlineCls: Record<string,string> = {
    minimal_luxury: 'text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight',
    dark_futuristic: 'text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight',
    soft_beauty: 'text-4xl sm:text-5xl lg:text-6xl font-light italic leading-[1.05] tracking-tight',
    viral_tiktok: 'text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[0.95] tracking-tighter uppercase',
    organic_nature: 'text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight',
    bold_sales: 'text-4xl sm:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight uppercase',
    royal_gold: 'text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight',
    clean_tech: 'text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight',
    aurora_glass: 'text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.0] tracking-tight',
  };

  const sectionTitleCls: Record<string,string> = {
    minimal_luxury: 'text-3xl sm:text-4xl font-light tracking-tight',
    dark_futuristic: 'text-3xl sm:text-4xl font-bold tracking-tight',
    soft_beauty: 'text-3xl sm:text-4xl font-light italic tracking-tight',
    viral_tiktok: 'text-3xl sm:text-4xl font-extrabold uppercase tracking-tighter',
    organic_nature: 'text-3xl sm:text-4xl font-light tracking-tight',
    bold_sales: 'text-3xl sm:text-4xl font-black uppercase tracking-tight',
    royal_gold: 'text-3xl sm:text-4xl font-semibold tracking-tight',
    clean_tech: 'text-3xl sm:text-4xl font-semibold tracking-tight',
    aurora_glass: 'text-3xl sm:text-4xl font-bold tracking-tight',
  };

  // Body-section ordering: CSS `order` reads from p.sections array so the user
  // can drag sections in the editor to change render order. Unknown ids fall
  // back to a high index so they appear at the end.
  const sectionOrder = (id: string): number => {
    const arr: string[] = p.sections || [];
    const idx = arr.indexOf(id);
    return idx === -1 ? 100 : idx;
  };

  // Sections in p.sections that we know how to render & reorder via CSS order.
  // Header/footer stay fixed (header: sticky, footer: always last).
  const sections: string[] = p.sections || [];
  const isSectionOn = (id: string) => sections.includes(id);

  return (
    <div className={`${t.bg} ${t.textMain} ${t.font} min-h-screen overflow-x-hidden antialiased flex flex-col`} dir="rtl">
      <link href={`https://fonts.googleapis.com/css2?family=${primaryFont}&family=${secondaryFont}&display=swap`} rel="stylesheet" />
      <style>{`.hfont{font-family:${hFont};} .num{font-variant-numeric:tabular-nums;}`}</style>

      {/* Header — always pinned to top (sticky) */}
      <header style={{ order: -1000 }} className={`${t.header} sticky top-0 z-50 px-4 sm:px-8 lg:px-10 py-3.5 sm:py-5 flex justify-between items-center gap-3`}>
        <div className={`${t.brand} hfont truncate text-base sm:text-xl lg:text-2xl`}>{storeName}</div>
        <button onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior:'smooth' })} className={`${t.btnSecondary} shrink-0 !text-[10px] sm:!text-xs whitespace-nowrap`}>
          {p.ctaText || "اطلب الآن"}
        </button>
      </header>

      {/* Announcement / Promo bar — reorderable via sections array (urgency-bar) */}
      {isSectionOn("urgency-bar") && (
        <div style={{ order: sectionOrder("urgency-bar") }} className={`${t.promo} text-center px-3 sm:px-4 flex items-center justify-center gap-2 sm:gap-3 flex-wrap relative overflow-hidden text-[10px] sm:text-xs`}>
          <Clock size={11} className="opacity-80 shrink-0"/>
          <span>العرض ينتهي خلال</span>
          <span className="num font-mono">{pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}</span>
          {p.showFreeShipping && (
            <>
              <span className="opacity-60">•</span>
              <span>شحن مجاني</span>
            </>
          )}
        </div>
      )}

      {/* Hero — reorderable */}
      <section style={{ order: sectionOrder("hero") }} className={`px-4 sm:px-6 py-12 sm:py-20 lg:py-28 ${t.heroBg} relative overflow-hidden`}>
        <div className={`absolute inset-0 ${t.heroBlob} pointer-events-none`}/>
        <div className={`max-w-6xl mx-auto relative ${l.heroWrap}`}>
          {/* Text */}
          <motion.div initial={{y:24,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.7,ease:[0.22,1,0.36,1]}}
            className={`${l.heroText} ${isCentered?'flex flex-col items-center text-center':''} w-full`}>
            <div className={`inline-flex items-center gap-2 mb-5 sm:mb-7 ${t.accentBg}`}>
              <Sparkles size={12}/> {p.category}
            </div>
            <h1 className={`hfont ${headlineCls[p.template]} mb-4 sm:mb-6 break-words`}>{p.heroTitle}</h1>
            <p className={`text-sm sm:text-base lg:text-lg ${t.textSec} mb-7 sm:mb-9 leading-relaxed max-w-xl ${isCentered?'mx-auto':''}`}>
              {p.heroSubtitle}
            </p>

            {/* Price block */}
            <div className={`flex items-baseline gap-3 sm:gap-4 mb-7 sm:mb-9 flex-wrap ${isCentered?'justify-center':''}`}>
              <span className="hfont text-3xl sm:text-4xl lg:text-5xl font-bold num">{p.price.toLocaleString()}<span className="text-base sm:text-xl mr-1 opacity-60">دج</span></span>
              {p.originalPrice > p.price && (
                <span className={`text-base sm:text-lg line-through ${t.textSec} num`}>{p.originalPrice.toLocaleString()} دج</span>
              )}
              {discount > 0 && (
                <span className={`text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 ${t.accentBg}`}>وفّر {discount}%</span>
              )}
            </div>

            <button onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior:'smooth' })}
              className={`${t.btnPrimary} flex items-center gap-2 sm:gap-3 group !text-sm sm:!text-base`}>
              <span>اطلب الآن</span>
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/>
            </button>

            {/* Micro trust row */}
            <div className={`flex flex-wrap gap-3 sm:gap-6 text-[11px] sm:text-sm font-medium mt-6 sm:mt-9 ${t.textSec} ${isCentered?'justify-center':''}`}>
              <span className="flex items-center gap-1.5"><Shield size={13}/> ضمان الجودة</span>
              <span className="flex items-center gap-1.5"><Truck size={13}/> دفع عند الاستلام</span>
              <span className="flex items-center gap-1.5"><RotateCcw size={13}/> إرجاع خلال 7 أيام</span>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div initial={{scale:0.96,opacity:0}} animate={{scale:1,opacity:1}} transition={{duration:0.8,delay:0.15,ease:[0.22,1,0.36,1]}}
            className={`${l.heroImg} relative w-full`}>
            {p.heroImage
              ? <img src={p.heroImage} alt={p.productName} className={`w-full h-auto object-cover ${t.heroImg}`}/>
              : <div className={`w-full aspect-[4/5] flex items-center justify-center ${t.card}`}>
                  <ShoppingCart size={48} className="opacity-15"/>
                </div>
            }
            <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.6}}
              className={`absolute -bottom-3 -right-2 sm:-bottom-5 sm:-right-5 lg:-right-8 ${t.trustBadge} p-2.5 sm:p-4 lg:p-5 flex items-center gap-2 sm:gap-3 max-w-[85%]`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${t.trustIcon} flex items-center justify-center shrink-0`}>
                <Star size={14} className="fill-current"/>
              </div>
              <div>
                <div className="hfont font-bold text-sm sm:text-lg lg:text-xl num">4.9/5</div>
                <div className={`${t.trustText} text-[10px] sm:text-xs`}>+2000 تقييم</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust strip — reorderable, gated by trust-badges section toggle */}
      {isSectionOn("trust-badges") && (
      <section style={{ order: sectionOrder("trust-badges") }} className={`${t.sectionLight} border-y ${isDarkTheme?'border-white/[0.06]':'border-black/[0.06]'} py-6 sm:py-8`}>
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {[
            { icon: Truck, label: 'توصيل لكل الولايات' },
            { icon: Lock, label: 'دفع آمن عند الاستلام' },
            { icon: Award, label: 'منتج أصلي 100%' },
            { icon: Zap, label: 'شحن سريع 24-48 ساعة' },
          ].map((it, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3 justify-start">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 ${t.featIcon} flex items-center justify-center shrink-0`}>
                <it.icon size={14}/>
              </div>
              <span className={`text-[11px] sm:text-sm font-medium ${t.textSec} leading-tight`}>{it.label}</span>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Features */}
      {p.sections?.includes('features') && p.features?.length > 0 && (
        <section style={{ order: sectionOrder('features') }} className={`py-14 sm:py-20 lg:py-24 px-4 sm:px-6 ${t.sectionWhite}`}>
          <div className="max-w-6xl mx-auto">
            <div className={`mb-9 sm:mb-14 ${isCentered?'text-center':''}`}>
              <div className={`inline-flex items-center gap-2 mb-3 sm:mb-4 ${t.accentBg}`}>
                <Check size={12}/> المميزات
              </div>
              <h2 className={`hfont ${sectionTitleCls[p.template]}`}>لماذا تختار هذا المنتج؟</h2>
              <p className={`${t.textSec} mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base ${isCentered?'mx-auto':''}`}>
                مصمّم بعناية ليقدّم تجربة استثنائية في كل تفصيل.
              </p>
            </div>
            <div className={`grid ${l.featGrid}`}>
              {p.features.slice(0,6).map((feat: string, i: number) => (
                <motion.div key={i} initial={{y:24,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true,margin:'-50px'}} transition={{duration:0.5,delay:i*0.06,ease:[0.22,1,0.36,1]}}
                  className={`${t.card} ${t.featCard} p-5 sm:p-7 lg:p-8 flex flex-col gap-3 sm:gap-4`}>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${t.featIcon} flex items-center justify-center shrink-0`}>
                    <span className="hfont font-bold text-sm sm:text-base num">{pad(i+1)}</span>
                  </div>
                  <span className="font-semibold text-sm sm:text-base leading-relaxed">{feat}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Description ("شرح ووصف المنتج") */}
      {p.sections?.includes('description') && (
        <section style={{ order: sectionOrder('description') }} className={`px-4 sm:px-6 ${p.descriptionMode === 'images' ? '' : `py-10 sm:py-16 ${t.sectionWhite}`}`}>
          <div className="max-w-5xl mx-auto">
            <ProductDescriptionSection
              mode={p.descriptionMode}
              title={p.descriptionTitle}
              content={p.descriptionContent}
              textAlign={p.descriptionTextAlign}
              showPoints={p.descriptionShowPoints}
              images={p.descriptionImages}
              textColor={p.descriptionTextColor}
              accentColor={p.descriptionAccentColor || p.primaryColor}
              className="!py-0"
            />
          </div>
        </section>
      )}

      {/* Extra sections — shared components so every toggle works on AI themes too */}
      {isSectionOn("social-proof") && (
        <section style={{ order: sectionOrder("social-proof") }} className="py-4">
          <SocialProofStats p={p} dark={isDarkTheme} accent={p.primaryColor} />
        </section>
      )}
      {isSectionOn("gallery") && (
        <section style={{ order: sectionOrder("gallery") }} className="py-4">
          <GallerySection p={p} dark={isDarkTheme} accent={p.primaryColor} />
        </section>
      )}
      {isSectionOn("video") && (
        <section style={{ order: sectionOrder("video") }} className="py-4">
          <VideoSection p={p} dark={isDarkTheme} accent={p.primaryColor} />
        </section>
      )}
      {isSectionOn("before-after") && (
        <section style={{ order: sectionOrder("before-after") }} className="py-4">
          <BeforeAfterSection p={p} dark={isDarkTheme} accent={p.primaryColor} />
        </section>
      )}
      {isSectionOn("countdown") && (
        <section style={{ order: sectionOrder("countdown") }} className="py-4">
          <CountdownSection p={p} dark={isDarkTheme} accent={p.primaryColor} />
        </section>
      )}
      {isSectionOn("guarantee") && (
        <section style={{ order: sectionOrder("guarantee") }} className="py-4">
          <GuaranteeSection p={p} dark={isDarkTheme} accent={p.primaryColor} />
        </section>
      )}
      {isSectionOn("shipping") && (
        <section style={{ order: sectionOrder("shipping") }} className="py-4">
          <ShippingSection p={p} dark={isDarkTheme} accent={p.primaryColor} />
        </section>
      )}
      {isSectionOn("faq") && (
        <section style={{ order: sectionOrder("faq") }} className="py-4">
          <FaqSection p={p} dark={isDarkTheme} accent={p.primaryColor} />
        </section>
      )}

      {/* Reviews */}
      {p.sections?.includes('reviews') && p.socialProof?.length > 0 && (
        <section style={{ order: sectionOrder('reviews') }} className={`py-14 sm:py-20 lg:py-24 px-4 sm:px-6 ${t.sectionLight}`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-9 sm:mb-14">
              <div className={`inline-flex items-center gap-2 mb-3 sm:mb-4 ${t.accentBg}`}>
                <Star size={12}/> آراء العملاء
              </div>
              <h2 className={`hfont ${sectionTitleCls[p.template]}`}>ما يقوله عملاؤنا</h2>
              <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 flex-wrap">
                <div className="flex gap-0.5 sm:gap-1">
                  {[...Array(5)].map((_,j)=><Star key={j} size={15} className="fill-amber-400 text-amber-400"/>)}
                </div>
                <span className={`${t.textSec} text-xs sm:text-sm font-medium`}>4.9 من 5 — أكثر من 2000 تقييم</span>
              </div>
            </div>
            <div className={`${l.reviewsWrap}`}>
              {p.socialProof.slice(0,3).map((r: any, i: number) => (
                <motion.div key={i} initial={{y:20,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}} transition={{duration:0.5,delay:i*0.08}}
                  className={`${t.card} ${t.reviewCard} ${l.reviewCard}`}>
                  <div className="flex text-amber-400 mb-3 sm:mb-4 gap-0.5">
                    {[...Array(r.rating||5)].map((_,j)=><Star key={j} size={14} className="fill-amber-400"/>)}
                  </div>
                  <p className={`${t.reviewText} mb-5 sm:mb-6 text-sm sm:text-[15px]`}>"{r.text}"</p>
                  <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-current/10">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 ${t.reviewAvatar} flex items-center justify-center font-bold text-xs sm:text-sm shrink-0`}>
                      {r.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm">{r.name}</div>
                      <div className={`text-[10px] sm:text-xs ${t.textSec}`}>{r.wilaya} • عميل موثّق</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Order Form */}
      <section id="order-form" style={{ order: sectionOrder('cta') }} className={`py-14 sm:py-20 lg:py-24 px-4 sm:px-6 ${t.checkoutBg} relative overflow-hidden`}>
        <div className={`max-w-5xl mx-auto relative`}>
          <div className="text-center mb-7 sm:mb-10">
            <div className={`inline-flex items-center gap-2 mb-3 sm:mb-4 ${t.accentBg}`}>
              <Lock size={12}/> الخطوة الأخيرة
            </div>
            <h2 className={`hfont ${sectionTitleCls[p.template]}`}>أكمل طلبك الآن</h2>
            <p className={`${t.textSec} mt-3`}>دفع آمن عند الاستلام — لا حاجة لبطاقة بنكية</p>
          </div>

          <div className={`${l.checkoutWrap} ${t.checkoutCard} overflow-hidden`}>
            {/* Left summary */}
            <div className={`${t.checkoutDark} ${l.checkoutLeft} p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative gap-8 sm:gap-0`}>
              <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)]"/>
              <div className="relative">
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold mb-4 sm:mb-6 opacity-80 tracking-widest uppercase flex-wrap">
                  <Clock size={12}/>
                  <span className="num">{pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}</span>
                  <span>متبقي</span>
                </div>
                <h3 className={`hfont text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 leading-tight`}>اطلب {p.productName} الآن</h3>
                <p className="text-xs sm:text-sm opacity-70 mb-6 sm:mb-10 leading-relaxed">استغل الفرصة واغتنم التخفيض الحالي قبل العودة للسعر الأصلي.</p>

                <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-10">
                  <div className="flex items-baseline gap-3">
                    <span className="hfont text-3xl sm:text-4xl font-bold num">{p.price.toLocaleString()}</span>
                    <span className="opacity-60 text-xs sm:text-sm">دج</span>
                  </div>
                  {p.originalPrice > p.price && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm opacity-50 flex-wrap">
                      <span className="line-through num">{p.originalPrice.toLocaleString()} دج</span>
                      {discount > 0 && <span className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] sm:text-xs font-bold">-{discount}%</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm relative">
                {[
                  { icon: Shield, text: 'ضمان رضى 100%' },
                  { icon: Truck, text: 'دفع عند الاستلام' },
                  { icon: RotateCcw, text: 'إرجاع مجاني خلال 7 أيام' },
                  { icon: Award, text: 'منتج أصلي مضمون' },
                ].map((it, i) => (
                  <div key={i} className="flex items-center gap-2.5 sm:gap-3 opacity-85">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <it.icon size={13}/>
                    </div>
                    <span>{it.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right form */}
            <div className={`${l.checkoutRight} bg-white text-gray-900`}>
              <h3 className="hfont text-lg sm:text-xl lg:text-2xl font-bold mb-2 text-center text-gray-900">معلومات التوصيل</h3>
              <p className="text-center text-[11px] sm:text-xs text-gray-500 mb-6 sm:mb-8">سيتصل بك فريقنا لتأكيد الطلب</p>
              {orderSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="text-green-600" size={36}/>
                  </div>
                  <h4 className="hfont text-2xl font-bold text-gray-900 mb-2">تم استلام طلبك</h4>
                  <p className="text-gray-500 text-sm">سيتصل بك فريقنا خلال 24 ساعة لتأكيد طلبك.</p>
                </div>
              ) : (
                <form onSubmit={handleOrder} className="space-y-4">
                  {/* Color picker */}
                  {p.availableColors && p.availableColors.length > 0 && (
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold mb-2 text-gray-700 uppercase tracking-wider">
                        <Palette size={12}/> اختر اللون *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {p.availableColors.map((color: string) => {
                          const active = orderForm.selectedColor === color;
                          return (
                            <button key={color} type="button"
                              onClick={() => setOrderForm((f: any) => ({ ...f, selectedColor: color }))}
                              className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-gray-50/50 text-gray-700 hover:border-gray-400'}`}>
                              {color}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Size picker */}
                  {p.availableSizes && p.availableSizes.length > 0 && (
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold mb-2 text-gray-700 uppercase tracking-wider">
                        <Ruler size={12}/> اختر المقاس *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {p.availableSizes.map((size: string) => {
                          const active = orderForm.selectedSize === size;
                          return (
                            <button key={size} type="button"
                              onClick={() => setOrderForm((f: any) => ({ ...f, selectedSize: size }))}
                              className={`min-w-[52px] h-11 rounded-xl text-sm font-bold border-2 transition-all ${active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-gray-50/50 text-gray-700 hover:border-gray-400'}`}>
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Offer picker — linked into the form, shown before the name field */}
                  {(p.bundles?.length > 0 || (p.hasMarketingOffers && p.marketingOffers?.length > 0)) && (
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold mb-2 text-gray-700 uppercase tracking-wider">
                        <Sparkles size={12}/> عروض خاصة — اختر عرضك
                      </label>
                      <div className="space-y-2">
                        <button type="button" onClick={() => { setSelectedBundleId(null); setSelectedOffer(null); setQuantity(1); }}
                          className={`w-full flex justify-between items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold border-2 transition-all ${!selectedBundleId && !selectedOffer ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-gray-50/50 text-gray-700 hover:border-gray-400'}`}>
                          <span>المنتج الأساسي</span>
                          <span className="num shrink-0">{p.price.toLocaleString()} دج</span>
                        </button>
                        {p.bundles?.map((b: any) => (
                          <button key={b.id} type="button" onClick={() => { setSelectedBundleId(b.id); setSelectedOffer(null); setQuantity(1); }}
                            className={`w-full flex justify-between items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold border-2 transition-all ${selectedBundleId===b.id ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-gray-50/50 text-gray-700 hover:border-gray-400'}`}>
                            <span>{b.name}</span>
                            <span className="num shrink-0">{b.price.toLocaleString()} دج</span>
                          </button>
                        ))}
                        {p.marketingOffers?.map((o: any, i: number) => (
                          <button key={i} type="button" onClick={() => { setSelectedOffer(o); setSelectedBundleId(null); setQuantity(1); }}
                            className={`w-full flex justify-between items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold border-2 transition-all ${selectedOffer===o ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-gray-50/50 text-gray-700 hover:border-gray-400'}`}>
                            <span>{o.name}</span>
                            <span className="num shrink-0">{o.price.toLocaleString()} دج</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {[{ label:'الاسم الكامل', key:'name', type:'text', placeholder:'محمد أحمد' }, { label:'رقم الهاتف', key:'phone', type:'tel', placeholder:'0XXXXXXXXX' }].map(f => (
                    <div key={f.key}>
                      <label className={`block text-[11px] font-bold mb-1.5 text-gray-700 uppercase tracking-wider`}>{f.label}</label>
                      <input type={f.type} value={orderForm[f.key]} dir={f.key==='phone'?'ltr':undefined} maxLength={f.key==='phone'?10:undefined}
                        onChange={e => setOrderForm((prev: any) => ({ ...prev, [f.key]: f.key==='phone' ? e.target.value.replace(/\D/g,'') : e.target.value }))}
                        placeholder={f.placeholder} required
                        className={`w-full border-2 border-gray-200 bg-gray-50/50 text-gray-900 focus:border-gray-900 focus:bg-white rounded-xl px-4 py-3.5 outline-none font-medium transition-all`}/>
                    </div>
                  ))}

                  <div>
                    <label className={`block text-[11px] font-bold mb-1.5 text-gray-700 uppercase tracking-wider`}>الولاية</label>
                    <div className="relative">
                      <select value={orderForm.wilaya} onChange={e => setOrderForm((f: any) => ({...f, wilaya:e.target.value, commune:'', deliveryType: f.deliveryType || 'home'}))} required
                        className={`w-full border-2 border-gray-200 bg-gray-50/50 text-gray-900 focus:border-gray-900 focus:bg-white rounded-xl px-4 py-3.5 outline-none appearance-none font-medium transition-all`}>
                        <option value="">اختر الولاية</option>
                        {wilayas.map((w: any) => <option key={w.id||w.wilaya_id} value={w.id||w.wilaya_id}>{w.nom||w.wilaya_name}</option>)}
                      </select>
                      <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400"/>
                    </div>
                  </div>

                  {/* Delivery type — Home / Desk */}
                  <div>
                    <label className={`block text-[11px] font-bold mb-2 text-gray-700 uppercase tracking-wider`}>نوع التوصيل</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button"
                        onClick={() => setOrderForm((f: any) => ({ ...f, deliveryType: 'home', commune: '' }))}
                        className={`h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all ${orderForm.deliveryType === 'home' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-gray-50/50 text-gray-700 hover:border-gray-400'}`}>
                        <div className="flex items-center gap-1.5 text-sm font-bold"><Truck size={14}/> للمنزل</div>
                        <span className="text-[10px] opacity-70 num">{shippingRate.home > 0 ? `${shippingRate.home.toLocaleString()} دج` : 'مجاني'}</span>
                      </button>
                      <button type="button"
                        onClick={() => setOrderForm((f: any) => ({ ...f, deliveryType: 'desk', commune: '' }))}
                        className={`h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all ${orderForm.deliveryType === 'desk' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-gray-50/50 text-gray-700 hover:border-gray-400'}`}>
                        <div className="flex items-center gap-1.5 text-sm font-bold"><MapPin size={14}/> ستوب ديسك</div>
                        <span className="text-[10px] opacity-70 num">{shippingRate.desk > 0 ? `${shippingRate.desk.toLocaleString()} دج` : 'مجاني'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1.5 text-gray-700 uppercase tracking-wider`}>البلدية</label>
                    <div className="relative">
                      <select value={orderForm.commune} onChange={e => setOrderForm((f: any) => ({...f, commune:e.target.value}))} required
                        className={`w-full border-2 border-gray-200 bg-gray-50/50 text-gray-900 focus:border-gray-900 focus:bg-white rounded-xl px-4 py-3.5 outline-none appearance-none font-medium transition-all`}>
                        <option value="">اختر البلدية</option>
                        {communes.map((c: any, i: number) => <option key={i} value={c.nom||c.commune_name}>{c.nom||c.commune_name}</option>)}
                      </select>
                      <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400"/>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1.5 text-gray-700 uppercase tracking-wider`}>العنوان</label>
                    <input value={orderForm.address} onChange={e => setOrderForm((f: any) => ({...f, address:e.target.value}))} placeholder="الحي، الشارع، رقم البناية..." required
                      className={`w-full border-2 border-gray-200 bg-gray-50/50 text-gray-900 focus:border-gray-900 focus:bg-white rounded-xl px-4 py-3.5 outline-none font-medium transition-all`}/>
                  </div>

                  {/* Qty */}
                  <div className="flex items-center justify-between py-3 sm:py-4 mt-2 border-t border-gray-100">
                    <span className="font-bold text-xs sm:text-sm text-gray-700">الكمية</span>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setQuantity(Math.max(1,quantity-1))} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white flex items-center justify-center font-black transition-all">-</button>
                      <span className="font-black w-6 text-center num">{quantity}</span>
                      <button type="button" onClick={() => setQuantity(quantity+1)} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white flex items-center justify-center font-black transition-all">+</button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="space-y-2 py-3 sm:py-4 border-y border-gray-100">
                    <div className="flex justify-between text-xs sm:text-sm text-gray-500 gap-2">
                      <span>المنتج × {quantity}</span>
                      <span className="num shrink-0">{(activePrice * quantity).toLocaleString()} دج</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm text-gray-500 gap-2">
                      <span>الشحن</span>
                      <span className="num shrink-0">{currentShipping === 0 ? 'مجاني' : `${currentShipping.toLocaleString()} دج`}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100 gap-2">
                      <span className="hfont text-base sm:text-lg font-bold text-gray-900">المجموع</span>
                      <span className="hfont text-base sm:text-lg font-bold text-gray-900 num shrink-0">{totalPrice.toLocaleString()} دج</span>
                    </div>
                  </div>

                  <button type="submit" className={`w-full ${t.btnPrimary} !rounded-xl flex items-center justify-center gap-2 mt-2 !text-sm sm:!text-base !px-6 !py-4`}>
                    <Lock size={16}/>
                    تأكيد الطلب
                  </button>
                  <p className="text-center text-[11px] sm:text-xs text-gray-400 flex items-center justify-center gap-1.5 pt-1">
                    <Shield size={12}/> دفع آمن عند الاستلام
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer — pinned to bottom */}
      <footer style={{ order: 1000 }} className={`${t.footer} text-center py-8 sm:py-10 px-4`}>
        <div className={`hfont ${t.brand} mb-2 sm:mb-3 text-base sm:text-lg`}>{storeName}</div>
        <div className="text-[10px] sm:text-xs">© {new Date().getFullYear()} — جميع الحقوق محفوظة</div>
      </footer>

      {!disablePopups && isSectionOn("sticky-cta") && <StickyCtaBar p={p} accent={p.primaryColor} />}

      <PurchaseNotificationPopup
        enabled
        accentColor={p.primaryColor}
      />
    </div>
  );
}
