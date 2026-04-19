import { loginGif, welcomeBg } from "../assets/assets";
import GameButton from "../components/GameButton";
import Header from "../components/Header";
import { useWelcomeLoginTransition } from "../contexts/WelcomeLoginTransitionContext";
const LORE = `WELCOME TO PROJECT O.
YOU ARE NOW INSIDE A CONTROLLED NEN-BASED SYSTEM. YOUR
PRESENCE HAS BEEN DETECTED, AND YOUR PROGRESSION IS
ABOUT TO BEGIN.

NEN PATHWAYS ARE CURRENTLY INACTIVE. TO ADVANCE, YOU
MUST INTERACT WITH THE SYSTEM, COMPLETE CHALLENGES, AND
ACTIVATE THE AVAILABLE NODES.

YOUR ACTIONS WILL DETERMINE YOUR PROGRESSION.
PROCEED CAREFULLY.`;

export default function Welcome() {
  const { startWelcomeToLogin } = useWelcomeLoginTransition();

  return (
    <div
      className="min-h-screen font-Shuriken uppercase tracking-wide text-white"
      style={{
        backgroundImage: `url(${welcomeBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex min-h-screen flex-col backdrop-blur-[1px]">
        <div className="pt-10 shrink-0">
          <Header />
        </div>

        <main className="flex flex-1 flex-col items-center justify-center px-12 py-8">
          <div className="w-full border-2 border-[#43574C] bg-black/65 px-12 py-7 shadow-xl md:px-32 md:py-10">
            <h1 className="text-center text-[22px] font-semibold leading-snug text-white">
              Welcome to Project O
              <br />
              <span className="text-[22px] font-normal text-white/90">
                Hunter X Hacker version
              </span>
            </h1>

            <div className="mt-6 rounded-3xl border-2 border-[#43574C]/90 bg-linear-to-br from-white/14 via-white/6 to-white/3 px-5 py-10 shadow-[0_12px_48px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.28),inset_0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-3xl backdrop-saturate-200 md:mt-8 md:px-7 md:py-10">
              <p className="whitespace-pre-line text-left text-[18px] leading-relaxed text-white/95">
                {LORE}
              </p>

              <div className="mt-8 flex justify-center md:mt-10">
                <GameButton
                  type="button"
                  className="focus-visible:ring-offset-black/50"
                  outerBgClass="bg-[#A38A51]"
                  bgClass="bg-[#333B36]/20 hover:bg-[#333B36]/30 !border !border-neutral-900 !rounded-xl"
                  fontClass="text-black text-[18px] font-bold uppercase tracking-[0.25em] px-8 py-2.5 md:px-12 md:py-4.5"
                  onClick={() =>
                    startWelcomeToLogin({
                      gifSrc: loginGif,
                    })
                  }
                >
                  Proceed
                </GameButton>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
