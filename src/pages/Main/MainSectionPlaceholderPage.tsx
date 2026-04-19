import BrandedShell from "../../components/BrandedShell";
import { motion } from "framer-motion";

const GOLD = "#C5A059";

type MainSectionPlaceholderPageProps = {
  title: string;
  description?: string;
};

/** Placeholder for sidebar sections until you build real UIs. */
export default function MainSectionPlaceholderPage({
  title,
  description = "This section is coming soon.",
}: MainSectionPlaceholderPageProps) {
  return (
    <motion.div
      className="flex min-w-0 flex-1"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <BrandedShell
        compact
        className="flex min-h-[min(50vh,420px)] flex-1 flex-col items-center justify-center gap-3 px-4! py-10! text-center md:min-h-[min(60vh,520px)]"
      >
        <h1
          className="font-Shuriken text-xl font-black tracking-[0.2em] md:text-2xl"
          style={{ color: GOLD }}
        >
          {title}
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-white/80 md:text-base">
          {description}
        </p>
      </BrandedShell>
    </motion.div>
  );
}
