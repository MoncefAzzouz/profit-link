import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Workflow, Sparkles, Layers, MessageCircle, LogIn, UserPlus, Store } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "الرئيسية", href: "#", icon: Home },
  { name: "كيف يعمل", href: "#how-it-works", icon: Workflow },
  { name: "لماذا نحن", href: "#why-us", icon: Sparkles },
  { name: "المستويات", href: "#levels", icon: Layers },
  { name: "تواصل معنا", href: "#contact", icon: MessageCircle },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
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
          isScrolled
            ? "bg-white/75 backdrop-blur-xl shadow-soft border-b border-border/60"
            : "bg-transparent",
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-[4.5rem] items-center justify-between">
            <Link to="/" className="flex items-center gap-1 group">
              <span
                className={cn(
                  "text-2xl font-extrabold tracking-tight transition-colors",
                  isScrolled ? "text-primary" : "text-white drop-shadow-md",
                )}
              >
                Link<span className="gradient-text">DZ</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                    isScrolled
                      ? "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                      : "text-white/85 hover:text-white hover:bg-white/10",
                  )}
                >
                  <link.icon className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity" aria-hidden />
                  {link.name}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Link to="/auth">
                <Button variant={isScrolled ? "ghost" : "glass"} size="sm" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  تسجيل الدخول
                </Button>
              </Link>
              <Link to="/seller-register">
                <Button variant={isScrolled ? "outline" : "glass"} size="sm" className="gap-1.5 shadow-sm">
                  <Store className="h-4 w-4" />
                  سجّل كبائع
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant={isScrolled ? "default" : "hero"} size="sm" className="gap-1.5 shadow-md">
                  <UserPlus className="h-4 w-4" />
                  سجّل كمسوّق
                </Button>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "md:hidden rounded-xl p-2.5 transition-colors",
                isScrolled ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10",
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
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 font-semibold text-foreground hover:bg-muted"
                  >
                    <link.icon className="h-5 w-5 text-secondary" aria-hidden />
                    {link.name}
                  </a>
                ))}
              </div>
              <div className="mt-5 flex flex-col gap-2 border-t border-border pt-5">
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full gap-2 h-12">
                    <LogIn className="h-4 w-4" />
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link to="/seller-register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full gap-2 h-12">
                    <Store className="h-4 w-4" />
                    سجّل كبائع
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="default" className="w-full gap-2 h-12">
                    <UserPlus className="h-4 w-4" />
                    سجّل كمسوّق
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
