import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Location } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { loginBg } from "../../assets/assets";
import { ApiError } from "../../lib/api/errors";
import { login } from "../../lib/auth/api";
import {
  LOGIN_ITEM_ENTER_S,
  LOGIN_PAGE_FADE_S,
  LOGIN_STAGGER_DELAY_AFTER_WELCOME_S,
  LOGIN_STAGGER_DELAY_DIRECT_S,
  LOGIN_STAGGER_GAP_DIRECT_S,
  LOGIN_STAGGER_GAP_S,
} from "../../config/welcomeLoginTransition";
import BrandedShell from "../../components/BrandedShell";
import GameButton from "../../components/GameButton";
import Header from "../../components/Header";

const easeOut = [0.22, 1, 0.36, 1] as const;

const LOGIN_FORM_ID = "login-form";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: Location } | null)?.from?.pathname ?? "/main";
  const fromWelcomeTransition = Boolean(
    (location.state as { fromWelcomeTransition?: boolean } | null)
      ?.fromWelcomeTransition,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { container, item, pageTransition } = useMemo(() => {
    const gap = fromWelcomeTransition
      ? LOGIN_STAGGER_GAP_S
      : LOGIN_STAGGER_GAP_DIRECT_S;
    const delayChildren = fromWelcomeTransition
      ? LOGIN_STAGGER_DELAY_AFTER_WELCOME_S
      : LOGIN_STAGGER_DELAY_DIRECT_S;

    return {
      pageTransition: {
        duration: fromWelcomeTransition ? LOGIN_PAGE_FADE_S : 0.22,
        ease: easeOut,
        delay: fromWelcomeTransition ? 0.08 : 0,
      },
      container: {
        hidden: {},
        show: {
          transition: {
            staggerChildren: gap,
            delayChildren,
          },
        },
      },
      item: {
        hidden: {
          opacity: 0,
          y: 32,
        },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: LOGIN_ITEM_ENTER_S,
            ease: easeOut,
          },
        },
      },
    };
  }, [fromWelcomeTransition]);

  const getReadableLoginError = (err: unknown) => {
    if (err instanceof ApiError) {
      // Prefer backend-provided message when it exists and is meaningful.
      if (err.kind === "unauthorized") return err.message || "Invalid email or password.";
      if (err.kind === "forbidden")
        return "You don’t have permission to access this account.";
      if (err.kind === "timeout") return "Login is taking too long. Please try again.";
      if (err.kind === "network")
        return "Can’t reach the server. Check your internet connection and try again.";
      if (err.kind === "server") return "Server error. Please try again in a moment.";
      if (err.kind === "bad_request") return err.message || "Please check your input and try again.";
      return err.message || "Login failed. Please try again.";
    }
    return "Login failed. Please try again.";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (isSubmitting) return;
    if (!email.trim() || !password) {
      setError("Enter email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getReadableLoginError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-3xl bg-[#030E07] px-6 py-5.5 font-Shuriken text-sm uppercase tracking-[0.2em] text-white outline-none placeholder:text-white/45 placeholder:uppercase focus:border-[#A38A51] focus:ring-2 focus:ring-[#A38A51]/30";

  return (
    <div
      className="min-h-screen font-Shuriken text-white"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <motion.div
        className="flex min-h-screen flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={pageTransition}
      >
        <motion.div
          className="pt-10 shrink-0"
          variants={item}
          initial="hidden"
          animate="show"
        >
          <Header />
        </motion.div>

        <main className="flex flex-1 flex-col items-stretch justify-start px-4 pb-10 pt-8 sm:px-8 md:px-12 md:pt-12">
          <BrandedShell className="w-full">
            <form
              id={LOGIN_FORM_ID}
              onSubmit={handleSubmit}
              className="sr-only"
            />

            <motion.div
              className="flex flex-col items-center text-center"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.h1
                className="font-Shuriken text-4xl font-bold uppercase tracking-[0.15em] text-white md:text-5xl md:tracking-[0.2em]"
                variants={item}
              >
                Are you ready?
              </motion.h1>

              <motion.div variants={item} className="mt-8 w-full max-w-md md:mt-10">
                <label htmlFor="login-username" className="sr-only">
                  Email
                </label>
                <input
                  id="login-email"
                  form={LOGIN_FORM_ID}
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="Email"
                />
              </motion.div>

              <motion.div variants={item} className="w-full mt-6 max-w-md">
                <label htmlFor="login-password" className="sr-only">
                  Password
                </label>
                <input
                  id="login-password"
                  form={LOGIN_FORM_ID}
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Password"
                />
              </motion.div>

              {error ? (
                <motion.p
                  className="mt-4 w-full max-w-md rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200"
                  role="alert"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: easeOut }}
                >
                  {error}
                </motion.p>
              ) : null}

              <motion.div className="w-full max-w-md pt-2 mt-8" variants={item}>
                <GameButton
                  type="submit"
                  form={LOGIN_FORM_ID}
                  disabled={isSubmitting}
                  className="justify-center focus-visible:ring-offset-black/60 [&>div]:w-full [&>div]:py-3.5 [&>div]:text-center"
                  outerBgClass="bg-[#A38A51]"
                  bgClass="bg-[#333B36]/20 hover:bg-[#333B36]/30 !border !border-neutral-900"
                  fontClass="!rounded-none text-lg font-black uppercase tracking-[0.35em] text-black"
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </GameButton>
              </motion.div>
            </motion.div>
          </BrandedShell>
        </main>
      </motion.div>
    </div>
  );
}
