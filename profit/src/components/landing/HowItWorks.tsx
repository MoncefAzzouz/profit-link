import { motion } from "framer-motion";
import { Package, Link2, Wallet, Play } from "lucide-react";

const steps = [
  {
    icon: Package,
    number: "01",
    title: "اختر المنتج",
    description: "تصفح مئات المنتجات المتوفرة واختر ما يناسب جمهورك وقنواتك",
    color: "from-secondary to-emerald-400",
  },
  {
    icon: Link2,
    number: "02",
    title: "خذ رابط الإحالة",
    description: "احصل على رابطك الخاص لكل منتج بضغطة واحدة وشاركه أينما تريد",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Wallet,
    number: "03",
    title: "سوّق واربح",
    description: "كل طلبية مؤكّدة تضيف عمولة لحسابك — تصل إلى 50% حسب المستوى",
    color: "from-accent to-yellow-400",
  },
];

const HowItWorks = () => {
  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="pointer-events-none absolute top-0 left-1/4 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1.5 text-sm font-semibold text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            كيف يعمل؟
          </span>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
            ثلاث خطوات <span className="gradient-text">بسيطة</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
            لا تحتاج خبرة تقنية: التسجيل مجاني، والمنصة ترشدك في كل خطوة حتى أول عمولة.
          </p>
        </motion.div>

        <div className="relative mx-auto grid max-w-6xl gap-8 md:grid-cols-3 md:gap-6">
          {/* Connector line (desktop, RTL: steps flow right-to-left visually) */}
          <div
            className="pointer-events-none absolute top-[4.25rem] right-[12%] left-[12%] hidden h-0.5 md:block bg-gradient-to-l from-border via-secondary/30 to-border"
            aria-hidden
          />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="group relative"
            >
              <div className="relative h-full rounded-3xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-secondary/35 hover:shadow-lift">
                <div className="absolute -top-3 right-6 z-10 flex h-9 items-center rounded-xl bg-gradient-to-l from-primary to-navy-800 px-3 text-sm font-bold text-white shadow-md ring-4 ring-background">
                  {step.number}
                </div>

                <div
                  className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-md transition-transform duration-300 group-hover:scale-105`}
                >
                  <step.icon className="h-8 w-8 text-white" aria-hidden />
                </div>

                <h3 className="mb-3 text-xl font-bold text-foreground">{step.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{step.description}</p>

                <div className="mt-6 flex items-center gap-2 text-xs font-medium text-secondary/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:opacity-100">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary/15 text-[10px] font-bold">
                    {index + 1}
                  </span>
                  خطوة {index + 1} من 3
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mx-auto mt-20 max-w-4xl"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-navy-900 to-primary p-[1px] shadow-xl">
            <div className="relative aspect-video overflow-hidden rounded-[1.4rem] bg-navy-900/60 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/25 to-secondary/20" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] opacity-60" />
              <div className="relative flex h-full flex-col items-center justify-center gap-4 p-6">
                <button
                  type="button"
                  className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-white/25 bg-white/15 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                  aria-label="تشغيل الفيديو التوضيحي"
                >
                  <Play className="mr-[-3px] h-9 w-9 fill-white text-white" aria-hidden />
                </button>
                <p className="text-center text-sm font-medium text-white/75">
                  شاهد جولة قصيرة في المنصة — التسجيل، المنتجات، والعمولات
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
