import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Store, TrendingUp, Shield, Users, ArrowLeft, Package, BarChart3, Truck } from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "آلاف المسوّقين",
    description: "شبكة واسعة من المسوّقين النشطين جاهزين لترويج منتجاتك"
  },
  {
    icon: TrendingUp,
    title: "زيادة المبيعات",
    description: "ضاعف مبيعاتك بدون تكلفة إعلانات — ادفع فقط على النتائج"
  },
  {
    icon: Truck,
    title: "توصيل متكامل",
    description: "نتكفل بالتوصيل لجميع ولايات الجزائر بأسعار تنافسية"
  },
  {
    icon: BarChart3,
    title: "لوحة تحكم متقدمة",
    description: "تابع مبيعاتك وإحصائياتك لحظة بلحظة"
  }
];

const JoinAsSeller = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Store className="w-4 h-4" />
              للبائعين وأصحاب المنتجات
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              عندك منتج؟
              <br />
              <span className="bg-gradient-to-l from-secondary to-emerald-400 bg-clip-text text-transparent">
                خلّي المسوّقين يبيعوا لك!
              </span>
            </h2>

            <p className="text-muted-foreground text-lg mb-8 max-w-lg">
              أضف منتجاتك على المنصة وخلّي آلاف المسوّقين يروّجوها لك.
              ادفع عمولة فقط على كل عملية بيع ناجحة — بدون مخاطرة.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link to="/seller-register">
                <Button variant="hero" size="xl" className="group w-full sm:w-auto">
                  سجّل كبائع الآن
                  <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                </Button>
              </Link>
              <Link to="/seller-register">
                <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
                  تعرف أكثر
                </Button>
              </Link>
            </div>

            {/* Mini Stats */}
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-bold text-foreground">+200</p>
                <p className="text-sm text-muted-foreground">بائع نشط</p>
              </div>
              <div className="w-px bg-border" />
              <div>
                <p className="text-2xl font-bold text-foreground">+15,000</p>
                <p className="text-sm text-muted-foreground">طلبية شهريًا</p>
              </div>
              <div className="w-px bg-border" />
              <div>
                <p className="text-2xl font-bold text-foreground">58</p>
                <p className="text-sm text-muted-foreground">ولاية مغطاة</p>
              </div>
            </div>
          </motion.div>

          {/* Right - Benefits Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default JoinAsSeller;
