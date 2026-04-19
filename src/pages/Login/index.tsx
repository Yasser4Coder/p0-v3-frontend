import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { loginBg } from "../../assets/assets";
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
  const fromWelcomeTransition = Boolean(
    (location.state as { fromWelcomeTransition?: boolean } | null)
      ?.fromWelcomeTransition,
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Enter username and password.");
      return;
    }
    navigate("/welcome");
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
                  Username
                </label>
                <input
                  id="login-username"
                  form={LOGIN_FORM_ID}
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                  placeholder="Username"
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
                  className="mt-1 w-full max-w-md text-sm text-red-300"
                  role="alert"
                  variants={item}
                >
                  {error}
                </motion.p>
              ) : null}

              <motion.div className="w-full max-w-md pt-2 mt-8" variants={item}>
                <GameButton
                  type="submit"
                  form={LOGIN_FORM_ID}
                  className="justify-center focus-visible:ring-offset-black/60 [&>div]:w-full [&>div]:py-3.5 [&>div]:text-center"
                  outerBgClass="bg-[#A38A51]"
                  bgClass="bg-[#333B36]/20 hover:bg-[#333B36]/30 !border !border-neutral-900"
                  fontClass="!rounded-none text-lg font-black uppercase tracking-[0.35em] text-black"
                >
                  Login
                </GameButton>
              </motion.div>
            </motion.div>
          </BrandedShell>
        </main>
      </motion.div>
    </div>
  );
}
