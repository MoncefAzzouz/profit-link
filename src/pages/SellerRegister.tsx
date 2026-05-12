import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  Store, Mail, Lock, User, Phone, MapPin, ArrowRight, Eye, EyeOff, 
  Package, TrendingUp, Shield, CheckCircle2, Truck, BarChart3,
  Check, Sparkles, ChevronLeft, ChevronRight, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const wilayasList = [
  "01 Adrar - أدرار", "02 Chlef - الشلف", "03 Laghouat - الأغواط", "04 Oum El Bouaghi - أم البواقي",
  "05 Batna - باتنة", "06 Béjaïa - بجاية", "07 Biskra - بسكرة", "08 Bechar - بشار",
  "09 Blida - البليدة", "10 Bouira - البويرة", "11 Tamanrasset - تمنراست", "12 Téبسة - Tébessa",
  "13 Tlemcen - تلمسان", "14 Tiaret - تيارت", "15 Tizi Ouzou - تيزي وزو", "16 Alger - الجزائر",
  "17 Djelfa - الجلفة", "18 Jijel - جيجل", "19 Sétif - سطيف", "20 Saïda - سعيدة",
  "21 Skikda - سكيكدة", "22 Sidi Bel Abbès - سيدي بلعباس", "23 Annaba - عنابة", "24 Guelma - قالمة",
  "25 Constantine - قسنطينة", "26 Médéa - المدية", "27 Mostaganem - مستغانم", "28 MSila - مسيلة",
  "29 Mascara - معسكر", "30 Ouargla - ورقلة", "31 Oran - وهران", "32 El Bayadh - البيض",
  "33 Illizi - إليزي", "34 Bordj Bou Arreridj - برج بوعريريج", "35 Boumerdès - بومرداس",
  "36 El Tarf - الطارف", "37 Tindouf - تندوف", "38 Tissemsilt - تيسمسيلت", "39 Eloued - الوادي",
  "40 Khenchela - خنشلة", "41 Souk Ahras - سوق أهراس", "42 Tipaza - تيبازة", "43 Mila - ميلة",
  "44 Aïn Defla - عين الدفلى", "45 Naâma - النعامة", "46 Aïn Témouchent - عين تموشنت",
  "47 Ghardaïa - غرداية", "48 Relizane - غليزان", "49 Timimoun - تيميمون",
  "50 Bordj Baji Mokhtar - برج باجي مختار", "51 Ouled Djellal - أولاد جلال",
  "52 Béni Abbès - بني عباس", "53 Aïn Salah - عين صالح", "54 In Guezzam - عين قزام",
  "55 Touggourt - تقرت", "56 Djanet - جانت", "57 El MGhair - المغير", "58 El Menia - المنيعة"
];

const steps = [
  { id: 1, title: "المعلومات الشخصية", sub: "ابدأ بإعداد هويتك الشخصية" },
  { id: 2, title: "معلومات النشاط", sub: "أخبرنا المزيد عن متجرك" },
  { id: 3, title: "التأكيد والإنهاء", sub: "راجع بياناتك قبل الإرسال" }
];

const SellerRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    wilaya: "",
    category: "",
    description: "",
    website: ""
  });

  const update = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 2000));
    
    localStorage.setItem("seller_user", JSON.stringify({
      id: "seller-" + Date.now(),
      ...formData,
      role: "seller"
    }));
    
    setIsLoading(false);
    toast({
      title: "تم إنشاء حسابك بنجاح! 🎉",
      description: "سيتم مراجعة طلبك وتفعيل حسابك من قبل فريقنا قريباً."
    });
    navigate("/seller-dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background font-cairo" dir="rtl">
      {/* Decorative Sidebar */}
      <div className="lg:w-[450px] bg-primary relative overflow-hidden hidden lg:flex flex-col p-12 text-white">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_top_right,var(--secondary),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_bottom_left,var(--accent),transparent_50%)]" />
        
        <div className="relative z-10 flex flex-col h-full">
          <Link to="/" className="flex items-center gap-2 mb-16 group">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-2xl font-black">Easy <span className="text-secondary">Profit</span></span>
          </Link>

          <div className="flex-1">
            <h1 className="text-4xl font-extrabold mb-6 leading-tight">وسّع نطاق مبيعاتك مع آلاف المسوّقين</h1>
            <p className="text-white/70 text-lg mb-12">انضم إلى أكبر منصة في الجزائر تربط المموّدين بالمسوّقين المحترفين.</p>

            <div className="space-y-8">
              {[
                { icon: Package, title: "إدارة المخزون", desc: "نظام متكامل لتتبع سلعك وطلباتك" },
                { icon: TrendingUp, title: "نمو سريع", desc: "ضاعف مبيعاتك من خلال قوة التسويق بالعمولة" },
                { icon: Shield, title: "حماية وضمان", desc: "دفعات مؤمنة ونظام مراجعة دقيق للطلبات" }
              ].map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.5 }}
                  key={i} 
                  className="flex gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
                    <item.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-white/50">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[2rem] bg-white/5 backdrop-blur-lg border border-white/10 mt-auto">
            <p className="text-sm italic text-white/70 leading-relaxed">
              "لقد تضاعفت مبيعات متجري 5 مرات خلال الشهر الأول من انضمامي لـ Easy Profit. المنصة غيرت مجرى نشاطي بالكامل."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 rounded-full bg-secondary/30 border border-secondary/50 overflow-hidden shadow-lg">
                <img src="https://i.pravatar.cc/150?u=seller" alt="User" />
              </div>
              <div>
                <p className="text-sm font-bold">محمد بلقاسم</p>
                <p className="text-[10px] text-white/40">بائع نشط منذ 2023</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Area */}
      <div className="flex-1 flex flex-col">
        {/* Header (Mobile Logo + Link) */}
        <div className="lg:hidden p-6 flex justify-between items-center bg-card border-b border-border">
          <Link to="/" className="text-xl font-black">Easy <span className="text-secondary">Profit</span></Link>
          <Link to="/" className="text-sm font-bold text-primary flex items-center gap-1">
            <ArrowRight className="w-4 h-4" /> العودة للرئيسية
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto custom-scrollbar">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[500px]"
          >
            <div className="hidden lg:flex justify-end mb-12">
              <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all font-bold group">
                العودة للرئيسية <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mb-10 text-center lg:text-right">
              <h2 className="text-3xl font-black text-foreground mb-3">حساب بائع جديد</h2>
              <p className="text-muted-foreground font-medium">خطوات بسيطة وتبدأ رحلتك معنا.</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-4 mb-12">
              {steps.map((s, i) => (
                <div key={i} className="flex-1 flex flex-col gap-2">
                  <div className="h-2 rounded-full relative bg-muted overflow-hidden">
                    {i <= step && (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        className={`absolute inset-0 ${i < step ? "bg-secondary" : "bg-primary"}`} 
                      />
                    )}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${i <= step ? "text-primary" : "text-muted-foreground/60"}`}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div 
                    key="step0" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-sm">الاسم الكامل</Label>
                        <div className="relative group">
                          <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            value={formData.name} 
                            onChange={e => update("name", e.target.value)} 
                            placeholder="كتب اسمك الثلاثي" 
                            className="h-14 pr-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20" 
                            required 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold text-sm">البريد الإلكتروني</Label>
                        <div className="relative group">
                          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            type="email" 
                            value={formData.email} 
                            onChange={e => update("email", e.target.value)} 
                            placeholder="name@company.com" 
                            className="h-14 pr-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-right" 
                            required 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold text-sm">رقم الهاتف</Label>
                        <div className="relative group">
                          <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            type="tel" 
                            value={formData.phone} 
                            onChange={e => update("phone", e.target.value)} 
                            placeholder="07XXXXXXXX" 
                            className="h-14 pr-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-mono text-right" 
                            required 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold text-sm">كلمة المرور</Label>
                        <div className="relative group">
                          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            value={formData.password} 
                            onChange={e => update("password", e.target.value)} 
                            placeholder="••••••••" 
                            className="h-14 pr-12 pl-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-right" 
                            required 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div 
                    key="step1" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-sm">اسم النشاط التجاري</Label>
                        <div className="relative group">
                          <Store className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            value={formData.storeName} 
                            onChange={e => update("storeName", e.target.value)} 
                            placeholder="اسم متجرك أو شركتك" 
                            className="h-14 pr-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20" 
                            required 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold text-sm">الولاية</Label>
                        <Select value={formData.wilaya} onValueChange={v => update("wilaya", v)}>
                          <SelectTrigger className="h-14 pr-12 rounded-2xl bg-muted/30 border-none relative text-right">
                            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <SelectValue placeholder="اختر ولاية الانطلاق" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 rounded-2xl" dir="rtl">
                            {wilayasList.map(w => (
                              <SelectItem key={w} value={w} className="text-right flex justify-end">{w}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold text-sm">فئة المنتجات الرئيسية</Label>
                        <div className="relative group">
                          <Package className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            value={formData.category} 
                            onChange={e => update("category", e.target.value)} 
                            placeholder="إلكترونيات، مستحضرات تجميل..." 
                            className="h-14 pr-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20" 
                            required 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold text-sm">وصف النشاط</Label>
                        <Textarea 
                          value={formData.description} 
                          onChange={e => update("description", e.target.value)} 
                          placeholder="بإيجاز، ماذا تبيع؟ وكيف تتعامل مع التوصيل؟" 
                          className="min-h-[120px] rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 p-4 text-right" 
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div className="bg-muted/30 rounded-3xl p-8 border border-border/50">
                      <h4 className="font-black text-xl mb-6 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-secondary" /> مراجعة البيانات
                      </h4>
                      <div className="space-y-6">
                        {[
                          { label: "المسؤول", value: formData.name },
                          { label: "البريد", value: formData.email },
                          { label: "المتجر", value: formData.storeName },
                          { label: "الموقع", value: formData.wilaya }
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                            <span className="text-muted-foreground font-bold text-xs uppercase tracking-wider">{item.label}</span>
                            <span className="text-foreground font-black text-sm">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/20 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-secondary" />
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                        بمجرد الضغط على إنشاء الحساب، يوافق نشاطك على <span className="text-secondary underline underline-offset-4 cursor-pointer">سياسة التعامل مع المورّدين</span>.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row gap-4 pt-10">
                {step > 0 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg" 
                    onClick={() => setStep(step - 1)} 
                    className="flex-1 rounded-2xl border-2 h-16 order-2 sm:order-1"
                  >
                    السابق <ChevronRight className="w-5 h-5 mr-2" />
                  </Button>
                )}
                <Button 
                  type="submit" 
                  variant="hero" 
                  className="flex-[2] rounded-2xl h-16 text-lg shadow-xl shadow-primary/20 order-1 sm:order-2" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <>
                      {step < 2 && <ChevronLeft className="w-5 h-5 ml-2" />}
                      {step < 2 ? "الخطوة التالية" : "إرسال طلب الانضمام"}
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-12 pt-8 border-t border-border/60 text-center">
              <p className="text-muted-foreground font-medium">
                لديك حساب بالفعل؟ <Link to="/auth" className="text-primary font-black hover:underline underline-offset-4">تسجيل الدخول</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SellerRegister;
