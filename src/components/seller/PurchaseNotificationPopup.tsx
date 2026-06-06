import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

export interface PurchaseNotificationPopupProps {
  /** When false the popup is disabled and nothing renders. */
  enabled?: boolean;
  /** Icon / badge color. */
  accentColor?: string;
  position?: "bottom-right" | "bottom-left" | "top-right";
}

// Random Algerian buyers shown in the floating "اشترى ... هذا المنتج" card.
const BUYERS = [
  { name: "محمد", age: 28, city: "الجزائر العاصمة" },
  { name: "فاطمة", age: 34, city: "وهران" },
  { name: "أحمد", age: 41, city: "قسنطينة" },
  { name: "سارة", age: 25, city: "عنابة" },
  { name: "ياسين", age: 30, city: "سطيف" },
  { name: "ليلى", age: 22, city: "باتنة" },
  { name: "حمزة", age: 35, city: "تلمسان" },
  { name: "مريم", age: 29, city: "بجاية" },
  { name: "عبد الرزاق", age: 45, city: "ورقلة" },
  { name: "خديجة", age: 31, city: "تيزي وزو" },
];

const TIMES = [
  "قبل دقيقة",
  "قبل قليل",
  "قبل 3 دقائق",
  "قبل 5 دقائق",
  "قبل 8 دقائق",
  "قبل 10 دقائق",
  "قبل 15 دقيقة",
  "قبل 20 دقيقة",
];

const rand = (n: number) => Math.floor(Math.random() * n);

/**
 * Floating "social proof" purchase notification. Self-contained: it manages its
 * own show/hide cycle and picks a random buyer + time each time it appears, so it
 * keeps popping up randomly while the page is open. Shared across all templates.
 */
export default function PurchaseNotificationPopup({
  enabled = true,
  accentColor = "#22c55e",
  position = "bottom-right",
}: PurchaseNotificationPopupProps) {
  const [show, setShow] = useState(false);
  const [buyer, setBuyer] = useState(() => BUYERS[rand(BUYERS.length)]);
  const [time, setTime] = useState(() => TIMES[rand(TIMES.length)]);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!enabled) return;

    const runCycle = () => {
      // pick a fresh random buyer + time, then show for ~5s
      setBuyer(BUYERS[rand(BUYERS.length)]);
      setTime(TIMES[rand(TIMES.length)]);
      setShow(true);
      timer.current = setTimeout(() => {
        setShow(false);
        // hidden gap so the popup reappears roughly every ~20s
        timer.current = setTimeout(runCycle, 14000 + rand(4000));
      }, 5000);
    };

    // first one shows a few seconds after the page loads
    timer.current = setTimeout(runCycle, 4000);
    return () => clearTimeout(timer.current);
  }, [enabled]);

  if (!enabled) return null;

  const posClasses = {
    "bottom-right": "bottom-20 right-4",
    "bottom-left": "bottom-20 left-4",
    "top-right": "top-20 right-4",
  }[position];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: position.includes("right") ? 50 : -50, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          dir="rtl"
          className={`fixed z-[100] ${posClasses} w-[280px] bg-white/95 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-gray-100 flex items-center gap-4`}
        >
          <div
            className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-white shadow-lg"
            style={{ backgroundColor: accentColor }}
          >
            <CheckCircle size={24} />
          </div>
          <div className="text-right flex-1">
            <p className="text-[11px] font-black leading-tight text-gray-900">
              اشترى {buyer.name} ({buyer.age} سنة) هذا المنتج
            </p>
            <p className="text-[10px] font-bold text-gray-500 mt-1">
              {time} من {buyer.city} 🇩🇿
            </p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="w-6 h-6 bg-gray-100 hover:bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-xs transition-colors"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
