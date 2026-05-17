import { motion } from "framer-motion";
import { ShoppingCart, Star, Shield, Truck, Check, Clock, ChevronDown, Sparkles, ArrowLeft, Award, Lock, RotateCcw, Zap } from "lucide-react";
import { themeTokens, layoutTokens, AITemplateName } from "@/utils/aiThemeTokens";

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
}

const pad = (n: number) => String(n).padStart(2, "0");

const FONT_MAP: Record<string,string> = {
  minimal_luxury:'Cormorant+Garamond:wght@400;500;600;700',
  dark_futuristic:'Inter:wght@400;500;600;700;800;900',
  soft_beauty:'Cormorant+Garamond:wght@400;500;600;700',
  viral_tiktok:'Space+Grotesk:wght@400;500;600;700',
  organic_nature:'Cormorant+Garamond:wght@400;500;600;700',
  bold_sales:'Inter:wght@400;500;600;700;800;900',
};

const SECONDARY_FONT_MAP: Record<string,string> = {
  minimal_luxform:'Cairo:wght@300;400;500;600;700',
  minimal_luxury:'Cairo:wght@300;400;500;600;700',
  dark_futuristic:'Cairo:wght@400;500;600;700;800',
  soft_beauty:'Tajawal:wght@300;400;500;700',
  viral_tiktok:'Cairo:wght@600;700;800;900',
  organic_nature:'Almarai:wght@300;400;700',
  bold_sales:'Changa:wght@500;700;800',
};

export default function AIThemeLandingPage({ p, storeName, orderForm, setOrderForm, handleOrder, quantity, setQuantity, wilayas, communes, shippingRate, selectedOffer, setSelectedOffer, selectedBundleId, setSelectedBundleId, orderSubmitted, countdown }: Props) {
  const t = themeTokens[p.template as AITemplateName];
  const l = layoutTokens[p.template as AITemplateName];
  if (!t || !l) return null;

  const selectedBundle = p.bundles?.find((b: any) => b.id === selectedBundleId);
  const activePrice = selectedOffer ? selectedOffer.price : selectedBundle ? selectedBundle.price : p.price;
  const currentShipping = (selectedOffer?.freeDelivery || p.showFreeShipping) ? 0 : (orderForm.deliveryType === "home" ? shippingRate.home : shippingRate.desk);
  const totalPrice = (activePrice * quantity) + currentShipping;
  const discount = Math.round((1 - p.price / p.originalPrice) * 100);
  const isCentered = ['soft_beauty','viral_tiktok','bold_sales'].includes(p.template);
  const isDarkTheme = ['dark_futuristic','bold_sales'].includes(p.template);
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
  };

  const sectionTitleCls: Record<string,string> = {
    minimal_luxury: 'text-3xl sm:text-4xl font-light tracking-tight',
    dark_futuristic: 'text-3xl sm:text-4xl font-bold tracking-tight',
    soft_beauty: 'text-3xl sm:text-4xl font-light italic tracking-tight',
    viral_tiktok: 'text-3xl sm:text-4xl font-extrabold uppercase tracking-tighter',
    organic_nature: 'text-3xl sm:text-4xl font-light tracking-tight',
    bold_sales: 'text-3xl sm:text-4xl font-black uppercase tracking-tight',
  };

  return (
    <div className={`${t.bg} ${t.textMain} ${t.font} min-h-screen overflow-x-hidden antialiased`} dir="rtl">
      <link href={`https://fonts.googleapis.com/css2?family=${primaryFont}&family=${secondaryFont}&display=swap`} rel="stylesheet" />
      <style>{`.hfont{font-family:${hFont};} .num{font-variant-numeric:tabular-nums;}`}</style>

      {/* Announcement / Promo bar */}
      <div className={`${t.promo} text-center px-4 flex items-center justify-center gap-3 relative overflow-hidden`}>
        <Clock size={13} className="opacity-80"/>
        <span>العرض ينتهي خلال</span>
        <span className="num font-mono">{pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}</span>
        <span className="opacity-60">•</span>
        <span>شحن مجاني</span>
      </div>

      {/* Header */}
      <header className={`${t.header} sticky top-0 z-50 px-6 sm:px-10 py-5 flex justify-between items-center`}>
        <div className={`${t.brand} hfont`}>{storeName}</div>
        <button onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior:'smooth' })} className={`${t.btnSecondary}`}>
          {p.ctaText || "اطلب الآن"}
        </button>
      </header>

      {/* Hero */}
      <section className={`px-4 sm:px-6 py-20 sm:py-28 ${t.heroBg} relative overflow-hidden`}>
        <div className={`absolute inset-0 ${t.heroBlob} pointer-events-none`}/>
        <div className={`max-w-6xl mx-auto relative ${l.heroWrap}`}>
          {/* Text */}
          <motion.div initial={{y:24,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.7,ease:[0.22,1,0.36,1]}}
            className={`${l.heroText} ${isCentered?'flex flex-col items-center text-center':''}`}>
            <div className={`inline-flex items-center gap-2 mb-7 ${t.accentBg}`}>
              <Sparkles size={12}/> {p.category}
            </div>
            <h1 className={`hfont ${headlineCls[p.template]} mb-6`}>{p.heroTitle}</h1>
            <p className={`text-base sm:text-lg ${t.textSec} mb-9 leading-relaxed max-w-xl ${isCentered?'mx-auto':''}`}>
              {p.heroSubtitle}
            </p>

            {/* Price block */}
            <div className={`flex items-baseline gap-4 mb-9 flex-wrap ${isCentered?'justify-center':''}`}>
              <span className="hfont text-4xl sm:text-5xl font-bold num">{p.price.toLocaleString()}<span className="text-xl mr-1 opacity-60">دج</span></span>
              {p.originalPrice > p.price && (
                <span className={`text-lg line-through ${t.textSec} num`}>{p.originalPrice.toLocaleString()} دج</span>
              )}
              {discount > 0 && (
                <span className={`text-xs font-bold px-3 py-1.5 ${t.accentBg}`}>وفّر {discount}%</span>
              )}
            </div>

            <button onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior:'smooth' })}
              className={`${t.btnPrimary} flex items-center gap-3 group`}>
              <span>اطلب الآن</span>
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/>
            </button>

            {/* Micro trust row */}
            <div className={`flex flex-wrap gap-6 text-xs sm:text-sm font-medium mt-9 ${t.textSec} ${isCentered?'justify-center':''}`}>
              <span className="flex items-center gap-1.5"><Shield size={14}/> ضمان الجودة</span>
              <span className="flex items-center gap-1.5"><Truck size={14}/> دفع عند الاستلام</span>
              <span className="flex items-center gap-1.5"><RotateCcw size={14}/> إرجاع خلال 7 أيام</span>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div initial={{scale:0.96,opacity:0}} animate={{scale:1,opacity:1}} transition={{duration:0.8,delay:0.15,ease:[0.22,1,0.36,1]}}
            className={`${l.heroImg} relative`}>
            {p.heroImage
              ? <img src={p.heroImage} alt={p.productName} className={`w-full h-auto object-cover ${t.heroImg}`}/>
              : <div className={`w-full aspect-[4/5] flex items-center justify-center ${t.card}`}>
                  <ShoppingCart size={48} className="opacity-15"/>
                </div>
            }
            <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.6}}
              className={`absolute -bottom-5 -right-5 sm:-right-8 ${t.trustBadge} p-4 sm:p-5 flex items-center gap-3`}>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${t.trustIcon} flex items-center justify-center`}>
                <Star size={18} className="fill-current"/>
              </div>
              <div>
                <div className="hfont font-bold text-lg sm:text-xl num">4.9/5</div>
                <div className={`${t.trustText}`}>+2000 تقييم</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust strip */}
      <section className={`${t.sectionLight} border-y ${isDarkTheme?'border-white/[0.06]':'border-black/[0.06]'} py-8`}>
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {[
            { icon: Truck, label: 'توصيل لكل الولايات' },
            { icon: Lock, label: 'دفع آمن عند الاستلام' },
            { icon: Award, label: 'منتج أصلي 100%' },
            { icon: Zap, label: 'شحن سريع 24-48 ساعة' },
          ].map((it, i) => (
            <div key={i} className="flex items-center gap-3 justify-center sm:justify-start">
              <div className={`w-10 h-10 ${t.featIcon} flex items-center justify-center shrink-0`}>
                <it.icon size={16}/>
              </div>
              <span className={`text-xs sm:text-sm font-medium ${t.textSec}`}>{it.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      {p.sections?.includes('features') && p.features?.length > 0 && (
        <section className={`py-20 sm:py-24 px-4 sm:px-6 ${t.sectionWhite}`}>
          <div className="max-w-6xl mx-auto">
            <div className={`mb-14 ${isCentered?'text-center':''}`}>
              <div className={`inline-flex items-center gap-2 mb-4 ${t.accentBg}`}>
                <Check size={12}/> المميزات
              </div>
              <h2 className={`hfont ${sectionTitleCls[p.template]}`}>لماذا تختار هذا المنتج؟</h2>
              <p className={`${t.textSec} mt-3 max-w-2xl ${isCentered?'mx-auto':''}`}>
                مصمّم بعناية ليقدّم تجربة استثنائية في كل تفصيل.
              </p>
            </div>
            <div className={`grid ${l.featGrid}`}>
              {p.features.slice(0,6).map((feat: string, i: number) => (
                <motion.div key={i} initial={{y:24,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true,margin:'-50px'}} transition={{duration:0.5,delay:i*0.06,ease:[0.22,1,0.36,1]}}
                  className={`${t.card} ${t.featCard} p-7 sm:p-8 flex flex-col gap-4`}>
                  <div className={`w-12 h-12 ${t.featIcon} flex items-center justify-center shrink-0`}>
                    <span className="hfont font-bold text-base num">{pad(i+1)}</span>
                  </div>
                  <span className="font-semibold text-base leading-relaxed">{feat}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {p.sections?.includes('reviews') && p.socialProof?.length > 0 && (
        <section className={`py-20 sm:py-24 px-4 sm:px-6 ${t.sectionLight}`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className={`inline-flex items-center gap-2 mb-4 ${t.accentBg}`}>
                <Star size={12}/> آراء العملاء
              </div>
              <h2 className={`hfont ${sectionTitleCls[p.template]}`}>ما يقوله عملاؤنا</h2>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_,j)=><Star key={j} size={18} className="fill-amber-400 text-amber-400"/>)}
                </div>
                <span className={`${t.textSec} text-sm font-medium`}>4.9 من 5 — أكثر من 2000 تقييم</span>
              </div>
            </div>
            <div className={`${l.reviewsWrap}`}>
              {p.socialProof.slice(0,3).map((r: any, i: number) => (
                <motion.div key={i} initial={{y:20,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}} transition={{duration:0.5,delay:i*0.08}}
                  className={`${t.card} ${t.reviewCard} ${l.reviewCard}`}>
                  <div className="flex text-amber-400 mb-4 gap-0.5">
                    {[...Array(r.rating||5)].map((_,j)=><Star key={j} size={15} className="fill-amber-400"/>)}
                  </div>
                  <p className={`${t.reviewText} mb-6 text-[15px]`}>"{r.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-current/10">
                    <div className={`w-10 h-10 ${t.reviewAvatar} flex items-center justify-center font-bold text-sm`}>
                      {r.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{r.name}</div>
                      <div className={`text-xs ${t.textSec}`}>{r.wilaya} • عميل موثّق</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bundles / Offers */}
      {(p.bundles?.length > 0 || p.hasMarketingOffers) && (
        <section className={`py-16 sm:py-20 px-4 sm:px-6 ${t.sectionWhite}`}>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className={`inline-flex items-center gap-2 mb-4 ${t.accentBg}`}>
                <Sparkles size={12}/> عروض خاصة
              </div>
              <h3 className={`hfont ${sectionTitleCls[p.template]}`}>اختر عرضك</h3>
            </div>
            <div className="space-y-3">
              <button type="button" onClick={() => { setSelectedBundleId(null); setSelectedOffer(null); setQuantity(1); }}
                className={`w-full flex justify-between items-center p-5 transition-all duration-300 ${t.featCard} font-bold text-right ${!selectedBundleId && !selectedOffer ? `${t.accentBg} ring-2 ring-current/10` : t.card}`}>
                <span className="text-base">المنتج الأساسي</span>
                <span className="num">{p.price.toLocaleString()} دج</span>
              </button>
              {p.bundles?.map((b: any) => (
                <button key={b.id} type="button" onClick={() => { setSelectedBundleId(b.id); setSelectedOffer(null); setQuantity(1); }}
                  className={`w-full flex justify-between items-center p-5 transition-all duration-300 ${t.featCard} font-bold text-right ${selectedBundleId===b.id ? `${t.accentBg} ring-2 ring-current/10` : t.card}`}>
                  <span className="text-base">{b.name}</span>
                  <span className="num">{b.price.toLocaleString()} دج</span>
                </button>
              ))}
              {p.marketingOffers?.map((o: any, i: number) => (
                <button key={i} type="button" onClick={() => { setSelectedOffer(o); setSelectedBundleId(null); setQuantity(1); }}
                  className={`w-full flex justify-between items-center p-5 transition-all duration-300 ${t.featCard} font-bold text-right ${selectedOffer===o ? `${t.accentBg} ring-2 ring-current/10` : t.card}`}>
                  <span className="text-base">{o.name}</span>
                  <span className="num">{o.price.toLocaleString()} دج</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Order Form */}
      <section id="order-form" className={`py-20 sm:py-24 px-4 sm:px-6 ${t.checkoutBg} relative overflow-hidden`}>
        <div className={`max-w-5xl mx-auto relative`}>
          <div className="text-center mb-10">
            <div className={`inline-flex items-center gap-2 mb-4 ${t.accentBg}`}>
              <Lock size={12}/> الخطوة الأخيرة
            </div>
            <h2 className={`hfont ${sectionTitleCls[p.template]}`}>أكمل طلبك الآن</h2>
            <p className={`${t.textSec} mt-3`}>دفع آمن عند الاستلام — لا حاجة لبطاقة بنكية</p>
          </div>

          <div className={`${l.checkoutWrap} ${t.checkoutCard} overflow-hidden`}>
            {/* Left summary */}
            <div className={`${t.checkoutDark} ${l.checkoutLeft} p-8 sm:p-12 flex flex-col justify-between relative`}>
              <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)]"/>
              <div className="relative">
                <div className="flex items-center gap-2 text-[11px] font-bold mb-6 opacity-80 tracking-widest uppercase">
                  <Clock size={12}/>
                  <span className="num">{pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}</span>
                  <span>متبقي</span>
                </div>
                <h3 className={`hfont text-2xl sm:text-3xl font-bold mb-4 leading-tight`}>اطلب {p.productName} الآن</h3>
                <p className="text-sm opacity-70 mb-10 leading-relaxed">استغل الفرصة واغتنم التخفيض الحالي قبل العودة للسعر الأصلي.</p>

                <div className="space-y-3 mb-10">
                  <div className="flex items-baseline gap-3">
                    <span className="hfont text-4xl font-bold num">{p.price.toLocaleString()}</span>
                    <span className="opacity-60 text-sm">دج</span>
                  </div>
                  {p.originalPrice > p.price && (
                    <div className="flex items-center gap-2 text-sm opacity-50">
                      <span className="line-through num">{p.originalPrice.toLocaleString()} دج</span>
                      {discount > 0 && <span className="px-2 py-0.5 bg-white/10 rounded-md text-xs font-bold">-{discount}%</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3 text-sm relative">
                {[
                  { icon: Shield, text: 'ضمان رضى 100%' },
                  { icon: Truck, text: 'دفع عند الاستلام' },
                  { icon: RotateCcw, text: 'إرجاع مجاني خلال 7 أيام' },
                  { icon: Award, text: 'منتج أصلي مضمون' },
                ].map((it, i) => (
                  <div key={i} className="flex items-center gap-3 opacity-85">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <it.icon size={14}/>
                    </div>
                    <span>{it.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right form */}
            <div className={`${l.checkoutRight} bg-white text-gray-900`}>
              <h3 className="hfont text-xl sm:text-2xl font-bold mb-2 text-center text-gray-900">معلومات التوصيل</h3>
              <p className="text-center text-xs text-gray-500 mb-8">سيتصل بك فريقنا لتأكيد الطلب</p>
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
                  {[{ label:'الاسم الكامل', key:'name', type:'text', placeholder:'محمد أحمد' }, { label:'رقم الهاتف', key:'phone', type:'tel', placeholder:'0XXXXXXXXX' }].map(f => (
                    <div key={f.key}>
                      <label className={`block text-[11px] font-bold mb-1.5 text-gray-700 uppercase tracking-wider`}>{f.label}</label>
                      <input type={f.type} value={orderForm[f.key]} dir={f.key==='phone'?'ltr':undefined} maxLength={f.key==='phone'?10:undefined}
                        onChange={e => setOrderForm((prev: any) => ({ ...prev, [f.key]: f.key==='phone' ? e.target.value.replace(/\D/g,'') : e.target.value }))}
                        placeholder={f.placeholder} required
                        className={`w-full border-2 border-gray-200 bg-gray-50/50 text-gray-900 focus:border-gray-900 focus:bg-white rounded-xl px-4 py-3.5 outline-none font-medium transition-all`}/>
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-[11px] font-bold mb-1.5 text-gray-700 uppercase tracking-wider`}>الولاية</label>
                      <div className="relative">
                        <select value={orderForm.wilaya} onChange={e => setOrderForm((f: any) => ({...f, wilaya:e.target.value, commune:''}))} required
                          className={`w-full border-2 border-gray-200 bg-gray-50/50 text-gray-900 focus:border-gray-900 focus:bg-white rounded-xl px-4 py-3.5 outline-none appearance-none font-medium transition-all`}>
                          <option value="">اختر الولاية</option>
                          {wilayas.map((w: any) => <option key={w.id||w.wilaya_id} value={w.id||w.wilaya_id}>{w.nom||w.wilaya_name}</option>)}
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400"/>
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
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold mb-1.5 text-gray-700 uppercase tracking-wider`}>العنوان</label>
                    <input value={orderForm.address} onChange={e => setOrderForm((f: any) => ({...f, address:e.target.value}))} placeholder="الحي، الشارع، رقم البناية..." required
                      className={`w-full border-2 border-gray-200 bg-gray-50/50 text-gray-900 focus:border-gray-900 focus:bg-white rounded-xl px-4 py-3.5 outline-none font-medium transition-all`}/>
                  </div>

                  {/* Qty */}
                  <div className="flex items-center justify-between py-4 mt-2 border-t border-gray-100">
                    <span className="font-bold text-sm text-gray-700">الكمية</span>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setQuantity(Math.max(1,quantity-1))} className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white flex items-center justify-center font-black transition-all">-</button>
                      <span className="font-black w-6 text-center num">{quantity}</span>
                      <button type="button" onClick={() => setQuantity(quantity+1)} className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white flex items-center justify-center font-black transition-all">+</button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="space-y-2 py-4 border-y border-gray-100">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>المنتج × {quantity}</span>
                      <span className="num">{(activePrice * quantity).toLocaleString()} دج</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>الشحن</span>
                      <span className="num">{currentShipping === 0 ? 'مجاني' : `${currentShipping.toLocaleString()} دج`}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="hfont text-lg font-bold text-gray-900">المجموع</span>
                      <span className="hfont text-lg font-bold text-gray-900 num">{totalPrice.toLocaleString()} دج</span>
                    </div>
                  </div>

                  <button type="submit" className={`w-full ${t.btnPrimary} !rounded-xl flex items-center justify-center gap-2 mt-2`}>
                    <Lock size={16}/>
                    تأكيد الطلب
                  </button>
                  <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5 pt-1">
                    <Shield size={12}/> دفع آمن عند الاستلام
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${t.footer} text-center py-10 px-4`}>
        <div className={`hfont ${t.brand} mb-3`}>{storeName}</div>
        <div className="text-xs">© {new Date().getFullYear()} — جميع الحقوق محفوظة</div>
      </footer>
    </div>
  );
}
