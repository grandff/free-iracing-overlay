// ponytail: re-export Leaderboard for compatibility
import { Component } from "solid-js";
import { Leaderboard, LeaderboardProps } from "../widgets/Leaderboard.tsx";

export const F1TimingTower: Component<LeaderboardProps> = (props) => {
  return <Leaderboard {...props} />;
};

export { Leaderboard };
export type { LeaderboardProps };
