import { motion } from "framer-motion";
import { ShoppingCart, Star, Shield, Truck, Check, Clock, ChevronDown, Sparkles, ArrowLeft } from "lucide-react";
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

export default function AIThemeLandingPage({ p, storeName, orderForm, setOrderForm, handleOrder, quantity, setQuantity, wilayas, communes, shippingRate, selectedOffer, setSelectedOffer, selectedBundleId, setSelectedBundleId, orderSubmitted, countdown }: Props) {
  const t = themeTokens[p.template as AITemplateName];
  const l = layoutTokens[p.template as AITemplateName];
  if (!t || !l) return null;

  const selectedBundle = p.bundles?.find((b: any) => b.id === selectedBundleId);
  const activePrice = selectedOffer ? selectedOffer.price : selectedBundle ? selectedBundle.price : p.price;
  const currentShipping = (selectedOffer?.freeDelivery || p.showFreeShipping) ? 0 : (orderForm.deliveryType === "home" ? shippingRate.home : shippingRate.desk);
  const totalPrice = (activePrice * quantity) + currentShipping;
  const discount = Math.round((1 - p.price / p.originalPrice) * 100);
  const fontMap: Record<string,string> = { minimal_luxury:'Cairo', dark_futuristic:'Cairo', soft_beauty:'Tajawal', viral_tiktok:'Cairo', organic_nature:'Almarai', bold_sales:'Changa' };
  const fontName = fontMap[p.template] || 'Cairo';
  const isCentered = ['soft_beauty','viral_tiktok','bold_sales'].includes(p.template);

  return (
    <div className={`${t.bg} ${t.textMain} ${t.font} min-h-screen overflow-x-hidden`} dir="rtl">
      <link href={`https://fonts.googleapis.com/css2?family=${fontName}:wght@400;600;700;800;900&display=swap`} rel="stylesheet" />

      {/* Promo */}
      <div className={`${t.promo} text-center py-2.5 px-4 flex items-center justify-center gap-2`}>
        <Clock size={15}/> العرض ينتهي خلال: {pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)} — الشحن مجاني!
      </div>

      {/* Header */}
      <header className={`${t.header} sticky top-0 z-50 px-6 py-4 flex justify-between items-center`}>
        <div className={`font-black text-2xl ${t.brand}`}>{storeName}</div>
        <button onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior:'smooth' })} className={`${t.btnSecondary} transition-all`}>
          {p.ctaText || "اطلب الآن"}
        </button>
      </header>

      {/* Hero */}
      <section className={`px-4 sm:px-6 py-16 ${t.heroBg} relative overflow-hidden`}>
        <div className={`absolute inset-0 ${t.heroBlob} rounded-full -z-10`}/>
        <div className={`max-w-5xl mx-auto ${l.heroWrap}`}>
          {/* Text */}
          <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.2}} className={`${l.heroText} ${isCentered?'flex flex-col items-center text-center':''}`}>
            <div className={`inline-flex items-center gap-2 py-1.5 px-4 mb-6 ${t.accentBg}`}><Sparkles size={15}/> {p.category}</div>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-5">{p.heroTitle}</h1>
            <p className={`text-lg ${t.textSec} mb-7 leading-relaxed max-w-lg`}>{p.heroSubtitle}</p>
            <div className="flex items-center gap-3 mb-7 flex-wrap">
              <span className="text-3xl font-black">{p.price.toLocaleString()} دج</span>
              {p.originalPrice > p.price && <span className={`text-lg line-through ${t.textSec}`}>{p.originalPrice.toLocaleString()} دج</span>}
              {discount > 0 && <span className="bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full">-{discount}%</span>}
            </div>
            <button onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior:'smooth' })}
              className={`${t.btnPrimary} font-bold text-lg transition-transform flex items-center gap-2`}>
              اطلب الآن وادفع لاحقاً <ArrowLeft size={20}/>
            </button>
            <div className={`flex flex-wrap gap-5 text-sm font-medium mt-6 ${t.textSec} ${isCentered?'justify-center':''}`}>
              <span className="flex items-center gap-1.5"><Shield size={16} className="text-emerald-500"/> ضمان الجودة</span>
              <span className="flex items-center gap-1.5"><Truck size={16} className="text-emerald-500"/> دفع عند الاستلام</span>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:0.4}} className={`${l.heroImg} relative`}>
            {p.heroImage
              ? <img src={p.heroImage} alt={p.productName} className={`w-full h-auto object-cover ${t.heroImg}`}/>
              : <div className={`w-full aspect-video flex items-center justify-center ${t.card}`}><ShoppingCart size={40} className="opacity-20"/></div>
            }
            <div className={`absolute -bottom-4 -right-4 ${t.trustBadge} p-4 flex items-center gap-3 shadow-lg`}>
              <div className={`w-10 h-10 ${t.trustIcon} flex items-center justify-center`}><Star size={20} className="fill-current"/></div>
              <div><div className="font-black text-lg">4.9/5</div><div className={`text-xs ${t.trustText}`}>+2000 تقييم</div></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      {p.sections?.includes('features') && p.features?.length > 0 && (
        <section className={`py-16 px-4 sm:px-6 ${t.sectionWhite}`}>
          <div className="max-w-6xl mx-auto">
            <h2 className={`text-3xl font-black text-center mb-10 ${isCentered?'':'text-right'}`}>لماذا تختار هذا المنتج؟</h2>
            <div className={`grid ${l.featGrid}`}>
              {p.features.slice(0,6).map((feat: string, i: number) => (
                <motion.div key={i} initial={{y:20,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}} transition={{delay:i*0.07}}
                  className={`${t.card} ${t.featCard} p-6 border flex items-start gap-4`}>
                  <div className={`w-10 h-10 ${t.featIcon} flex items-center justify-center shrink-0`}><Check size={18}/></div>
                  <span className="font-bold">{feat}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {p.sections?.includes('reviews') && p.socialProof?.length > 0 && (
        <section className={`py-16 px-4 sm:px-6 ${t.sectionLight}`}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-10">آراء العملاء</h2>
            <div className={`${l.reviewsWrap}`}>
              {p.socialProof.slice(0,3).map((r: any, i: number) => (
                <div key={i} className={`${t.card} ${t.reviewCard} border`}>
                  <div className="flex text-amber-400 mb-3">{[...Array(r.rating||5)].map((_,j)=><Star key={j} size={16} className="fill-amber-400"/>)}</div>
                  <p className={`${t.reviewText} italic mb-4 leading-relaxed text-sm`}>"{r.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 ${t.reviewAvatar} flex items-center justify-center font-bold text-sm`}>{r.name?.charAt(0)}</div>
                    <div><div className="font-bold text-sm">{r.name}</div><div className={`text-xs ${t.textSec}`}>{r.wilaya}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bundles / Offers */}
      {(p.bundles?.length > 0 || p.hasMarketingOffers) && (
        <section className={`py-12 px-4 sm:px-6 ${t.sectionWhite}`}>
          <div className="max-w-xl mx-auto">
            <h3 className="text-xl font-black text-center mb-5">اختر عرضك</h3>
            <div className="space-y-3">
              <button type="button" onClick={() => { setSelectedBundleId(null); setSelectedOffer(null); setQuantity(1); }}
                className={`w-full flex justify-between items-center p-4 border-2 transition-all ${t.featCard} font-bold text-right ${!selectedBundleId && !selectedOffer ? t.accentBg : t.card}`}>
                <span>المنتج الأساسي</span><span>{p.price.toLocaleString()} دج</span>
              </button>
              {p.bundles?.map((b: any) => (
                <button key={b.id} type="button" onClick={() => { setSelectedBundleId(b.id); setSelectedOffer(null); setQuantity(1); }}
                  className={`w-full flex justify-between items-center p-4 border-2 transition-all ${t.featCard} font-bold text-right ${selectedBundleId===b.id ? t.accentBg : t.card}`}>
                  <span>{b.name}</span><span>{b.price.toLocaleString()} دج</span>
                </button>
              ))}
              {p.marketingOffers?.map((o: any, i: number) => (
                <button key={i} type="button" onClick={() => { setSelectedOffer(o); setSelectedBundleId(null); setQuantity(1); }}
                  className={`w-full flex justify-between items-center p-4 border-2 transition-all ${t.featCard} font-bold text-right ${selectedOffer===o ? t.accentBg : t.card}`}>
                  <span>{o.name}</span><span>{o.price.toLocaleString()} دج</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Order Form */}
      <section id="order-form" className={`py-16 px-4 sm:px-6 ${t.checkoutBg}`}>
        <div className={`${l.checkoutWrap} ${t.checkoutCard} max-w-4xl mx-auto overflow-hidden`}>
          {/* Left info */}
          <div className={`${t.checkoutDark} ${l.checkoutLeft} p-8 sm:p-10 flex flex-col justify-between`}>
            <div>
              <div className="text-sm font-bold mb-4 opacity-80">⏳ العرض ينتهي خلال: {pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}</div>
              <h2 className="text-2xl font-black mb-3">اطلب {p.productName} الآن</h2>
              <p className="text-sm opacity-70 mb-8 leading-relaxed">استغل الفرصة واغتنم التخفيض الحالي قبل العودة للسعر الأصلي.</p>
              <div className="text-3xl font-black mb-1">{p.price.toLocaleString()} دج</div>
              {p.originalPrice > p.price && <div className="text-sm line-through opacity-50">{p.originalPrice.toLocaleString()} دج</div>}
            </div>
            <div className="space-y-3 text-sm mt-8">
              <div className="flex items-center gap-3 opacity-80"><Shield size={16}/> ضمان رضى 100%</div>
              <div className="flex items-center gap-3 opacity-80"><Truck size={16}/> دفع عند الاستلام</div>
              <div className="flex items-center gap-3 opacity-80"><Check size={16}/> إرجاع مجاني</div>
            </div>
          </div>

          {/* Right form */}
          <div className={`${l.checkoutRight} bg-white`}>
            <h3 className="text-xl font-black mb-6 text-center text-gray-900">يرجى ملء الاستمارة</h3>
            {orderSubmitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="text-green-600" size={32}/></div>
                <h4 className="text-xl font-black text-gray-900">تم استلام طلبك! ✅</h4>
                <p className="text-gray-500 mt-2 text-sm">سيتصل بك فريقنا خلال 24 ساعة.</p>
              </div>
            ) : (
              <form onSubmit={handleOrder} className="space-y-4">
                {[{ label:'الاسم الكامل *', key:'name', type:'text', placeholder:'محمد أحمد...' }, { label:'رقم الهاتف *', key:'phone', type:'tel', placeholder:'0XXXXXXXXX' }].map(f => (
                  <div key={f.key}>
                    <label className={`block text-sm font-bold mb-1.5 ${t.textMain}`}>{f.label}</label>
                    <input type={f.type} value={orderForm[f.key]} dir={f.key==='phone'?'ltr':undefined} maxLength={f.key==='phone'?10:undefined}
                      onChange={e => setOrderForm((prev: any) => ({ ...prev, [f.key]: f.key==='phone' ? e.target.value.replace(/\D/g,'') : e.target.value }))}
                      placeholder={f.placeholder} required
                      className={`w-full border-2 ${t.inputStyle} px-4 py-3 outline-none font-medium`}/>
                  </div>
                ))}
                <div>
                  <label className={`block text-sm font-bold mb-1.5 ${t.textMain}`}>الولاية *</label>
                  <div className="relative">
                    <select value={orderForm.wilaya} onChange={e => setOrderForm((f: any) => ({...f, wilaya:e.target.value, commune:''}))} required
                      className={`w-full border-2 ${t.inputStyle} px-4 py-3 outline-none appearance-none font-medium`}>
                      <option value="">اختر ولايتك</option>
                      {wilayas.map((w: any) => <option key={w.id||w.wilaya_id} value={w.id||w.wilaya_id}>{w.nom||w.wilaya_name}</option>)}
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400"/>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-1.5 ${t.textMain}`}>البلدية *</label>
                  <div className="relative">
                    <select value={orderForm.commune} onChange={e => setOrderForm((f: any) => ({...f, commune:e.target.value}))} required
                      className={`w-full border-2 ${t.inputStyle} px-4 py-3 outline-none appearance-none font-medium`}>
                      <option value="">اختر بلديتك</option>
                      {communes.map((c: any, i: number) => <option key={i} value={c.nom||c.commune_name}>{c.nom||c.commune_name}</option>)}
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400"/>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-1.5 ${t.textMain}`}>العنوان *</label>
                  <input value={orderForm.address} onChange={e => setOrderForm((f: any) => ({...f, address:e.target.value}))} placeholder="الحي، الشارع..." required
                    className={`w-full border-2 ${t.inputStyle} px-4 py-3 outline-none font-medium`}/>
                </div>
                {/* Qty + Total */}
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                  <span className="font-bold text-sm text-gray-700">الكمية</span>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setQuantity(Math.max(1,quantity-1))} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center font-black">-</button>
                    <span className="font-black w-5 text-center">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity+1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center font-black">+</button>
                  </div>
                </div>
                <div className="text-lg font-black flex justify-between pt-2 border-t border-gray-100">
                  <span>المجموع</span><span>{totalPrice.toLocaleString()} دج</span>
                </div>
                <button type="submit" className={`w-full ${t.btnPrimary} transition-all mt-2`}>تأكيد الطلب 💯</button>
                <p className="text-center text-xs text-gray-400">دفع عند الاستلام — لا حاجة لبطاقة بنكية</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${t.footer} text-center py-8 text-sm`}>
        © {new Date().getFullYear()} {storeName} — جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
