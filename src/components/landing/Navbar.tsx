import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "الرئيسية", href: "#" },
  { name: "كيف يعمل", href: "#how-it-works" },
  { name: "لماذا نحن", href: "#why-us" },
  { name: "المستويات", href: "#levels" },
  { name: "تواصل معنا", href: "#contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className={`text-2xl font-bold ${isScrolled ? 'text-primary' : 'text-white'}`}>
                Link<span className="gradient-text">DZ</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isScrolled
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/auth">
                <Button
                  variant={isScrolled ? "ghost" : "glass"}
                  size="sm"
                >
                  تسجيل الدخول
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  variant={isScrolled ? "default" : "hero"}
                  size="sm"
                >
                  سجل كمسوّق
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg ${
                isScrolled ? "text-foreground" : "text-white"
              }`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-20 z-40 bg-white/95 backdrop-blur-xl border-b border-border shadow-lg md:hidden"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col gap-4">
                {navLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-foreground font-medium py-2 border-b border-border/50"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="flex flex-col gap-3 pt-4">
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      تسجيل الدخول
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="default" className="w-full">
                      سجل كمسوّق
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
