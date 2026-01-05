import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { Package, Users, TrendingUp, Truck } from "lucide-react";

interface CounterProps {
  from: number;
  to: number;
  duration?: number;
  suffix?: string;
}

const Counter = ({ from, to, duration = 2, suffix = "" }: CounterProps) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(from);

  useEffect(() => {
    const controls = animate(count, to, { duration });
    const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, to, duration, rounded]);

  return (
    <span>
      {displayValue.toLocaleString('ar-DZ')}{suffix}
    </span>
  );
};

const stats = [
  {
    icon: Package,
    value: 15000,
    suffix: "+",
    label: "طلبية مؤكدة شهريًا",
    color: "from-secondary to-emerald-400",
  },
  {
    icon: Users,
    value: 2500,
    suffix: "+",
    label: "مسوّق نشط",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: TrendingUp,
    value: 85,
    suffix: "%",
    label: "نسبة تأكيد الطلبيات",
    color: "from-accent to-yellow-400",
  },
  {
    icon: Truck,
    value: 48,
    suffix: "h",
    label: "متوسط وقت التوصيل",
    color: "from-rose-500 to-pink-500",
  },
];

const Stats = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            أرقام المنصة
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            نتائج <span className="gradient-text">حقيقية</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            أرقام تتكلم عن نجاح المنصة ومسوّقينا
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          onViewportEnter={() => setIsVisible(true)}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="relative bg-card rounded-3xl p-6 md:p-8 border border-border text-center group hover:border-secondary/30 transition-all duration-300 hover-lift overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                {/* Icon */}
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>

                {/* Counter */}
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {isVisible && (
                    <Counter from={0} to={stat.value} suffix={stat.suffix} />
                  )}
                </div>

                {/* Label */}
                <p className="text-muted-foreground text-sm md:text-base">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Stats;
