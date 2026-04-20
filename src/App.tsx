import ButtonClickSound from "./components/ButtonClickSound";
import FullscreenCornerHint from "./components/FullscreenCornerHint";
import IntroFlowMusic from "./components/IntroFlowMusic";
import AppRoutes from "./routes";

export default function App() {
  return (
    <>
      <ButtonClickSound />
      <IntroFlowMusic />
      <FullscreenCornerHint />
      <AppRoutes />
    </>
  );
}
