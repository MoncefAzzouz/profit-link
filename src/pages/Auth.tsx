import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, Sparkles,
  MapPin, Store, CreditCard, ChevronLeft, ChevronRight, CheckCircle2, Shield, ListChecks, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from '@/config/api';
import { sellerQuiz, shuffle, QuizAnswer } from "@/data/sellerQuiz";


const wilayas = [
  "01 Adrar - أدرار", "02 Chlef - الشلف", "03 Laghouat - الأغواط", "04 Oum El Bouaghi - أم البواقي",
  "05 Batna - باتنة", "06 Béjaïa - بجاية", "07 Biskra - بسكرة", "08 Bechar - بشار",
  "09 Blida - البليدة", "10 Bouira - البويرة", "11 Tamanrasset - تمنراست", "12 Téبسة - Tébessa",
  "13 Tlemcen - تلمسان", "14 Tiaret - تيارت", "15 Tizi Ouzou - تيزي وزو", "16 Alger - الجزائر",
  "17 Djelfa - الجلفة", "18 Jijel - جيجل", "19 Sétif - سطيف", "20 Saïda - سعيدة",
  "21 Skikda - سكيكدة", "22 Sidi Bel Abbès - سيدي بلعباس", "23 Annaba - عنابة", "24 Guelma - قالمة",
  "25 Constantine - قسنطينة", "26 Médéa - المدية", "27 Mostaganem - مستغانم", "28 MSila - مسيلة",
  "29 Mascara - معسكر", "30 Ouargla - ورقلة", "31 Oran - وهران", "32 El Bayadh - البيض",
  "33 Illizi - إليزي", "34 Bordj Bou Arreridj - برج بوعريريج", "35 Boumerدès - بومرداس",
  "36 El Tarf - الطارف", "37 Tindouf - تندوف", "38 Tissemsilt - تيسمسيلت", "39 Eloued - الوادي",
  "40 Khenchela - خنشلة", "41 Souk Ahras - سوق أهراس", "42 Tipaza - تيبازة", "43 Mila - ميلة",
  "44 Aïn Defla - عين الدفلى", "45 Naâma - النعامة", "46 Aïn Témouchent - عين تموشنت",
  "47 Ghardaïa - غرداية", "48 Relizane - غليزان", "49 Timimoun - تيميمون",
  "50 Bordj Baji Mokhtar - برج باجي مختار", "51 Ouled Djellal - أولاد جلال",
  "52 Béni Abbès - بني عباس", "53 Aïn Salah - عين صالح", "54 In Guezzam - عين قزام",
  "55 Touggourt - تقرت", "56 Djanet - جانت", "57 El MGhair - المغير", "58 El Menia - المنيعة"
];

const registerSteps = [
  { id: 1, title: "الهوية", sub: "بيانات حسابك الأساسية" },
  { id: 2, title: "الملف الشخصي", sub: "معلومات التواصل والنشاط" },
  { id: 3, title: "البيانات المالية", sub: "طريقة استلام أرباحك" },
  { id: 4, title: "أسئلة التأهيل", sub: "أجب عن الأسئلة التالية" }
];

const LAST_STEP = registerSteps.length - 1; // quiz is the final step

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // pending-review screen after sign-up
  // selected option label per question id
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  // Shuffle each question's options once per mount so the correct answer isn't always in the same spot.
  const shuffledQuiz = useMemo(() => sellerQuiz.map(q => ({ ...q, options: shuffle(q.options) })), []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("affiliate_user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "ADMIN" || user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } catch (e) {
        console.error("Error parsing user data in Auth", e);
      }
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    wilaya: "",
    storeName: "",
    ccp: ""
  });

  const update = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Advance through registration steps until the final (quiz) step.
    if (!isLogin && step < LAST_STEP) {
      if (step === 0 && formData.password !== formData.confirmPassword) {
        toast({ title: "خطأ", description: "كلمتا المرور غير متطابقتين", variant: "destructive" });
        return;
      }
      setStep(step + 1);
      return;
    }

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        toast({ title: "خطأ", description: "كلمتا المرور غير متطابقتين", variant: "destructive" });
        return;
      }
      // Require every qualification question to be answered.
      if (Object.keys(quizAnswers).length < sellerQuiz.length) {
        toast({ title: "أكمل الأسئلة", description: "يرجى الإجابة عن جميع أسئلة التأهيل قبل الإرسال.", variant: "destructive" });
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const url = `${API_BASE_URL}/auth${endpoint}`;

      const questionnaire: QuizAnswer[] = shuffledQuiz.map(q => {
        const answer = quizAnswers[q.id];
        const opt = q.options.find(o => o.label === answer);
        return { q: q.question, answer: answer || "", level: opt?.level || "bad" };
      });

      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            email: formData.email,
            password: formData.password,
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            wilaya: formData.wilaya,
            ccp: formData.ccp,
            storeName: formData.storeName,
            questionnaire
          };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ غير متوقع");
      }

      // Registration no longer logs the user in — the account is pending review.
      if (!isLogin) {
        setSubmitted(true);
        return;
      }

      // Save token and user info (login only)
      localStorage.setItem("token", data.token);
      localStorage.setItem("affiliate_user", JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        tier: data.user.tier,
        wilaya: data.user.wilaya || formData.wilaya,
        storeName: data.user.storeName || formData.storeName,
        ccp: data.user.ccp || formData.ccp
      }));

      toast({ title: "مرحباً بك مجدداً! 👋", description: "تم تسجيل الدخول بنجاح" });
      if (data.user.role === "ADMIN" || data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (error: any) {
      toast({
        title: isLogin ? "فشل الدخول" : "تعذّر إرسال الطلب",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-cairo p-6" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-[520px] bg-card border border-border/60 rounded-[2rem] p-8 sm:p-12 text-center shadow-2xl"
        >
          <div className="w-20 h-20 rounded-3xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-secondary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-4">تم استلام طلبك بنجاح! 🎉</h2>
          <p className="text-muted-foreground font-bold leading-relaxed mb-8">
            ستقوم الإدارة بمراجعة طلب انضمامك وإجاباتك، وسيتم الرد عليك قريباً.
            بمجرد قبول طلبك ستتمكن من تسجيل الدخول والبدء.
          </p>
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 flex items-center gap-3 mb-8 text-right">
            <Shield className="w-5 h-5 text-primary shrink-0" />
            <p className="text-xs font-bold opacity-70 leading-relaxed">
              لا حاجة لإعادة التسجيل. سيتم تفعيل حسابك تلقائياً بعد الموافقة.
            </p>
          </div>
          <Button
            variant="hero"
            size="lg"
            className="w-full rounded-2xl h-14 font-black"
            onClick={() => { setSubmitted(false); setIsLogin(true); setStep(0); }}
          >
            العودة لتسجيل الدخول
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background font-cairo" dir="rtl">
      {/* Decorative Sidebar */}
      <div className="lg:w-[450px] bg-primary relative overflow-hidden hidden lg:flex flex-col p-12 text-white order-1 lg:order-2">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_top_right,var(--secondary),transparent_50%)]" />
          <div className="absolute bottom-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_bottom_left,var(--accent),transparent_50%)]" />
        </div>
        
        <div className="relative z-10 flex flex-col h-full">
          <Link to="/" className="flex items-center gap-2 mb-16 group">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-2xl font-black">Easy <span className="text-secondary">Profit</span></span>
          </Link>

          <div className="flex-1">
            <h1 className="text-4xl font-extrabold mb-6 leading-tight">
              {isLogin ? "مرحباً بك في منصة الربح الأولى" : "انضم لآلاف المسوّقين الناجحين في الجزائر"}
            </h1>
            <p className="text-white/70 text-lg mb-12">
              {isLogin 
                ? "سجّل دخولك لمتابعة أرباحك وإدارة طلبياتك من هاتفك." 
                : "لا حاجة لرأس مال، لا حاجة لمنتجات خاصة. نحن نوفّر لك كل شيء."}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                <p className="text-3xl font-black text-secondary">+5000</p>
                <p className="text-xs text-white/50 uppercase tracking-widest mt-1">مسوّق نشط</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                <p className="text-3xl font-black text-accent">50%</p>
                <p className="text-xs text-white/50 uppercase tracking-widest mt-1">نسبة العمولة</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                <p className="text-3xl font-black text-secondary">91%</p>
                <p className="text-xs text-white/50 uppercase tracking-widest mt-1">نسبة التأكيد</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                <p className="text-3xl font-black text-accent">0 دج</p>
                <p className="text-xs text-white/50 uppercase tracking-widest mt-1">رأس مال</p>
              </div>
            </div>
          </div>

          <div className="mt-auto p-8 rounded-[2rem] bg-indigo-500/10 border border-white/10 backdrop-blur-md">
            <p className="text-sm font-medium leading-relaxed opacity-80 italic">
              "بفضل Easy Profit استطعت تأمين مدخول شهري إضافي يتجاوز 8 ملايين سنتيم شهرياً وأنا في المنزل."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-secondary/30 border border-secondary/50" />
              <p className="text-xs font-bold font-mono tracking-tighter">@sarah_marketer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Area */}
      <div className="flex-1 flex flex-col order-2 lg:order-1">
        {/* Header Mobile */}
        <div className="lg:hidden p-6 flex justify-between items-center bg-card border-b border-border">
          <Link to="/" className="text-xl font-black">Easy <span className="text-secondary">Profit</span></Link>
          <Link to="/" className="text-sm font-bold text-primary flex items-center gap-1">
            <ArrowRight className="w-4 h-4" /> العودة
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto custom-scrollbar">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[480px]"
          >
            <div className="hidden lg:flex justify-start mb-12">
              <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all font-black group">
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" /> العودة للرئيسية
              </Link>
            </div>

            <div className="mb-10">
              <h2 className="text-4xl font-black text-foreground mb-4">
                {isLogin ? "تسجيل الدخول" : "إنشاء حساب مسوّق"}
              </h2>
              <p className="text-muted-foreground font-bold text-lg">
                {isLogin ? "سجّل دخولك لتبقى في قلب الحدث." : "حوّل وقتك على هاتفك إلى أرباح حقيقية."}
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="p-1 bg-muted rounded-2xl flex mb-12 relative overflow-hidden">
              <motion.div 
                className="absolute inset-y-1 bg-card rounded-xl shadow-lg"
                initial={false}
                animate={{ 
                  x: isLogin ? 0 : "100%", 
                  width: "50%" 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ right: 0 }}
              />
              <button
                onClick={() => { setIsLogin(true); setStep(0); }}
                className={`flex-1 py-3 text-sm font-black transition-all relative z-10 ${isLogin ? "text-primary" : "text-muted-foreground"}`}
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => { setIsLogin(false); setStep(0); }}
                className={`flex-1 py-3 text-sm font-black transition-all relative z-10 ${!isLogin ? "text-primary" : "text-muted-foreground"}`}
              >
                حساب جديد
              </button>
            </div>

            {/* Registration Stepper */}
            {!isLogin && (
              <div className="flex items-center gap-4 mb-12">
                {registerSteps.map((s, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-2">
                    <div className="h-1.5 rounded-full relative bg-muted overflow-hidden">
                      {i <= step && (
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          className={`absolute inset-0 ${i < step ? "bg-secondary" : "bg-primary"}`} 
                        />
                      )}
                    </div>
                    <span className={`text-[9px] font-black uppercase text-center tracking-tighter ${i <= step ? "text-primary" : "text-muted-foreground/50"}`}>
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-black text-sm pr-1">البريد الإلكتروني</Label>
                      <div className="relative group">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input type="email" value={formData.email} onChange={e => update("email", e.target.value)} placeholder="name@email.com" className="h-14 pr-12 rounded-2xl bg-muted/40 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-right font-medium" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-sm pr-1">كلمة المرور</Label>
                      <div className="relative group">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => update("password", e.target.value)} placeholder="••••••••" className="h-14 pr-12 pl-12 rounded-2xl bg-muted/40 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-right font-medium" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button type="button" className="text-sm font-black text-primary hover:underline">نسيت كلمة المرور؟</button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key={`step-${step}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    {step === 0 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="font-black text-sm">الاسم الأول</Label>
                            <Input value={formData.firstName} onChange={e => update("firstName", e.target.value)} placeholder="أدخل اسمك" className="h-14 rounded-2xl bg-muted/40 border-none px-6" required />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-black text-sm">إسم العائلة</Label>
                            <Input value={formData.lastName} onChange={e => update("lastName", e.target.value)} placeholder="أدخل اللقب" className="h-14 rounded-2xl bg-muted/40 border-none px-6" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-black text-sm">البريد الإلكتروني</Label>
                          <Input type="email" value={formData.email} onChange={e => update("email", e.target.value)} placeholder="أدخل بريدك" className="h-14 rounded-2xl bg-muted/40 border-none px-6 text-right" required />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-black text-sm">كلمة المرور</Label>
                          <Input type="password" value={formData.password} onChange={e => update("password", e.target.value)} placeholder="اختر كلمة سر قوية" className="h-14 rounded-2xl bg-muted/40 border-none px-6 text-right" required />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-black text-sm">تأكيد كلمة المرور</Label>
                          <Input type="password" value={formData.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} placeholder="أعد كتابة كلمة السر" className="h-14 rounded-2xl bg-muted/40 border-none px-6 text-right" required />
                        </div>
                      </div>
                    )}

                    {step === 1 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="font-black text-sm">رقم الهاتف</Label>
                          <div className="relative group">
                            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input type="tel" value={formData.phone} onChange={e => update("phone", e.target.value)} placeholder="07XXXXXXXX" className="h-14 pr-12 rounded-2xl bg-muted/40 border-none text-right font-mono" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-black text-sm">الولاية</Label>
                          <Select value={formData.wilaya} onValueChange={v => update("wilaya", v)}>
                            <SelectTrigger className="h-14 rounded-2xl bg-muted/40 border-none relative pr-12 text-right">
                              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <SelectValue placeholder="اختر ولاية إقامتك" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 rounded-2xl" dir="rtl">
                              {wilayas.map(w => (
                                <SelectItem key={w} value={w} className="text-right">{w}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-black text-sm">اسم المتجر / النشاط (اختياري)</Label>
                          <div className="relative group">
                            <Store className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input value={formData.storeName} onChange={e => update("storeName", e.target.value)} placeholder="مثال: متجر السعادة" className="h-14 pr-12 rounded-2xl bg-muted/40 border-none text-right" />
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-6">
                        <div className="bg-muted/40 rounded-3xl p-8 border border-border/50">
                          <h4 className="font-black text-xl mb-6 flex items-center justify-center gap-2 text-secondary">
                            <CreditCard className="w-6 h-6" /> بيانات الدفع
                          </h4>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="font-black text-sm">رقم حسابك في CCP (اختياري)</Label>
                              <Input value={formData.ccp} onChange={e => update("ccp", e.target.value)} placeholder="XXXXXXXXXX XX" className="h-14 rounded-2xl bg-card border-none px-6 text-center font-mono text-lg" />
                            </div>
                            <div className="pt-4 border-t border-border/50 mt-4 space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-bold">الاسم:</span>
                                <span className="font-black">{formData.firstName} {formData.lastName}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-bold">الولاية:</span>
                                <span className="font-black">{formData.wilaya}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                          <Shield className="w-5 h-5 text-primary mt-0.5" />
                          <p className="text-xs font-bold leading-relaxed opacity-70">بالنقر على إنشاء الحساب، أنت توافق على شروط الاستخدام وسياسة حماية الخصوصية الخاصة بالمسوّقين.</p>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-5">
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/5 border border-secondary/15">
                          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                            <ListChecks className="w-5 h-5 text-secondary" />
                          </div>
                          <p className="text-xs font-bold leading-relaxed opacity-80">
                            أجب بصدق عن الأسئلة التالية. تساعدنا إجاباتك في تقييم طلبك وقبوله.
                          </p>
                        </div>

                        <div className="space-y-6">
                          {shuffledQuiz.map((q, idx) => (
                            <div key={q.id} className="space-y-3">
                              <p className="font-black text-sm leading-relaxed">
                                <span className="text-secondary">{idx + 1}.</span> {q.question}
                              </p>
                              <div className="space-y-2">
                                {q.options.map((opt) => {
                                  const selected = quizAnswers[q.id] === opt.label;
                                  return (
                                    <button
                                      type="button"
                                      key={opt.label}
                                      onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt.label }))}
                                      className={`w-full text-right flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${selected ? "border-primary bg-primary/5" : "border-border/60 bg-muted/30 hover:border-primary/30"}`}
                                    >
                                      <span className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${selected ? "border-primary" : "border-muted-foreground/40"}`}>
                                        {selected && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                      </span>
                                      <span className="text-xs font-bold leading-relaxed flex-1">{opt.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between px-1 text-[11px] font-bold text-muted-foreground">
                          <span>تمت الإجابة عن {Object.keys(quizAnswers).length} من {sellerQuiz.length}</span>
                          <Shield className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                {!isLogin && step > 0 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg" 
                    onClick={() => setStep(step - 1)} 
                    className="flex-1 rounded-2xl h-16 border-2 font-black order-2 sm:order-1"
                  >
                    السابق <ChevronRight className="w-4 h-4 mr-1" />
                  </Button>
                )}
                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="flex-[2] rounded-2xl h-16 font-black text-lg shadow-xl shadow-primary/25 order-1 sm:order-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <>
                      {isLogin ? "تسجيل الدخول" : (step < LAST_STEP ? "الخطوة التالية" : "إنشاء حسابي الآن")}
                      {!isLogin && step < LAST_STEP && <ChevronLeft className="w-4 h-4 ml-1" />}
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground font-bold text-sm">
                تواجه مشكلة؟ <a href="#" className="text-primary hover:underline underline-offset-4">تواصل مع الدعم الفني</a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
