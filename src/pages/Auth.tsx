import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, Sparkles, MapPin, Store, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const wilayas = [
  "01 Adrar - أدرار", "02 Chlef - الشلف", "03 Laghouat - الأغواط", "04 Oum El Bouaghi - أم البواقي",
  "05 Batna - باتنة", "06 Béjaïa - بجاية", "07 Biskra - بسكرة", "08 Bechar - بشار",
  "09 Blida - البليدة", "10 Bouira - البويرة", "11 Tamanrasset - تمنراست", "12 Tébessa - تبسة",
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

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        toast({ title: "خطأ", description: "كلمتا المرور غير متطابقتين", variant: "destructive" });
        return;
      }
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.wilaya || !formData.storeName || !formData.ccp) {
        toast({ title: "خطأ", description: "يرجى ملء جميع الحقول", variant: "destructive" });
        return;
      }
    }

    if (!formData.email || !formData.password) {
      toast({ title: "خطأ", description: "يرجى إدخال البريد الإلكتروني وكلمة المرور", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    localStorage.setItem("affiliate_user", JSON.stringify({
      id: "aff-demo-123",
      name: `${formData.firstName} ${formData.lastName}` || "مسوّق تجريبي",
      email: formData.email,
      phone: formData.phone || "0555123456",
      wilaya: formData.wilaya,
      storeName: formData.storeName,
      ccp: formData.ccp
    }));

    setIsLoading(false);
    toast({
      title: isLogin ? "مرحباً بك! 👋" : "تم إنشاء حسابك بنجاح! 🎉",
      description: isLogin ? "تم تسجيل الدخول بنجاح" : "ابدأ رحلتك في الربح الآن"
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowRight className="w-5 h-5" />
            العودة للرئيسية
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {isLogin ? "تسجيل الدخول" : "سجّل كمسوّق"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin ? "أهلاً بك مجدداً! سجّل دخولك للمتابعة" : "انضم إلينا وابدأ رحلتك في الربح"}
            </p>
          </div>

          {/* Toggle */}
          <div className="bg-muted p-1 rounded-xl flex mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                isLogin ? "bg-card shadow-md text-foreground" : "text-muted-foreground"
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                !isLogin ? "bg-card shadow-md text-foreground" : "text-muted-foreground"
              }`}
            >
              حساب جديد
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email - always shown */}
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input id="email" type="email" value={formData.email} onChange={e => update("email", e.target.value)} placeholder="example@email.com" className="pr-12 h-12" required />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={e => update("password", e.target.value)} placeholder="••••••••" className="pr-12 pl-12 h-12" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  {/* Confirm Password */}
                  <div>
                    <Label htmlFor="confirmPassword">أعد كتابة كلمة المرور</Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} placeholder="••••••••" className="pr-12 h-12" />
                    </div>
                  </div>

                  {/* First & Last Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="firstName">الإسم الأول</Label>
                      <div className="relative mt-1.5">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input id="firstName" value={formData.firstName} onChange={e => update("firstName", e.target.value)} placeholder="الإسم الأول" className="pr-12 h-12" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="lastName">إسم العائلة</Label>
                      <div className="relative mt-1.5">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input id="lastName" value={formData.lastName} onChange={e => update("lastName", e.target.value)} placeholder="إسم العائلة" className="pr-12 h-12" />
                      </div>
                    </div>
                  </div>

                  {/* Wilaya */}
                  <div>
                    <Label>الولاية</Label>
                    <div className="relative mt-1.5">
                      <Select value={formData.wilaya} onValueChange={v => update("wilaya", v)}>
                        <SelectTrigger className="h-12 pr-12">
                          <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                          <SelectValue placeholder="إختر الولاية" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {wilayas.map(w => (
                            <SelectItem key={w} value={w}>{w}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone">الهاتف</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input id="phone" type="tel" value={formData.phone} onChange={e => update("phone", e.target.value)} placeholder="07XXXXXXXX" className="pr-12 h-12" />
                    </div>
                  </div>

                  {/* Store Name */}
                  <div>
                    <Label htmlFor="storeName">الإسم التجاري</Label>
                    <div className="relative mt-1.5">
                      <Store className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input id="storeName" value={formData.storeName} onChange={e => update("storeName", e.target.value)} placeholder="اسم نشاطك التجاري" className="pr-12 h-12" />
                    </div>
                  </div>

                  {/* CCP */}
                  <div>
                    <Label htmlFor="ccp">رقم حسابك في CCP</Label>
                    <div className="relative mt-1.5">
                      <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input id="ccp" value={formData.ccp} onChange={e => update("ccp", e.target.value)} placeholder="XXXXXXXXXX XX" className="pr-12 h-12" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isLogin && (
              <div className="text-left">
                <button type="button" className="text-sm text-secondary hover:underline">
                  نسيت كلمة المرور؟
                </button>
              </div>
            )}

            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block" />
                  جاري المعالجة...
                </span>
              ) : isLogin ? "تسجيل الدخول" : "إنشاء الحساب"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            بتسجيلك، أنت توافق على{" "}
            <a href="#" className="text-secondary hover:underline">شروط الاستخدام</a>
            {" "}و{" "}
            <a href="#" className="text-secondary hover:underline">سياسة الخصوصية</a>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary to-navy-800 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-center text-primary-foreground max-w-lg"
        >
          <div className="mb-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-24 h-24 bg-secondary/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-6"
            >
              <Sparkles className="w-12 h-12 text-secondary" />
            </motion.div>
          </div>

          <h2 className="text-4xl font-bold mb-4">ابدأ رحلتك نحو الربح</h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            انضم لآلاف المسوّقين الناجحين واربح حتى 50% من كل عملية بيع
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4">
              <p className="text-3xl font-bold text-secondary">+5000</p>
              <p className="text-sm text-primary-foreground/70">مسوّق نشط</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4">
              <p className="text-3xl font-bold text-accent">50%</p>
              <p className="text-sm text-primary-foreground/70">نسبة العمولة</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4">
              <p className="text-3xl font-bold text-secondary">91%</p>
              <p className="text-sm text-primary-foreground/70">نسبة التأكيد</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4">
              <p className="text-3xl font-bold text-accent">0 دج</p>
              <p className="text-sm text-primary-foreground/70">رأس مال مطلوب</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
