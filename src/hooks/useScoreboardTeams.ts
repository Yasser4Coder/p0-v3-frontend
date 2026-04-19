import { useCallback, useEffect, useState } from "react";
import { getScoreboardSocket } from "../lib/scoreboardSocket";
import type { ScoreboardTeam } from "../types/scoreboard";

const DEMO_TEAMS: ScoreboardTeam[] = [
  { _id: "1", name: "ELEC TEAM", totalScore: 420 },
  { _id: "2", name: "HUNTERS", totalScore: 380 },
  { _id: "3", name: "PHANTOM", totalScore: 355 },
  { _id: "4", name: "NEXUS", totalScore: 310 },
  { _id: "5", name: "VOID RUNNERS", totalScore: 265 },
];

function sortTeams(list: ScoreboardTeam[]) {
  return [...list].sort((a, b) => b.totalScore - a.totalScore);
}

function syncLocalRank(sorted: ScoreboardTeam[], myTeamName: string) {
  const idx = sorted.findIndex((t) => t.name === myTeamName);
  if (idx !== -1) {
    localStorage.setItem("teamRank", String(idx + 1));
    localStorage.setItem("teamPoints", String(sorted[idx].totalScore));
  }
}

export function useScoreboardTeams(myTeamName: string) {
  const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

  const [teams, setTeams] = useState<ScoreboardTeam[]>(() =>
    apiBase ? [] : sortTeams(DEMO_TEAMS),
  );
  const [loading, setLoading] = useState(() => Boolean(apiBase));
  const [error, setError] = useState<string | null>(null);

  const applySorted = useCallback((next: ScoreboardTeam[]) => {
    const sorted = sortTeams(next);
    setTeams(sorted);
    return sorted;
  }, []);

  useEffect(() => {
    if (!apiBase) return;

    let cancelled = false;
    const base = apiBase;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${base}/teams`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as unknown;
        const list = Array.isArray(data) ? data : (data as { teams?: ScoreboardTeam[] }).teams;
        if (!Array.isArray(list) || !list.length) {
          if (!cancelled) applySorted(DEMO_TEAMS);
        } else {
          const normalized: ScoreboardTeam[] = list.map((t: ScoreboardTeam) => ({
            _id: t._id ?? t.id,
            id: t.id ?? t._id,
            name: t.name,
            totalScore: Number(t.totalScore) || 0,
          }));
          if (!cancelled) applySorted(normalized);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load teams; showing demo data.");
          applySorted(DEMO_TEAMS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [apiBase, applySorted]);

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
        return sortTeams(copy);
      });
    };

    s.on("teams:update", onUpdate);
    return () => {
      s.off("teams:update", onUpdate);
    };
  }, []);

  useEffect(() => {
    if (teams.length) syncLocalRank(teams, myTeamName);
  }, [teams, myTeamName]);

  return { teams, loading, error };
}
