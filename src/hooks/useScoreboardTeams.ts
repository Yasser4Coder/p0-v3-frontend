import { useCallback, useEffect, useState } from "react";
import { getScoreboardSocket } from "../lib/scoreboardSocket";
import { apiClient } from "../lib/api/client";
import { toApiError } from "../lib/api/errors";
import type { ScoreboardTeam } from "../types/scoreboard";

/** Set to `false` to use `/api/leaderboard/teams` and socket `teams:update` again. */
const USE_STATIC_SCOREBOARD = true;

/** Snapshot of team leaderboard (frozen; order preserved). */
const FROZEN_LEADERBOARD_TEAMS: ScoreboardTeam[] = [
  { id: "20", name: "Paranoid Android", totalScore: 6671 },
  { id: "14", name: "Zero Day", totalScore: 6612 },
  { id: "15", name: "Dev-x", totalScore: 6118 },
  { id: "18", name: "Dahman", totalScore: 6060 },
  { id: "16", name: "#1", totalScore: 5613 },
  { id: "21", name: "Double Six", totalScore: 5303 },
  { id: "19", name: "Chaos", totalScore: 5247 },
  { id: "12", name: "TRT ONE", totalScore: 4936 },
  { id: "22", name: "Post-Rose Meruem", totalScore: 4671 },
  { id: "13", name: "EcoTech", totalScore: 4497 },
  { id: "17", name: "BX0", totalScore: 3827 },
  { id: "23", name: "UGANDA", totalScore: 1415 },
  { id: "11", name: "t3.3", totalScore: 200 },
  { id: "10", name: "t3.2", totalScore: 0 },
];

const DEMO_TEAMS: ScoreboardTeam[] = [
  { _id: "1", name: "ELEC TEAM", totalScore: 420 },
  { _id: "2", name: "HUNTERS", totalScore: 380 },
  { _id: "3", name: "PHANTOM", totalScore: 355 },
  { _id: "4", name: "NEXUS", totalScore: 310 },
  { _id: "5", name: "VOID RUNNERS", totalScore: 265 },
];

type TeamLeaderboardResponse =
  | {
      success: true;
      message: string;
      data: Array<{
        id: number;
        name: string;
        members_count: number;
        track_name: string | null;
        total_score: string;
      }>;
    }
  | { success: false; message: string; data: null };

export function useScoreboardTeams(_myTeamName: string) {
  const [teams, setTeams] = useState<ScoreboardTeam[]>(() =>
    USE_STATIC_SCOREBOARD
      ? FROZEN_LEADERBOARD_TEAMS.map((t) => ({ ...t }))
      : [],
  );
  const [loading, setLoading] = useState(() => !USE_STATIC_SCOREBOARD);
  const [error, setError] = useState<string | null>(null);

  const applyServerOrder = useCallback((next: ScoreboardTeam[]) => {
    setTeams(next);
    return next;
  }, []);

  useEffect(() => {
    if (USE_STATIC_SCOREBOARD) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<TeamLeaderboardResponse>(
          "/api/leaderboard/teams",
        );
        const payload = res.data;

        if (!payload?.success || !Array.isArray(payload.data)) {
          throw new Error(payload?.message ?? "Could not load teams.");
        }

        const normalized: ScoreboardTeam[] = payload.data.map((t) => ({
          id: String(t.id),
          name: t.name,
          totalScore: Number(t.total_score) || 0,
        }));

        if (!cancelled) applyServerOrder(normalized);
      } catch (e) {
        const msg = toApiError(e).message;
        if (!cancelled) {
          setError(msg);
          applyServerOrder(DEMO_TEAMS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [applyServerOrder]);

  useEffect(() => {
    if (USE_STATIC_SCOREBOARD) return;
    const s = getScoreboardSocket();
    if (!s) return;

    const onUpdate = (updatedTeam: ScoreboardTeam) => {
      setTeams((prev) => {
        const copy = [...prev];
        const id = updatedTeam._id ?? updatedTeam.id;
        const idx = copy.findIndex(
          (t) => t._id === id || t.id === id || t.name === updatedTeam.name,
        );
        if (idx !== -1) {
          copy[idx] = { ...copy[idx], ...updatedTeam, totalScore: Number(updatedTeam.totalScore) || 0 };
        } else {
          copy.push({
            _id: id,
            name: updatedTeam.name,
            totalScore: Number(updatedTeam.totalScore) || 0,
          });
        }
        // Keep server ordering as much as possible; append new teams to the end.
        return copy;
      });
    };

    s.on("teams:update", onUpdate);
    return () => {
      s.off("teams:update", onUpdate);
    };
  }, []);

  return { teams, loading, error };
}
