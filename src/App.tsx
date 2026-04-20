import ButtonClickSound from "./components/ButtonClickSound";
import FullscreenCornerHint from "./components/FullscreenCornerHint";
import AppRoutes from "./routes";

export default function App() {
  return (
    <>
      <ButtonClickSound />
      <FullscreenCornerHint />
      <AppRoutes />
    </>
  );
}
