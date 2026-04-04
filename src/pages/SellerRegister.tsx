import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  Store, Mail, Lock, User, Phone, MapPin, ArrowRight, Eye, EyeOff, 
  Package, TrendingUp, Shield, CheckCircle2, Truck, BarChart3 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const steps = ["معلومات شخصية", "معلومات النشاط", "تأكيد"];

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
    if (step < 2) { setStep(step + 1); return; }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    
    localStorage.setItem("seller_user", JSON.stringify({
      id: "seller-" + Date.now(),
      ...formData,
      role: "seller"
    }));
    
    setIsLoading(false);
    toast({
      title: "تم إنشاء حسابك بنجاح! 🎉",
      description: "سيتم مراجعة طلبك وتفعيل حسابك خلال 24 ساعة"
    });
    navigate("/seller-dashboard");
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary to-navy-800 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-center text-primary-foreground max-w-lg"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-24 h-24 bg-accent/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-6"
          >
            <Store className="w-12 h-12 text-accent" />
          </motion.div>

          <h2 className="text-4xl font-bold mb-4">وسّع نشاطك التجاري</h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            أضف منتجاتك وخلّي آلاف المسوّقين يبيعوا لك بدون مخاطرة
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Package, label: "إدارة منتجات سهلة", color: "text-secondary" },
              { icon: TrendingUp, label: "زيادة في المبيعات", color: "text-accent" },
              { icon: Truck, label: "توصيل لكل الولايات", color: "text-secondary" },
              { icon: BarChart3, label: "إحصائيات متقدمة", color: "text-accent" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 flex flex-col items-center gap-2"
              >
                <item.icon className={`w-8 h-8 ${item.color}`} />
                <p className="text-sm text-primary-foreground/80">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowRight className="w-5 h-5" />
            العودة للرئيسية
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">انضم كبائع</h1>
            <p className="text-muted-foreground mt-2">أنشئ حسابك وابدأ ببيع منتجاتك عبر شبكة المسوّقين</p>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i <= step 
                    ? "bg-secondary text-secondary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i <= step ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  {s}
                </span>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 ${i < step ? "bg-secondary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <Label>الاسم الكامل</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input value={formData.name} onChange={e => update("name", e.target.value)} placeholder="أدخل اسمك الكامل" className="pr-12 h-12" required />
                    </div>
                  </div>
                  <div>
                    <Label>البريد الإلكتروني</Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input type="email" value={formData.email} onChange={e => update("email", e.target.value)} placeholder="example@email.com" className="pr-12 h-12" required />
                    </div>
                  </div>
                  <div>
                    <Label>رقم الهاتف</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input type="tel" value={formData.phone} onChange={e => update("phone", e.target.value)} placeholder="07XXXXXXXX" className="pr-12 h-12" required />
                    </div>
                  </div>
                  <div>
                    <Label>كلمة المرور</Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => update("password", e.target.value)} placeholder="••••••••" className="pr-12 pl-12 h-12" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <Label>اسم المتجر / النشاط</Label>
                    <div className="relative mt-1.5">
                      <Store className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input value={formData.storeName} onChange={e => update("storeName", e.target.value)} placeholder="اسم متجرك أو علامتك التجارية" className="pr-12 h-12" required />
                    </div>
                  </div>
                  <div>
                    <Label>الولاية</Label>
                    <div className="relative mt-1.5">
                      <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input value={formData.wilaya} onChange={e => update("wilaya", e.target.value)} placeholder="مثال: الجزائر العاصمة" className="pr-12 h-12" required />
                    </div>
                  </div>
                  <div>
                    <Label>فئة المنتجات</Label>
                    <div className="relative mt-1.5">
                      <Package className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input value={formData.category} onChange={e => update("category", e.target.value)} placeholder="مثال: إلكترونيات، ملابس، مستحضرات..." className="pr-12 h-12" required />
                    </div>
                  </div>
                  <div>
                    <Label>وصف النشاط</Label>
                    <Textarea value={formData.description} onChange={e => update("description", e.target.value)} placeholder="اشرح نشاطك التجاري بإيجاز..." className="min-h-[100px]" />
                  </div>
                  <div>
                    <Label>رابط الموقع أو صفحة فيسبوك (اختياري)</Label>
                    <Input value={formData.website} onChange={e => update("website", e.target.value)} placeholder="https://..." className="h-12" />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold text-foreground text-lg">ملخص التسجيل</h3>
                    {[
                      { label: "الاسم", value: formData.name },
                      { label: "البريد", value: formData.email },
                      { label: "الهاتف", value: formData.phone },
                      { label: "المتجر", value: formData.storeName },
                      { label: "الولاية", value: formData.wilaya },
                      { label: "الفئة", value: formData.category }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <span className="text-muted-foreground text-sm">{item.label}</span>
                        <span className="text-foreground font-medium text-sm">{item.value || "—"}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-secondary/10 rounded-xl p-4 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      سيتم مراجعة طلبك من فريقنا وتفعيل حسابك خلال 24 ساعة. ستتلقى إشعارًا على بريدك الإلكتروني.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              {step > 0 && (
                <Button type="button" variant="outline" size="lg" onClick={() => setStep(step - 1)} className="flex-1">
                  رجوع
                </Button>
              )}
              <Button type="submit" variant="hero" size="xl" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block" />
                    جاري المعالجة...
                  </span>
                ) : step < 2 ? "التالي" : "إنشاء الحساب"}
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            لديك حساب بالفعل؟{" "}
            <Link to="/auth" className="text-secondary hover:underline font-semibold">تسجيل الدخول</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SellerRegister;
