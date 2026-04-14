import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Send } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-navy-900 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:56px_56px]" />

      <div className="container relative mx-auto px-4 py-16">
        <div className="mb-12 grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            >
              <h3 className="mb-4 text-2xl font-extrabold">
                Link<span className="gradient-text">DZ</span>
              </h3>
              <p className="mb-6 max-w-md leading-relaxed text-white/65">
                منصة تربط المسوّقين بالمنتجات الجاهزة للتوصيل — نركّز على الشفافية، سرعة الدفع، وتجربة سهلة من الجوال.
              </p>

              <div className="flex gap-2">
                {[
                  { icon: Facebook, href: "#", label: "فيسبوك" },
                  { icon: Instagram, href: "#", label: "إنستغرام" },
                  { icon: Send, href: "#", label: "تيليغرام" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-secondary/40 hover:bg-secondary/20"
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <h4 className="mb-4 font-bold">استكشف</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-white/60 transition-colors hover:text-white">
                  الرئيسية
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="text-white/60 transition-colors hover:text-white">
                  كيف يعمل
                </a>
              </li>
              <li>
                <a href="#levels" className="text-white/60 transition-colors hover:text-white">
                  المستويات
                </a>
              </li>
              <li>
                <a href="#contact" className="text-white/60 transition-colors hover:text-white">
                  تواصل معنا
                </a>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <h4 className="mb-4 font-bold">قانوني</h4>
            <ul className="space-y-3">
              {["شروط الاستخدام", "سياسة الخصوصية", "سياسة الدفع", "من نحن"].map((label) => (
                <li key={label}>
                  <a href="#" className="text-white/60 transition-colors hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row"
        >
          <p className="text-sm text-white/45">© 2026 LinkDZ. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-1 text-sm text-white/45">
            صُنع بكل احتراف في الجزائر
            <span aria-hidden>🇩🇿</span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
