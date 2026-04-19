import { motion } from "framer-motion";
import { 
  Truck, 
  Gift, 
  ShieldCheck, 
  MapPin, 
  Wallet, 
  HeadphonesIcon,
  CheckCircle2
} from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "توصيل لكل الولايات",
    description: "نوصّل لـ 58 ولاية في كل أنحاء الجزائر",
  },
  {
    icon: Gift,
    title: "تغليف احترافي",
    description: "كل طلبية تُغلّف بعناية لتصل بأفضل حالة",
  },
  {
    icon: ShieldCheck,
    title: "الملغيات علينا",
    description: "الطلبات الملغاة والمرتجعة ما تأثرش على أرباحك",
  },
  {
    icon: MapPin,
    title: "تتبع الطلبيات",
    description: "تابع كل طلبياتك لحظة بلحظة",
  },
  {
    icon: Wallet,
    title: "دفع أسبوعي",
    description: "أرباحك تتحوّل لحسابك كل نهاية أسبوع",
  },
  {
    icon: HeadphonesIcon,
    title: "دعم فني 24/7",
    description: "فريق الدعم متواجد دائمًا للمساعدة",
  },
];

const WhyUs = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent font-medium text-sm mb-4">
            لماذا نحن؟
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            نحن نتكفل <span className="gradient-text-gold">بكل شيء</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            أنت سوّق فقط، والباقي علينا
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="group relative bg-card rounded-2xl p-6 border border-border hover:border-secondary/30 transition-all duration-300 hover-lift h-full">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-secondary" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Banner */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="relative bg-gradient-to-r from-primary via-navy-800 to-primary rounded-3xl p-8 md:p-12 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            
            <div className="relative z-10 text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                كل ما تحتاجه للنجاح متوفر
              </h3>
              
              <div className="flex flex-wrap justify-center gap-4">
                {["بدون رأس مال", "بدون مخزون", "بدون خبرة سابقة", "أرباح مضمونة"].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyUs;
