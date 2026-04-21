import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/Login";
import MainCardsPage from "../pages/Main/MainCardsPage";
import ChallengeLayout from "../pages/ChallengeLayout";
import MainHomePage from "../pages/Main/MainHomePage";
import MainLayout from "../pages/Main/MainLayout";
import MainChallengePage from "../pages/Main/MainChallengePage";
import MainNeedsPage from "../pages/Main/MainNeedsPage";
import MainScoreBoardPage from "../pages/Main/MainScoreBoardPage";
import MainStatusPage from "../pages/Main/MainStatusPage";
import MainTimerPage from "../pages/Main/MainTimerPage";
import Splash from "../pages/Splash";
import Welcome from "../pages/Welcome";
import RequireAuth from "./RequireAuth";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route
        path="/challenge"
        element={
          <RequireAuth>
            <ChallengeLayout />
          </RequireAuth>
        }
      >
        <Route index element={<MainChallengePage />} />
      </Route>
      <Route
        path="/main"
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route index element={<MainHomePage />} />
        <Route path="status" element={<MainStatusPage />} />
        <Route path="cards" element={<MainCardsPage />} />
        <Route path="score-board" element={<MainScoreBoardPage />} />
        <Route path="needs" element={<MainNeedsPage />} />
        <Route path="timer" element={<MainTimerPage />} />
      </Route>
    </Routes>
  );
}
