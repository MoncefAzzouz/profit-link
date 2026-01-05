import { motion } from "framer-motion";
import { Facebook, Instagram, Send } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-navy-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold mb-4 gradient-text">LinkDZ</h3>
              <p className="text-white/60 leading-relaxed mb-6 max-w-md">
                المشروع ما يبيعش منتج برك، المشروع يبيع فرصة ربح منظمة وبدون رأس مال.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-3">
                {[
                  { icon: Facebook, href: "#" },
                  { icon: Instagram, href: "#" },
                  { icon: Send, href: "#" },
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors duration-300"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-3">
              {["الرئيسية", "كيف يعمل", "المستويات", "الأسئلة الشائعة"].map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-white/60 hover:text-white transition-colors duration-300">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="font-bold mb-4">قانوني</h4>
            <ul className="space-y-3">
              {["شروط الاستخدام", "سياسة الخصوصية", "سياسة الدفع", "من نحن"].map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-white/60 hover:text-white transition-colors duration-300">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-white/40 text-sm">
            © 2024 LinkDZ. جميع الحقوق محفوظة.
          </p>
          <p className="text-white/40 text-sm flex items-center gap-1">
            صُنع بـ <span className="text-red-500">❤</span> في الجزائر 🇩🇿
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
