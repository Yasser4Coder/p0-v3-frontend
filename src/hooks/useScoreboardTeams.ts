import { useCallback, useEffect, useState } from "react";
import { getScoreboardSocket } from "../lib/scoreboardSocket";
import { apiClient } from "../lib/api/client";
import { toApiError } from "../lib/api/errors";
import type { ScoreboardTeam } from "../types/scoreboard";

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
  const [teams, setTeams] = useState<ScoreboardTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyServerOrder = useCallback((next: ScoreboardTeam[]) => {
    setTeams(next);
    return next;
  }, []);

  useEffect(() => {
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
