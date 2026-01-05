import { motion } from "framer-motion";
import { Package, Link2, Wallet } from "lucide-react";

const steps = [
  {
    icon: Package,
    number: "01",
    title: "اختر المنتج",
    description: "تصفح مئات المنتجات المتوفرة واختر ما يناسب جمهورك",
    color: "from-secondary to-emerald-400",
  },
  {
    icon: Link2,
    number: "02",
    title: "خذ رابط الإحالة",
    description: "احصل على رابطك الخاص لكل منتج بضغطة زر واحدة",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Wallet,
    number: "03",
    title: "سوّق واربح 50%",
    description: "شارك الرابط واربح عمولة على كل طلبية مؤكدة",
    color: "from-accent to-yellow-400",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

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
            كيف يعمل؟
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            ثلاث خطوات <span className="gradient-text">بسيطة</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            ابدأ رحلتك في التسويق بالعمولة بأسهل الطرق
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative bg-card rounded-3xl p-8 border border-border hover:border-secondary/30 transition-all duration-300 hover-lift h-full">
                {/* Step Number */}
                <div className="absolute -top-4 right-6 px-3 py-1 rounded-lg bg-gradient-to-r from-primary to-navy-700 text-white text-sm font-bold">
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Decorative Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -left-4 w-8 h-0.5 bg-gradient-to-l from-border to-transparent" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Video Section Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-navy-900 to-primary p-1">
            <div className="rounded-3xl bg-navy-900/50 backdrop-blur-sm aspect-video flex items-center justify-center relative overflow-hidden">
              {/* Play Button */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
              <button className="relative z-10 w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group hover:bg-white/30 transition-all duration-300 hover:scale-110">
                <div className="w-0 h-0 border-t-8 border-b-8 border-r-0 border-l-12 border-transparent border-l-white mr-[-4px]" />
              </button>
              <p className="absolute bottom-6 text-white/60 text-sm">
                شاهد الفيديو التوضيحي
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
