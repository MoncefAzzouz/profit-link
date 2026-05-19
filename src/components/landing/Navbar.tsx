import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Workflow, Sparkles, Layers, MessageCircle, LogIn, UserPlus, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { LandingSettings, defaultLandingSettings } from "@/data/landingSettings";

const icons = [Home, Workflow, Sparkles, Layers, MessageCircle];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<LandingSettings>(defaultLandingSettings);

  useEffect(() => {
    const saved = localStorage.getItem("landing_page_settings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          "bg-white/75 backdrop-blur-xl shadow-soft border-b border-border/60",
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-[4.5rem] items-center justify-between">
            <Link to="/" className="flex items-center gap-1 group">
              <span
                className={cn(
                  "text-2xl font-extrabold tracking-tight transition-colors",
                  "text-primary",
                )}
              >
                Easy<span className="gradient-text"> Profit</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              {settings.navbar.links.map((link, idx) => {
                const Icon = icons[idx] || Home;
                return (
                  <a
                    key={idx}
                    href={link.href}
                    className={cn(
                      "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                      "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                    )}
                  >
                    <Icon className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity" aria-hidden />
                    {link.name}
                  </a>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  {settings.navbar.loginBtn}
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="default" size="sm" className="gap-1.5 shadow-md">
                  <UserPlus className="h-4 w-4" />
                  {settings.navbar.registerBtn}
                </Button>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "md:hidden rounded-xl p-2.5 transition-colors",
                "text-foreground hover:bg-muted",
              )}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-[4.5rem] z-40 overflow-hidden border-b border-border bg-white/95 shadow-xl backdrop-blur-xl md:hidden"
          >
            <div className="container mx-auto px-4 py-5">
              <div className="flex flex-col gap-1">
                {settings.navbar.links.map((link, idx) => {
                  const Icon = icons[idx] || Home;
                  return (
                    <a
                      key={idx}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 font-semibold text-foreground hover:bg-muted"
                    >
                      <Icon className="h-5 w-5 text-secondary" aria-hidden />
                      {link.name}
                    </a>
                  );
                })}
              </div>
              <div className="mt-5 flex flex-col gap-2 border-t border-border pt-5">
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full gap-2 h-12">
                    <LogIn className="h-4 w-4" />
                    {settings.navbar.loginBtn}
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="default" className="w-full gap-2 h-12 text-lg">
                    <UserPlus className="h-5 w-5" />
                    {settings.navbar.registerBtn}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
