import { Outlet } from "react-router-dom";
import { mainBg } from "../assets/assets";
import Header from "../components/Header";

/**
 * Standalone shell for challenge flow: same dashboard header + bg as `/main`,
 * but no sidebar or mentor overlay (challenge is separate from the main dashboard).
 */
export default function ChallengeLayout() {
  return (
    <div
      className="min-h-screen font-Shuriken uppercase tracking-wide text-white"
      style={{
        backgroundImage: `url(${mainBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="min-h-screen bg-black/55 backdrop-blur-[1px]">
        <div className="pt-6 md:pt-8">
          <Header variant="dashboard" userDisplayName="ZER BILEL" />
        </div>
        <main className="w-full px-5 pb-10 pt-5 md:px-10 lg:px-12 lg:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
