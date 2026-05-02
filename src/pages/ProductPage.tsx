import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart, Check, Star, Truck, Shield, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { wilayas } from "@/data/mockAffiliateData";
import { useToast } from "@/hooks/use-toast";
import { ShippingRate } from "@/data/mockShippingData";
import { API_BASE_URL } from '@/config/api';


const ProductPage = () => {
  const { productId, affiliateId } = useParams();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [communes, setCommunes] = useState<any[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    wilaya: "",
    commune: "",
    address: "",
    deliveryType: "home" as "home" | "office",
    selectedColor: "",
    selectedSize: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isAffiliate, setIsAffiliate] = useState(false);

  useEffect(() => {
    // Fetch product from backend
    const fetchProduct = async () => {
      try {
        const res = await fetch('${API_BASE_URL}/products');
        const json = await res.json();
        if (res.ok && json.data) {
          const found = json.data.find((p: any) => p.id === productId);
          setProduct(found || null);
        }
      } catch (err) {
        console.error('Failed to fetch product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();

    const fetchRates = async () => {
      try {
        const res = await fetch('${API_BASE_URL}/delivery/all-rates');
        const json = await res.json();
        if (res.ok && json.data) setShippingRates(json.data);
      } catch (err) {
        console.error('Failed to fetch shipping rates', err);
      }
    };
    fetchRates();

    const userStr = localStorage.getItem("affiliate_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role === "ADMIN" || user.role === "admin");
        setIsAffiliate(user.role !== "ADMIN" && user.role !== "admin");
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, [productId]);

  // Fetch communes when wilaya changes
  useEffect(() => {
    const fetchCommunes = async () => {
      if (!formData.wilaya) {
        setCommunes([]);
        return;
      }
      setLoadingCommunes(true);
      console.log(`🔍 Fetching communes for wilaya_id: ${formData.wilaya}`);
      try {
        const wilayaId = parseInt(formData.wilaya);
        if (isNaN(wilayaId)) {
          console.warn("⚠️ wilaya_id is not a number:", formData.wilaya);
          setLoadingCommunes(false);
          return;
        }
        const res = await fetch(`${API_BASE_URL}/delivery/communes?wilaya_id=${wilayaId}`);
        const json = await res.json();
        console.log("📦 Communes API Response:", json);
        if (res.ok && json.data && Array.isArray(json.data)) {
          setCommunes(json.data);
          // Auto-select first commune if current one is invalid/empty
          if (json.data.length > 0) {
            const firstCommuneName = json.data[0].nom || json.data[0].commune_name;
            if (!formData.commune || !json.data.find((c:any) => (c.nom || c.commune_name) === formData.commune)) {
              setFormData(prev => ({ ...prev, commune: firstCommuneName }));
            }
          }
        } else {
          console.warn("⚠️ No communes found or invalid response:", json);
          setCommunes([]);
        }
      } catch (err) {
        console.error("Failed to fetch communes", err);
      } finally {
        setLoadingCommunes(false);
      }
    };
    fetchCommunes();
  }, [formData.wilaya]);
  
  // Track Pixels
  const [pixels, setPixels] = useState<{facebook: string; tiktok: string} | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem("affiliate_store_settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.pixels) {
          setPixels(parsed.pixels);
          const p = parsed.pixels;
          
          if (p.facebook) {
            (function (f:any, b:any, e:any, v:any, n?:any, t?:any, s?:any) {
              if (f.fbq) return;
              n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
              if (!f._fbq) f._fbq = n;
              n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
              t = b.createElement(e); t.async = !0; t.src = v;
              s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
            })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
            // @ts-ignore
            window.fbq("init", p.facebook);
            // @ts-ignore
            window.fbq("track", "PageView");
          }

          if (p.tiktok) {
            (function (w:any, d:any, t:any) {
              w.TiktokAnalyticsObject = t;
              var ttq = (w[t] = w[t] || []);
              ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
              ttq.setAndDefer = function (t:any, e:any) {
                t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); };
              };
              for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
              ttq.instance = function (t:any) {
                for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
                return e;
              };
              ttq.load = function (e:any, n?:any) {
                var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
                ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = i; ttq._t = ttq._t || {}; ttq._t[e] = +new Date();
                ttq._o = ttq._o || {}; ttq._o[e] = n || {};
                n = document.createElement("script"); n.type = "text/javascript"; n.async = !0; n.src = i + "?sdkid=" + e + "&lib=" + t;
                var s: any = document.getElementsByTagName("script")[0];
                s.parentNode.insertBefore(n, s);
              };
              ttq.load(p.tiktok);
              ttq.page();
            })(window, document, "ttq");
          }
        }
      } catch(e){}
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full inline-block mb-4"
          />
          <p className="text-muted-foreground">جاري تحميل المنتج...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">المنتج غير موجود</h1>
          <Link to={(isAdmin || isAffiliate) ? "/products" : "/"}>
            <Button>{(isAdmin || isAffiliate) ? "العودة للمنتجات" : "العودة للرئيسية"}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.wilaya || !formData.commune || !formData.address) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول الأساسية",
        variant: "destructive"
      });
      return;
    }

    if (product.availableColors?.length > 0 && !formData.selectedColor) {
      toast({
        title: "تنبيه",
        description: "يرجى اختيار اللون المطلوب",
        variant: "destructive"
      });
      return;
    }

    if (product.availableSizes?.length > 0 && !formData.selectedSize) {
      toast({
        title: "تنبيه",
        description: "يرجى اختيار المقاس المطلوب",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('${API_BASE_URL}/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: productId,
          affiliateId: affiliateId,
          customerName: formData.name,
          customerPhone: formData.phone,
          wilaya: formData.wilaya,
          commune: formData.commune,
          address: formData.address,
          quantity: quantity,
          totalAmount: (product.price * quantity) + currentShippingPrice,
          commissionAmount: product.commission * quantity,
          shippingFee: currentShippingPrice,
          stopDesk: formData.deliveryType === "office" ? 1 : 0,
          color: formData.selectedColor,
          size: formData.selectedSize
        })

      });

      if (!response.ok) throw new Error('Order submission failed');

      setOrderSuccess(true);
      
      // Fire pixels
      const conversionValue = product.price * quantity;
      if (pixels?.facebook && typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Purchase", { value: conversionValue, currency: "DZD" });
      }
      if (pixels?.tiktok && typeof window !== "undefined" && (window as any).ttq) {
        (window as any).ttq.track("CompletePayment", { 
          contents: [{ content_id: product.id, content_name: product.name, price: conversionValue, quantity: quantity }], 
          value: conversionValue, 
          currency: "DZD" 
        });
      }

      toast({
        title: "تم إرسال الطلب بنجاح! ✅",
        description: "سنتصل بك قريباً لتأكيد الطلب"
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إرسال الطلب. يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRate = shippingRates.find(r => r.code === formData.wilaya || r.wilaya === formData.wilaya);
  const currentShippingPrice = currentRate 
    ? (formData.deliveryType === "home" ? currentRate.homePrice : currentRate.officePrice)
    : 0;

  const totalPrice = (product.price * quantity) + currentShippingPrice;
  const savings = (product.originalPrice - product.price) * quantity;

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card rounded-3xl p-12 shadow-xl text-center max-w-md mx-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-12 h-12 text-secondary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-4">تم استلام طلبك!</h1>
          <p className="text-muted-foreground mb-6">
            شكراً لك، سنتصل بك خلال 24 ساعة لتأكيد الطلب والتوصيل
          </p>
          <div className="bg-muted rounded-xl p-4 mb-6">
            <p className="font-semibold">{product.name}</p>
            <p className="text-secondary font-bold text-xl">{totalPrice.toLocaleString()} دج</p>
          </div>
          <Link to={(isAdmin || isAffiliate) ? "/products" : "/"}>
            <Button variant="outline" className="w-full">
              {(isAdmin || isAffiliate) ? "العودة للمنتجات" : "العودة للرئيسية"}
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link to={(isAdmin || isAffiliate) ? "/products" : "/"} className="flex items-center gap-2 text-primary hover:text-secondary transition-colors">
            <ArrowRight className="w-5 h-5" />
            <span className="font-semibold">{(isAdmin || isAffiliate) ? "العودة للمنتجات" : "العودة للرئيسية"}</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted">
              <img
                src={(product.images?.length > 0 ? product.images[selectedImage] : product.image) || '/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-full font-bold">
                خصم {Math.round((1 - product.price / product.originalPrice) * 100)}%
              </div>
            </div>
            
            {(product.images?.length || 0) > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? "border-secondary" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {(product.features || []).map((feature: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 bg-muted rounded-xl p-3">
                  <Check className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Product Info & Order Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <span className="text-secondary font-medium">{product.category}</span>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mt-2">
                {product.name}
              </h1>
              <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-secondary">
                  {product.price.toLocaleString()} دج
                </span>
                <span className="text-xl text-muted-foreground line-through">
                  {product.originalPrice.toLocaleString()} دج
                </span>
              </div>
              <p className="text-accent font-semibold mt-2">
                وفّر {(product.originalPrice - product.price).toLocaleString()} دج
              </p>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-sm">
                <Truck className="w-8 h-8 text-secondary" />
                <div>
                  <p className="font-semibold text-sm">توصيل سريع</p>
                  <p className="text-xs text-muted-foreground">لكل الولايات</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-sm">
                <Shield className="w-8 h-8 text-secondary" />
                <div>
                  <p className="font-semibold text-sm">ضمان الجودة</p>
                  <p className="text-xs text-muted-foreground">منتجات أصلية</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-sm">
                <Clock className="w-8 h-8 text-secondary" />
                <div>
                  <p className="font-semibold text-sm">توصيل سريع</p>
                  <p className="text-xs text-muted-foreground">3-5 أيام</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-sm">
                <Phone className="w-8 h-8 text-secondary" />
                <div>
                  <p className="font-semibold text-sm">دعم متواصل</p>
                  <p className="text-xs text-muted-foreground">24/7</p>
                </div>
              </div>
            </div>

            {/* Order Form */}
            <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-lg space-y-5">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-secondary" />
                اطلب الآن
              </h2>

              <div className="space-y-4">
                {product.availableColors && product.availableColors.length > 0 && (
                  <div className="space-y-2">
                    <Label className="font-bold">اختر اللون *</Label>
                    <div className="flex flex-wrap gap-2">
                      {product.availableColors.map((color: string) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, selectedColor: color })}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                            formData.selectedColor === color 
                              ? "border-primary bg-primary/5 text-primary" 
                              : "border-muted bg-muted/30 text-muted-foreground hover:border-muted-foreground/30"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.availableSizes && product.availableSizes.length > 0 && (
                  <div className="space-y-2">
                    <Label className="font-bold">اختر المقاس *</Label>
                    <div className="flex flex-wrap gap-2">
                      {product.availableSizes.map((size: string) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFormData({ ...formData, selectedSize: size })}
                          className={`min-w-[50px] h-10 rounded-xl text-sm font-bold border-2 transition-all ${
                            formData.selectedSize === size 
                              ? "border-secondary bg-secondary/5 text-secondary" 
                              : "border-muted bg-muted/30 text-muted-foreground hover:border-muted-foreground/30"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>

                  <Label htmlFor="name">الاسم الكامل *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="أدخل اسمك الكامل"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="07XXXXXXXX"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>الولاية *</Label>
                  <Select
                    value={formData.wilaya}
                    onValueChange={(value) => setFormData({ ...formData, wilaya: value })}
                  >
                    <SelectTrigger className="mt-1.5 h-11 rounded-xl">
                      <SelectValue placeholder="اختر الولاية" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {shippingRates.length > 0 ? shippingRates.map((rate) => (
                        <SelectItem key={rate.code} value={rate.code}>
                          {rate.code} - {rate.wilaya}
                        </SelectItem>
                      )) : (
                        <SelectItem value="loading" disabled>جاري تحميل الولايات...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="commune">البلدية *</Label>
                  <Select
                    value={formData.commune || ""}
                    onValueChange={(value) => setFormData({ ...formData, commune: value })}
                    disabled={!formData.wilaya || loadingCommunes}
                  >
                    <SelectTrigger className="mt-1.5 h-11 rounded-xl">
                        <SelectValue placeholder={loadingCommunes ? "جاري التحميل..." : "اختر البلدية"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {communes && communes.length > 0 ? (
                        communes.map((c: any) => (
                          <SelectItem key={c.nom || c.commune_id} value={c.nom || c.commune_name}>
                            {c.nom || c.commune_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          {loadingCommunes ? "جاري التحميل..." : "لا توجد بلديات"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="address">العنوان بالتفصيل *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="البلدية، الحي، الشارع..."
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>نوع التوصيل</Label>
                  <div className="flex bg-muted p-1 rounded-xl h-12 mt-1.5">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, deliveryType: "home" })}
                      className={`flex-1 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${formData.deliveryType === "home" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      للمنزل
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, deliveryType: "office" })}
                      className={`flex-1 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${formData.deliveryType === "office" ? "bg-background text-secondary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      للمكتب
                    </button>
                  </div>
                </div>

                <div>
                  <Label>الكمية</Label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center text-lg font-bold">{quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-muted rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span>السعر</span>
                  <span>{totalPrice.toLocaleString()} دج</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>التوفير</span>
                  <span>-{savings.toLocaleString()} دج</span>
                </div>
                <div className="flex justify-between">
                  <span>التوصيل</span>
                  <span className={currentShippingPrice === 0 ? "text-secondary" : "font-bold"}>
                    {currentShippingPrice === 0 ? "اختر الولاية" : `${currentShippingPrice.toLocaleString()} دج`}
                  </span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
                  <span>المجموع</span>
                  <span className="text-secondary">{totalPrice.toLocaleString()} دج</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="xl"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block"
                    />
                    جاري الإرسال...
                  </span>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    تأكيد الطلب - {totalPrice.toLocaleString()} دج
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                🔒 الدفع عند الاستلام - لا تحتاج لبطاقة بنكية
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
