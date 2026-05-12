import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Smartphone,
  Package,
  TrendingUp,
  Zap,
  Shield,
  Users,
  Sparkles,
  ChevronDown,
  MousePointerClick,
} from "lucide-react";
import { LandingSettings, defaultLandingSettings } from "@/data/landingSettings";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 380, damping: 28 } },
};

const Hero = () => {
  const reduceMotion = useReducedMotion();
  const [settings, setSettings] = useState<LandingSettings>(defaultLandingSettings);

  useEffect(() => {
    const saved = localStorage.getItem("landing_page_settings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-navy-900 via-primary to-navy-800 hero-mesh">
      {/* Layered background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/25 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,800px)] h-[min(90vw,800px)] bg-secondary/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35] bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px]"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900/40 via-transparent to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 pt-28 pb-28 md:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            {...(reduceMotion
              ? { initial: false, animate: { opacity: 1 } }
              : { variants: container, initial: "hidden" as const, animate: "show" as const })}
            className="text-center lg:text-right order-2 lg:order-1"
          >
            {/* Badge */}
            <motion.div
              {...(reduceMotion ? {} : { variants: item })}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm mb-8 shadow-lg shadow-black/10 ring-1 ring-white/10"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
              </span>
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" aria-hidden />
              {settings.hero.badge}
            </motion.div>

            <motion.h1
              {...(reduceMotion ? {} : { variants: item })}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-[3.5rem] font-extrabold text-white mb-5 leading-[1.15] tracking-tight"
            >
              {settings.hero.titlePart1}{" "}
              <span className="text-gradient-hero">{settings.hero.titleGradient}</span>
              <br />
              <span className="text-white/95">{settings.hero.titlePart2}</span>
            </motion.h1>

            <motion.p
              {...(reduceMotion ? {} : { variants: item })}
              className="text-lg md:text-xl text-white/75 mb-9 max-w-xl mx-auto lg:mx-0 lg:mr-0 leading-relaxed"
            >
              {settings.hero.description}
            </motion.p>

            <motion.div
              {...(reduceMotion ? {} : { variants: item })}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6"
            >
              <Link to="/auth">
                <Button variant="hero" size="xl" className="group w-full sm:w-auto min-w-[200px] shadow-glow">
                  {settings.hero.primaryBtn}
                  <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                </Button>
              </Link>
              <Button variant="heroOutline" size="xl" className="w-full sm:w-auto min-w-[200px]" asChild>
                <a href="#how-it-works">
                  <MousePointerClick className="w-5 h-5 opacity-90" />
                  {settings.hero.secondaryBtn}
                </a>
              </Button>
            </motion.div>

            <motion.p {...(reduceMotion ? {} : { variants: item })} className="text-white/55 text-sm mb-10">
              {settings.hero.loginAlt.split("؟ ")[0]}؟{" "}
              <Link to="/auth" className="text-secondary font-semibold hover:text-emerald-300 underline-offset-4 hover:underline transition-colors">
                {settings.hero.loginAlt.split("؟ ")[1]}
              </Link>
            </motion.p>

            <motion.div
              {...(reduceMotion ? {} : { variants: item })}
              className="flex flex-wrap justify-center lg:justify-start gap-3"
            >
              {[
                { icon: Smartphone, text: settings.features.item1 },
                { icon: Package, text: settings.features.item2 },
                { icon: TrendingUp, text: settings.features.item3 },
              ].map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-white/85 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/25 hover:-translate-y-0.5"
                >
                  <entry.icon className="h-4 w-4 text-secondary shrink-0" aria-hidden />
                  <span className="text-sm font-medium">{entry.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative mx-auto max-w-lg">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-secondary/35 to-accent/25 rounded-full blur-3xl scale-90 opacity-80" />

              <div className="relative z-10 mx-auto flex w-full max-w-[20rem] flex-col items-center">
                <div className="relative h-80 w-80">
                  {/* Orbiting ring */}
                  <div
                    className="absolute inset-0 rounded-full border border-white/10 opacity-60 animate-spin-slow"
                    aria-hidden
                  />
                  <div
                    className="absolute inset-3 rounded-full border border-dashed border-white/15 opacity-40 animate-spin-slow [animation-direction:reverse] [animation-duration:32s]"
                    aria-hidden
                  />

                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-secondary/45 to-accent/25 animate-pulse-soft" />
                  <div className="absolute inset-4 rounded-full border border-white/20 bg-gradient-to-tr from-white/15 to-white/5 backdrop-blur-md shadow-2xl" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4">
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-emerald-600 shadow-2xl shadow-secondary/30 ring-4 ring-white/10">
                        <Zap className="h-10 w-10 text-white" aria-hidden />
                      </div>
                      <p className="text-xl font-bold text-white tracking-tight">Easy Profit</p>
                      <p className="text-sm text-white/65 mt-1">تسويق بالعمولة • الجزائر</p>
                    </div>
                  </div>

                  <div className="absolute -top-3 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-2xl border border-white/20 bg-secondary/25 backdrop-blur-md animate-float shadow-lg">
                    <Users className="h-6 w-6 text-secondary" aria-hidden />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-2xl border border-white/20 bg-accent/20 backdrop-blur-md animate-float-delayed shadow-lg">
                    <Package className="h-6 w-6 text-amber-300" aria-hidden />
                  </div>
                  <div className="absolute top-1/2 -left-3 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md animate-float shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" aria-hidden />
                  </div>
                  <div className="absolute top-1/2 -right-3 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md animate-float-delayed shadow-lg">
                    <Shield className="h-6 w-6 text-white" aria-hidden />
                  </div>
                </div>
              </div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, x: 40 }}
                animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                transition={{ duration: 0.65, delay: 0.45 }}
                className="absolute -right-2 top-8 hidden md:block animate-float"
              >
                <div className="glass-dark w-52 rounded-2xl border border-white/15 p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/25">
                      <TrendingUp className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">أرباح اليوم</p>
                      <p className="font-bold text-white">12,500 دج</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, x: -40 }}
                animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                transition={{ duration: 0.65, delay: 0.55 }}
                className="absolute -left-2 bottom-10 hidden md:block animate-float-delayed"
              >
                <div className="glass-dark w-56 rounded-2xl border border-white/15 p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/25">
                      <Package className="h-5 w-5 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">طلبية جديدة</p>
                      <p className="text-sm font-bold text-white">سماعات بلوتوث Pro</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.a
          href="#how-it-works"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
          aria-label="انتقل إلى كيف يعمل"
        >
          <span className="text-xs font-medium">اكتشف الخطوات</span>
          <ChevronDown className="h-5 w-5 animate-bounce-subtle" aria-hidden />
        </motion.a>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block" aria-hidden>
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
