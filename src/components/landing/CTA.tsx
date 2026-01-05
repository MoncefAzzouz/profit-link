import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Rocket } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-primary to-navy-800" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Floating Elements */}
      <div className="absolute top-10 right-[10%] w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 left-[10%] w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-emerald-400 flex items-center justify-center mx-auto mb-8 animate-pulse-glow">
            <Rocket className="w-10 h-10 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            جاهز تبدأ رحلتك نحو
            <br />
            <span className="gradient-text">الحرية المالية؟</span>
          </h2>

          {/* Description */}
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            سجّل الآن وابدأ بالربح من أول يوم. بدون رأس مال، بدون مخاطرة.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" className="group">
              سجل كمسوّق مجانًا
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </Button>
            <Button variant="heroOutline" size="xl">
              تعرف أكثر
            </Button>
          </div>

          {/* Trust Text */}
          <p className="text-white/40 text-sm mt-8">
            ✨ أكثر من 2,500 مسوّق يثقون بنا
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
