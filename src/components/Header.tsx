import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { headerBg, logoCS, manCS } from "../assets/assets";
import GameButton from "./GameButton";
import NotificationBell from "./NotificationBell";
import {
  HEADER_LOGO_ID,
  useHeaderLogoSuppressed,
} from "../contexts/WelcomeLoginTransitionContext";
import { logout } from "../lib/auth/api";

export type HeaderProps = {
  variant?: "default" | "dashboard";
  /** Shown in dashboard header center (e.g. player name). */
  userDisplayName?: string;
  /** Optional avatar URL; defaults to `manCS` from assets if omitted. */
  userAvatarUrl?: string;
};

const Header = ({
  variant = "default",
  userDisplayName = "ZER BILEL",
  userAvatarUrl,
}: HeaderProps) => {
  const logoSuppressed = useHeaderLogoSuppressed();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
      setIsLoggingOut(false);
    }
  };

  if (variant === "dashboard") {
    return (
      <header className="relative mx-12 h-[103px] overflow-hidden rounded-lg bg-linear-to-t from-[#B52B2B] to-[#E1D69E] p-[2px]">
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-md"
          aria-hidden
        >
        </div>
        <div
          className="relative z-10 flex h-full w-full items-center justify-between rounded-lg bg-cover bg-center bg-no-repeat px-7"
          style={{ backgroundImage: `url(${headerBg})` }}
        >
          <img src={"/HUNTERxHAKER.svg"} alt="Hunter X Hacker" width={200} />
          <div className="hidden min-w-0 relative flex-1 items-center justify-center gap-3 sm:flex md:gap-4">
            <div className="absolute overflow-hidden w-[350px] h-[164%]">
              <div className="absolute top-0 left-[-7%]">
                <svg xmlns="http://www.w3.org/2000/svg" width="144" height="119" viewBox="0 0 144 119" fill="none">
                  <path d="M120 -1H144L28.9756 119H0L120 -1Z" fill="#138F00"/>
                </svg>
              </div>
              <div className="absolute top-0 left-[10%]">
                <svg xmlns="http://www.w3.org/2000/svg" width="234" height="123" viewBox="0 0 234 123" fill="none">
                  <path d="M115.028 -1.36443C115.407 -1.76982 115.936 -2 116.491 -2H231.65C233.452 -2 234.335 0.195141 233.035 1.44277L112.151 117.491C111.809 117.82 111.361 118.016 110.888 118.045L2.12699 124.694C0.322931 124.804 -0.690402 122.655 0.542655 121.333L115.028 -1.36443Z" fill="#138F00"/>
                </svg>
              </div>
              <div className="absolute top-0 left-[50%]">
                <svg xmlns="http://www.w3.org/2000/svg" width="144" height="119" viewBox="0 0 144 119" fill="none">
                  <path d="M120 -1H144L28.9756 119H0L120 -1Z" fill="#138F00"/>
                </svg>
              </div>
            </div>
            <GameButton
              type="button"
              aria-label="Profile"
              className="relative z-30 h-10 w-10 shrink-0 p-[4px]! md:h-15 md:w-15 [&>div]:flex [&>div]:h-full [&>div]:w-full [&>div]:min-h-0! [&>div]:p-0! [&>div]:items-center [&>div]:justify-center [&>div]:overflow-hidden [&>div]:rounded-sm! [&>div]:border-[#333B36]!"
              outerBgClass="bg-[#000A03]"
              bgClass="!rounded-sm border-[#39FF14]/50 bg-transparent !p-0 hover:opacity-95"
              fontClass="!p-0"
            >
              <img
                src={userAvatarUrl ?? manCS}
                alt=""
                className="h-full w-full object-cover"
              />
            </GameButton>
            <GameButton
              type="button"
              className="relative z-30 h-10 max-w-[220px] min-w-0 shrink self-center p-1! md:h-15 md:max-w-xs [&>div]:relative [&>div]:flex [&>div]:h-full! [&>div]:min-h-0 [&>div]:min-w-0! [&>div]:items-center [&>div]:overflow-hidden [&>div]:border-[#333B36]! [&>div]:bg-black! [&>div]:px-3! md:[&>div]:px-4!"
              outerBgClass="bg-[#000A03]"
              bgClass="relative !rounded-sm !border-[#333B36] !bg-transparent hover:bg-[#000A03]"
              fontClass="font-Shuriken !px-0 !py-0 text-xs font-bold tracking-[0.15em] text-white md:text-base"
            >
              <span className="relative z-10 block truncate">{userDisplayName}</span>
            </GameButton>
            <div
              className="relative z-30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-Shuriken text-lg font-bold text-black shadow-[0_0_14px_rgba(57,255,20,0.45)] md:h-15 md:w-15"
              aria-hidden
            >
              <img src={logoCS} alt="CS" className="h-full w-full object-cover" />
            </div>

            <GameButton
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="relative z-30 h-10 shrink-0 p-1! md:h-15 [&>div]:h-full! [&>div]:min-h-0! [&>div]:px-4! md:[&>div]:px-5!"
              outerBgClass="bg-[#000A03]"
              bgClass="!rounded-sm !border-[#333B36] !bg-[#B52B2B]/15 hover:!bg-[#B52B2B]/25"
              fontClass="font-Shuriken !px-0 !py-0 text-xs font-bold uppercase tracking-[0.22em] text-white md:text-sm"
            >
              {isLoggingOut ? "LOGGING OUT..." : "LOGOUT"}
            </GameButton>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <NotificationBell />
            <img
              id={HEADER_LOGO_ID}
              src={"/Logo.svg"}
              alt="P0"
              width={45}
              height={45}
              className={`transition-opacity duration-200 ${logoSuppressed ? "opacity-0" : "opacity-100"}`}
              aria-hidden={logoSuppressed}
            />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="rounded-lg mx-12 h-[103px] bg-linear-to-t from-[#B52B2B] to-[#E1D69E] p-[2px]">
      <div
        className="flex h-[99%] w-full items-center justify-between rounded-lg bg-cover bg-center bg-no-repeat px-7"
        style={{ backgroundImage: `url(${headerBg})` }}
      >
        <img src={"/HUNTERxHAKER.svg"} alt="Hunter X Hacker" width={200} />
        <img
          id={HEADER_LOGO_ID}
          src={"/Logo.svg"}
          alt="P0"
          width={45}
          height={45}
          className={`transition-opacity duration-200 ${logoSuppressed ? "opacity-0" : "opacity-100"}`}
          aria-hidden={logoSuppressed}
        />
      </div>
    </header>
  );
};

export default Header;
