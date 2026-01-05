import { motion } from "framer-motion";
import { Star, Zap, Crown, ArrowUp, CheckCircle2 } from "lucide-react";

const levels = [
  {
    name: "Bronze",
    nameAr: "برونز",
    icon: Star,
    color: "from-amber-600 to-orange-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    commission: "50%",
    requirement: "البداية",
    benefits: ["عمولة 50%", "دعم عبر الواتساب", "منتجات أساسية"],
  },
  {
    name: "Silver",
    nameAr: "فضي",
    icon: Zap,
    color: "from-gray-400 to-slate-500",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    commission: "55%",
    requirement: "30 طلبية",
    benefits: ["عمولة 55%", "دعم أولوية", "منتجات حصرية", "إحصائيات متقدمة"],
  },
  {
    name: "Gold",
    nameAr: "ذهبي",
    icon: Crown,
    color: "from-yellow-400 to-amber-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    commission: "60%",
    requirement: "100 طلبية",
    benefits: ["عمولة 60%", "مدير حساب خاص", "أولوية في المنتجات الجديدة", "مكافآت شهرية"],
    featured: true,
  },
];

const LevelSystem = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-medium text-sm mb-4">
            نظام المستويات
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            ارتقِ وزِد <span className="gradient-text">أرباحك</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            كلما زادت مبيعاتك، زادت امتيازاتك وعمولتك
          </p>
        </motion.div>

        {/* Levels Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {levels.map((level, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${level.featured ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {/* Featured Badge */}
              {level.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold">
                    الأكثر شعبية
                  </span>
                </div>
              )}

              <div className={`relative bg-card rounded-3xl p-6 md:p-8 border-2 ${level.featured ? 'border-yellow-400/50 shadow-lg shadow-yellow-100' : level.borderColor} h-full transition-all duration-300 hover-lift overflow-hidden group`}>
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <level.icon className="w-8 h-8 text-white" />
                </div>

                {/* Level Name */}
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  {level.nameAr}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">{level.name}</p>

                {/* Commission */}
                <div className="mb-6">
                  <span className="text-4xl font-bold gradient-text">{level.commission}</span>
                  <span className="text-muted-foreground mr-1">عمولة</span>
                </div>

                {/* Requirement */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 mb-6">
                  <ArrowUp className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-medium text-foreground">
                    {level.requirement}
                  </span>
                </div>

                {/* Benefits */}
                <ul className="space-y-3">
                  {level.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-muted-foreground text-sm mt-8"
        >
          التفاصيل الكاملة متوفرة داخل لوحة التحكم بعد التسجيل
        </motion.p>
      </div>
    </section>
  );
};

export default LevelSystem;
