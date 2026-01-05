import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "خطأ",
          description: "كلمتا المرور غير متطابقتين",
          variant: "destructive"
        });
        return;
      }
      if (!formData.name || !formData.phone) {
        toast({
          title: "خطأ",
          description: "يرجى ملء جميع الحقول",
          variant: "destructive"
        });
        return;
      }
    }

    if (!formData.email || !formData.password) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Store demo user in localStorage
    localStorage.setItem("affiliate_user", JSON.stringify({
      id: "aff-demo-123",
      name: formData.name || "مسوّق تجريبي",
      email: formData.email,
      phone: formData.phone || "0555123456"
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
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
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
              {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5"
                >
                  <div>
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="أدخل اسمك الكامل"
                        className="pr-12 h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="07XXXXXXXX"
                        className="pr-12 h-12"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  className="pr-12 h-12"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="pr-12 pl-12 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="pr-12 h-12"
                    />
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

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block"
                  />
                  جاري المعالجة...
                </span>
              ) : isLogin ? (
                "تسجيل الدخول"
              ) : (
                "إنشاء الحساب"
              )}
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
        {/* Background Elements */}
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

          <h2 className="text-4xl font-bold mb-4">
            ابدأ رحلتك نحو الربح
          </h2>
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
