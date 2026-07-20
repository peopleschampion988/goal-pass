export type Club = {
  id: string;
  name: string;
  country: string;
  logo_path: string;
};

export type Position = "GK" | "DF" | "MF" | "FW";

export type Player = {
  id: string;
  name: string;
  position: Position;
  country: string;
  club: string;
  rank: number;
  photo_path: string | null;
};

export type GameStatus = "open" | "closed";
export type GameKind = "clubs" | "players";

export type Game = {
  id: string;
  name: string;
  status: GameStatus;
  kind: GameKind;
  position: Position | null;
  created_at: string;
};

// What the knockout game actually renders — a club or a player.
export type Contender = {
  id: string;
  name: string;
  imageSrc: string | null; // null => initials avatar
  subtitle: string;
};
