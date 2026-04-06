import { useNavigate, useLocation } from "react-router-dom";
import { useCallback } from "react";
import { useSound } from "./use-sound";

export type AppRoute =
  | "home"
  | "games"
  | "customize"
  | "leaderboard"
  | "daily"
  | "profile"
  | "eye-check";

const ROUTE_MAP: Record<AppRoute, string> = {
  home: "/",
  games: "/games",
  customize: "/customize",
  leaderboard: "/leaderboard",
  daily: "/daily",
  profile: "/profile",
  "eye-check": "/eye-check",
};

const PATH_TO_TAB: Record<string, AppRoute> = {
  "/": "home",
  "/games": "games",
  "/customize": "customize",
  "/leaderboard": "leaderboard",
  "/daily": "daily",
  "/profile": "profile",
  "/eye-check": "eye-check",
};

export function useAppNavigate() {
  const nav = useNavigate();
  const sfx = useSound();

  const navigate = useCallback(
    (to: AppRoute) => {
      sfx("navigate");
      window.scrollTo({ top: 0, behavior: "instant" });
      nav(ROUTE_MAP[to]);
    },
    [nav, sfx],
  );

  return navigate;
}

export function useActiveTab(): AppRoute {
  const { pathname } = useLocation();
  return PATH_TO_TAB[pathname] ?? "home";
}
