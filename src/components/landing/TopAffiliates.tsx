import { motion } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

const topAffiliates = [
  {
    rank: 1,
    name: "أحمد بن عمر",
    orders: 156,
    level: "Gold",
    avatar: "أ",
    icon: Trophy,
    color: "from-yellow-400 to-amber-500",
    borderColor: "border-yellow-400/50",
    bgColor: "bg-yellow-50",
  },
  {
    rank: 2,
    name: "سارة حمداني",
    orders: 134,
    level: "Gold",
    avatar: "س",
    icon: Medal,
    color: "from-gray-300 to-gray-400",
    borderColor: "border-gray-300/50",
    bgColor: "bg-gray-50",
  },
  {
    rank: 3,
    name: "كريم مسعود",
    orders: 98,
    level: "Silver",
    avatar: "ك",
    icon: Award,
    color: "from-amber-600 to-orange-600",
    borderColor: "border-amber-600/50",
    bgColor: "bg-amber-50",
  },
];

const levelColors: Record<string, string> = {
  Gold: "bg-gradient-to-r from-yellow-400 to-amber-500 text-white",
  Silver: "bg-gradient-to-r from-gray-400 to-gray-500 text-white",
  Bronze: "bg-gradient-to-r from-amber-600 to-orange-600 text-white",
};

const TopAffiliates = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent font-medium text-sm mb-4">
            🏆 قائمة الشرف
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            أفضل المسوّقين <span className="gradient-text-gold">هذا الأسبوع</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            نافس واصعد للقمة معهم
          </p>
        </motion.div>

        {/* Leaderboard */}
        <div className="max-w-3xl mx-auto space-y-4">
          {topAffiliates.map((affiliate, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`relative bg-card rounded-2xl p-4 md:p-6 border-2 ${affiliate.borderColor} hover:shadow-lg transition-all duration-300 group overflow-hidden`}>
                {/* Background Shine */}
                {index === 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                )}

                <div className="relative flex items-center gap-4 md:gap-6">
                  {/* Rank */}
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${affiliate.color} flex items-center justify-center shrink-0`}>
                    <affiliate.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>

                  {/* Avatar */}
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${affiliate.bgColor} flex items-center justify-center text-lg md:text-xl font-bold text-foreground shrink-0`}>
                    {affiliate.avatar}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-foreground truncate">
                      {affiliate.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelColors[affiliate.level]}`}>
                        {affiliate.level}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-left shrink-0">
                    <div className="flex items-center gap-1 text-secondary mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-2xl md:text-3xl font-bold">{affiliate.orders}</span>
                    </div>
                    <p className="text-muted-foreground text-xs md:text-sm">طلبية مؤكدة</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Motivation CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            هل تريد أن تكون في القائمة؟ 🔥
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-secondary font-semibold hover:underline"
          >
            سجّل الآن وابدأ المنافسة
            <span className="text-xl">←</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default TopAffiliates;
