import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

export type SubmissionFeedback = {
  kind: "success" | "error";
  message: string;
};

type SubmissionFeedbackToastProps = {
  feedback: SubmissionFeedback | null;
  onDismiss: () => void;
  /** Auto-hide after ms (0 = no auto-dismiss). */
  autoHideMs?: number;
};

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function SubmissionFeedbackToast({
  feedback,
  onDismiss,
  autoHideMs = 6500,
}: SubmissionFeedbackToastProps) {
  useEffect(() => {
    if (!feedback || autoHideMs <= 0) return;
    const t = window.setTimeout(onDismiss, autoHideMs);
    return () => window.clearTimeout(t);
  }, [feedback, autoHideMs, onDismiss]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[85] overflow-x-clip"
      aria-live="polite"
    >
      <div className="flex justify-end p-3 pt-[max(4.5rem,env(safe-area-inset-top,0px)+0.75rem)] sm:p-4 sm:pt-[max(5rem,env(safe-area-inset-top,0px)+1rem)] md:pr-6">
      <AnimatePresence mode="wait">
        {feedback ? (
          <motion.div
            key={`${feedback.kind}-${feedback.message}`}
            role="alert"
            layout
            initial={{ opacity: 0, x: 56, scale: 0.96, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 40, scale: 0.98, filter: "blur(4px)" }}
            transition={{
              duration: 0.45,
              ease: easeOut,
            }}
            className={[
              "pointer-events-auto flex w-[min(100%,24rem)] max-w-[min(94vw,28rem)] overflow-hidden rounded-2xl border shadow-[0_18px_58px_rgba(0,0,0,0.55)]",
              "backdrop-blur-xl backdrop-saturate-150",
              feedback.kind === "error"
                ? "border-red-400/35 bg-[#1a0f0f]/92 ring-1 ring-red-500/20"
                : "border-emerald-400/30 bg-[#0f1a14]/92 ring-1 ring-emerald-500/18",
            ].join(" ")}
          >
            <div
              className={[
                "w-1.5 shrink-0",
                feedback.kind === "error" ? "bg-red-500" : "bg-emerald-500",
              ].join(" ")}
              aria-hidden
            />
            <div className="flex min-w-0 flex-1 items-start gap-3.5 px-4 py-3.5 sm:gap-4 sm:px-4.5 sm:py-4">
              {feedback.kind === "error" ? (
                <AlertCircle
                  className="mt-0.5 h-5.5 w-5.5 shrink-0 text-red-400"
                  strokeWidth={2.25}
                  aria-hidden
                />
              ) : (
                <CheckCircle2
                  className="mt-0.5 h-5.5 w-5.5 shrink-0 text-emerald-400"
                  strokeWidth={2.25}
                  aria-hidden
                />
              )}
              <p className="min-w-0 flex-1 text-left font-Shuriken text-xs font-black leading-snug tracking-[0.12em] text-white/95 sm:text-sm">
                {feedback.message}
              </p>
              <button
                type="button"
                onClick={onDismiss}
                className={[
                  "-m-1 shrink-0 rounded-md p-1.5 text-white/55 transition-colors",
                  "hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                ].join(" ")}
                aria-label="Dismiss notification"
              >
                <X className="h-4.5 w-4.5" strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      </div>
    </div>
  );
}
