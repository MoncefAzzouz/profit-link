import { motion } from "framer-motion";
import { MessageCircle, Mail, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const contactMethods = [
  {
    icon: MessageCircle,
    title: "واتساب",
    description: "تواصل مباشر مع فريق الدعم",
    action: "ابدأ المحادثة",
    color: "from-green-500 to-emerald-600",
    href: "#",
  },
  {
    icon: Mail,
    title: "البريد الإلكتروني",
    description: "support@platform.dz",
    action: "أرسل رسالة",
    color: "from-blue-500 to-indigo-600",
    href: "mailto:support@platform.dz",
  },
];

const quickLinks = [
  { icon: FileText, title: "من نحن", href: "#" },
  { icon: FileText, title: "شروط الاستخدام", href: "#" },
  { icon: FileText, title: "سياسة الدفع", href: "#" },
  { icon: HelpCircle, title: "الأسئلة الشائعة", href: "#" },
];

const Contact = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            تواصل معنا
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            نحن هنا <span className="gradient-text">لمساعدتك</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            فريقنا متواجد دائمًا للإجابة على استفساراتك
          </p>
        </motion.div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
          {contactMethods.map((method, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <a
                href={method.href}
                className="block group"
              >
                <div className="relative bg-card rounded-2xl p-6 border border-border hover:border-secondary/30 transition-all duration-300 hover-lift overflow-hidden">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                  <div className="relative flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <method.icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {method.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        {method.description}
                      </p>
                      <span className="text-secondary font-medium text-sm group-hover:underline">
                        {method.action} ←
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {quickLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:border-secondary/30 text-muted-foreground hover:text-foreground transition-all duration-300"
            >
              <link.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{link.title}</span>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
