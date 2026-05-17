import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  safelist: [
    // AI Theme base backgrounds
    "bg-white","bg-zinc-50","bg-zinc-900","bg-rose-50","bg-gray-100",
    "bg-[#030014]","bg-[#0a0f2c]","bg-[#050B14]","bg-[#FAFAFA]","bg-[#F9F9F4]","bg-[#2E3C33]","bg-[#3A5A40]",
    // AI Theme text
    "text-white","text-black","text-zinc-900","text-zinc-500","text-zinc-400","text-stone-800","text-stone-500",
    "text-indigo-200","text-cyan-400","text-indigo-400","text-rose-800","text-stone-100",
    "text-[#2C3E35]","text-[#5C7162]","text-[#3A5A40]","text-[#588157]","text-[#E9EDC9]",
    // AI Theme borders
    "border-zinc-100","border-zinc-200","border-rose-100","border-rose-50","border-black","border-gray-200",
    "border-white/5","border-white/10","border-cyan-500/30","border-indigo-500/20","border-indigo-500/30",
    "border-[#E9EDC9]","border-[#CCD5AE]","border-red-600","border-red-800",
    // border widths
    "border-2","border-4","border-b-4","border-y-4","border-t-4","border-l-4","border-b-2",
    // Fonts
    "font-serif","font-mono","font-sans","font-black","font-bold","font-medium","font-light","font-normal",
    // Rounded
    "rounded-none","rounded-xl","rounded-2xl","rounded-3xl","rounded-full","rounded-sm","rounded-md","rounded-lg","rounded-[2rem]",
    // Shadows
    "shadow-2xl","shadow-xl","shadow-lg","shadow-md","shadow-sm",
    "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]","shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
    "shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]","shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
    "shadow-[0_0_30px_rgba(99,102,241,0.5)]","shadow-[0_0_50px_rgba(34,211,238,0.15)]",
    "shadow-[0_0_40px_rgba(99,102,241,0.15)]","shadow-[0_0_20px_rgba(99,102,241,0.2)]",
    "shadow-[0_5px_0_0_#CCB100]","shadow-[0_2px_0_0_#CCB100]",
    // Hover transforms
    "hover:-translate-y-1","hover:translate-y-1","hover:translate-y-[3px]","hover:shadow-none",
    "hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
    // Backgrounds (gradients + special)
    "bg-indigo-600","bg-indigo-900","bg-indigo-900/30","bg-indigo-900/40","bg-indigo-900/80","bg-[#0a0f2c]/50","bg-[#0a0f2c]/80",
    "bg-rose-900","bg-stone-900","bg-yellow-400","bg-gray-900","bg-black","bg-red-600",
    "bg-[#FFDE00]","bg-[#E6C800]","bg-[#F2EDD7]","bg-[#E9EDC9]","bg-[#3A5A40]","bg-[#588157]",
    "bg-gradient-to-r","bg-gradient-to-b","bg-gradient-to-br","bg-gradient-to-tr",
    "from-rose-400","to-pink-500","from-rose-500","to-pink-600",
    "from-zinc-950","to-zinc-900","from-[#0A0F2C]","to-[#030014]",
    "from-stone-800","to-stone-900","from-black","to-gray-900",
    "from-[#3A5A40]","to-[#2E3C33]","from-gray-900",
    "from-cyan-400","to-indigo-500","from-cyan-500/20","to-indigo-600/20",
    "from-[#CCD5AE]","to-[#E9EDC9]",
    // Tracking / letter spacing
    "tracking-widest","tracking-[0.2em]",
    // Opacity
    "opacity-20","opacity-30","opacity-50",
    // Backdrop
    "backdrop-blur-xl","backdrop-blur-md",
    // Special bg colors
    "bg-rose-100","bg-rose-200","bg-zinc-100","bg-white/5","bg-white/20","bg-white/70","bg-white/80","bg-white/90",
    "bg-indigo-900/50","bg-[#030014]/50","bg-rose-50","bg-purple-50","bg-blue-50",
    "bg-red-100","bg-yellow-100","bg-red-500","bg-gray-200",
    // ring
    "ring-4","focus:ring-yellow-400","focus:ring-1","focus:ring-cyan-500",
    "ring-black/5",
    // focus borders
    "focus:border-zinc-900","focus:border-cyan-500","focus:border-rose-400","focus:border-black","focus:border-red-600",
    // italic
    "italic",
    // flex row-reverse
    "flex-row-reverse",
    // max-w
    "max-w-xl","max-w-3xl","max-w-4xl","max-w-5xl","max-w-6xl","max-w-7xl",
    // snap
    "snap-x","snap-center",
    // min-w
    "min-w-[280px]",
    // filter blur
    "blur-[80px]","blur-[90px]","blur-[100px]",
    // hover colors
    "hover:bg-zinc-900","hover:bg-rose-200","hover:bg-green-500","hover:bg-indigo-500",
    "hover:bg-[#E9EDC9]","hover:bg-[#3A5A40]","hover:bg-[#E6C800]","hover:bg-gray-300",
    "hover:border-zinc-400","hover:border-rose-100","hover:border-cyan-500/30","hover:border-[#CCD5AE]","hover:border-red-600",
    "hover:text-white",
    // text sizes
    "text-xs","text-sm","text-base","text-lg","text-xl","text-2xl","text-3xl","text-4xl",
    // border colors
    "border-indigo-400/50","border-l-4",
    // uppercase/lowercase
    "uppercase","lowercase",
    // underline
    "underline","decoration-4","underline-offset-4","decoration-yellow-400",
    // special text colors
    "text-red-500","text-red-600","text-yellow-400","text-cyan-400","text-rose-500","text-rose-800",
    "text-[#3A5A40]","text-[#588157]","text-gray-400","text-gray-600","text-gray-700","text-gray-800",
    // transitions
    "transition-all","hover:translate-y-1",
    // overflow
    "overflow-x-auto",
    // py px
    "py-3","py-5","px-8","px-12",
    // overflows
    "overflow-hidden",
    // text gradient
    "bg-clip-text","text-transparent",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        navy: {
          50: "#f0f4ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#1e3a5f",
          900: "#0f172a",
        },
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        'glow': '0 0 40px -10px hsl(160, 84%, 39%, 0.4)',
        'glow-gold': '0 0 30px -5px hsl(45, 93%, 47%, 0.3)',
        'soft': '0 8px 32px -8px rgba(0, 0, 0, 0.1)',
        'lift': '0 20px 50px -15px rgba(0, 0, 0, 0.15)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "spin-slow": "spin-slow 28s linear infinite",
        "bounce-subtle": "bounce-subtle 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
