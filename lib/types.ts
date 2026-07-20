export type Club = {
  id: string;
  name: string;
  country: string;
  logo_path: string;
};

export type GameStatus = "open" | "closed";

export type Game = {
  id: string;
  name: string;
  status: GameStatus;
  created_at: string;
};
