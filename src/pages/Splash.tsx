import GameButton from "../components/GameButton";
import Header from "../components/Header";
import {
  heavyAssetsAfterSplash,
  splashBg,
  splashGif,
  splashPriorityAssets,
} from "../assets/assets";
import { useEffect, useState } from "react";
import { preloadAssetPhases } from "../utils/preloadAssets";

export default function Splash() {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadResources = async () => {
      await preloadAssetPhases(
        [splashPriorityAssets, heavyAssetsAfterSplash],
        {
          onProgress: setProgress,
          skipIfAlreadyLoaded: true,
        },
      );
      setReady(true);
    };
    loadResources();
  }, []);
  return (
    <div
      className="h-screen w-full bg-cover bg-center font-Shuriken"
      style={{ backgroundImage: `url(${splashBg})` }}
    >
      <div className="pt-10">
        <Header />
      </div>
      <div className="h-[calc(100vh-200px)] flex items-center flex-col justify-center">
        <img
          src={splashGif}
          alt="splash animation"
          className="w-120 h-120 object-contain"
        />
        <div className="flex flex-col items-center justify-center text-white">
          <h1 className="text-2xl mb-4">
            {ready
              ? "Ready"
              : "Loading Hunter X Hucker Resources..."}
          </h1>
          <div className="w-64 h-4 border border-white rounded">
            <div
              className="h-4 bg-red-600 rounded transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-2">{Math.round(progress)}%</p>
          {ready && (
            <GameButton className="mt-8" to="/welcome">
              Start
            </GameButton>
          )}
        </div>
      </div>
    </div>
  );
}
