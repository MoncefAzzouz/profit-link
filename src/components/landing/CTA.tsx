import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Rocket, ShieldCheck } from "lucide-react";

const CTA = () => {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-primary to-navy-800" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px]" />

      <div className="pointer-events-none absolute top-10 right-[10%] h-72 w-72 rounded-full bg-secondary/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute bottom-10 left-[10%] h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-float-delayed" />

      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-emerald-400 shadow-glow animate-pulse-glow">
            <Rocket className="h-10 w-10 text-white" aria-hidden />
          </div>

          <h2 className="mb-6 text-3xl font-bold leading-tight text-white md:text-5xl">
            جاهز تبدأ رحلتك نحو
            <br />
            <span className="gradient-text">دخل إضافي من الإنترنت؟</span>
          </h2>

          <p className="mx-auto mb-10 max-w-xl text-lg text-white/70 leading-relaxed">
            أنشئ حسابًا مجانيًا في دقائق، اختر منتجات تناسب جمهورك، وتابع طلبياتك وأرباحك من لوحة واحدة.
          </p>

          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link to="/auth" className="sm:flex-1 sm:flex sm:justify-center">
              <Button variant="hero" size="xl" className="group w-full sm:max-w-xs">
                سجّل كمسوّق مجانًا
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              </Button>
            </Link>
            <Button variant="heroOutline" size="xl" className="w-full sm:max-w-xs sm:flex-1" asChild>
              <a href="#how-it-works">شاهد كيف يعمل</a>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-white/45">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <ShieldCheck className="h-4 w-4 text-secondary" aria-hidden />
              تسجيل بدون التزام
            </span>
            <span>أكثر من 2,500 مسوّق نشط</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
