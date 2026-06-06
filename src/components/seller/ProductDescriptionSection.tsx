import { motion } from "framer-motion";
import { Check } from "lucide-react";

export interface ProductDescriptionSectionProps {
  mode?: "text" | "images";
  title?: string;
  content?: string;
  textAlign?: "right" | "center" | "left";
  showPoints?: boolean;
  images?: string[];
  textColor?: string;
  accentColor?: string;
  className?: string;
}

/**
 * Renders the "شرح ووصف المنتج" section in either text or images mode.
 * Shared between the builder live preview and the public landing page so the
 * markup stays in sync. All fields are optional with sensible fallbacks.
 */
export default function ProductDescriptionSection({
  mode = "text",
  title,
  content = "",
  textAlign = "right",
  showPoints = true,
  images = [],
  textColor = "#1a1a1a",
  accentColor = "#10b981",
  className = "",
}: ProductDescriptionSectionProps) {
  // Images mode: full-width stacked images
  if (mode === "images") {
    if (!images || images.length === 0) return null;
    return (
      <section className={`w-full ${className}`}>
        {images.map((img, i) => (
          <motion.img
            key={i}
            src={img}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="w-full h-auto block"
            alt={`تفاصيل المنتج ${i + 1}`}
          />
        ))}
      </section>
    );
  }

  const points = content.split("\n").filter((p) => p.trim() !== "");
  const alignClass =
    textAlign === "center" ? "text-center" : textAlign === "left" ? "text-left" : "text-right";

  if (!title && points.length === 0) return null;

  return (
    <section
      className={`py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-8 ${alignClass} ${className}`}
      dir="rtl"
    >
      {title && (
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-black leading-tight"
          style={{ color: textColor }}
        >
          {title}
        </motion.h2>
      )}

      {showPoints ? (
        <div
          className={`grid grid-cols-1 ${textAlign === "center" ? "max-w-xl mx-auto" : "md:grid-cols-2"} gap-4`}
        >
          {points.map((point, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                x: textAlign === "left" ? -20 : textAlign === "right" ? 20 : 0,
                y: textAlign === "center" ? 20 : 0,
              }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all ${
                textAlign === "left"
                  ? "flex-row text-left"
                  : textAlign === "center"
                  ? "flex-col items-center text-center"
                  : "flex-row-reverse text-right"
              }`}
            >
              <div
                className="p-1 rounded-full flex-shrink-0"
                style={{ backgroundColor: accentColor, color: "#fff" }}
              >
                <Check size={18} strokeWidth={3} />
              </div>
              <p className="font-bold leading-relaxed flex-1" style={{ color: textColor }}>
                {point}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p
            className={`text-base sm:text-xl font-medium leading-loose whitespace-pre-line ${alignClass}`}
            style={{ color: textColor }}
          >
            {content}
          </p>
        </motion.div>
      )}
    </section>
  );
}
