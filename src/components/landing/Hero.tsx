import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Smartphone, Package, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-illustration.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-navy-900 via-primary to-navy-800">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-3xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-right order-2 lg:order-1">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm mb-8"
            >
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              منصة التسويق الأولى في الجزائر
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              ابدأ رحلتك في{" "}
              <span className="gradient-text">التجارة الإلكترونية</span>
              <br />
              <span className="text-white/90">مجانًا</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/70 mb-10 max-w-xl mx-auto lg:mx-0 lg:mr-0"
            >
              بدون رأس مال • بدون تخزين • فقط هاتفك
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
            >
              <Button variant="hero" size="xl" className="group">
                سجل كمسوّق الآن
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              </Button>
              <Button variant="heroOutline" size="xl">
                تسجيل الدخول
              </Button>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center lg:justify-start gap-3"
            >
              {[
                { icon: Smartphone, text: "سهولة الاستخدام" },
                { icon: Package, text: "منتجات متوفرة دائماً" },
                { icon: TrendingUp, text: "أرباح حتى 50%" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80"
                >
                  <item.icon className="w-4 h-4 text-secondary" />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-accent/20 rounded-full blur-3xl scale-75" />
              
              {/* Image */}
              <img
                src={heroImage}
                alt="شخص يستخدم التسويق بالعمولة"
                className="relative z-10 w-full max-w-lg mx-auto drop-shadow-2xl"
              />

              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute top-10 -right-4 animate-float hidden md:block"
              >
                <div className="glass-dark rounded-2xl p-4 w-48">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">أرباح اليوم</p>
                      <p className="text-white font-bold">12,500 دج</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute bottom-10 -left-4 animate-float-delayed hidden md:block"
              >
                <div className="glass-dark rounded-2xl p-4 w-52">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <Package className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">طلبية جديدة!</p>
                      <p className="text-white font-bold text-sm">سماعات بلوتوث Pro</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
