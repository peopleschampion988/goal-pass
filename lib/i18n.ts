export type Locale = "en" | "ru";

export const locales: Locale[] = ["en", "ru"];

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "ru";
}

type PluralForms = {
  en: [one: string, other: string];
  ru: [one: string, few: string, many: string];
};

// "5 очков", "2 очка", "1 point" — Russian needs three plural forms.
export function plural(locale: Locale, n: number, forms: PluralForms): string {
  if (locale === "en") return `${n} ${n === 1 ? forms.en[0] : forms.en[1]}`;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} ${forms.ru[0]}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} ${forms.ru[1]}`;
  return `${n} ${forms.ru[2]}`;
}

export const words = {
  clubs: { en: ["club", "clubs"], ru: ["клуб", "клуба", "клубов"] },
  players: { en: ["player", "players"], ru: ["игрок", "игрока", "игроков"] },
  plays: { en: ["play", "plays"], ru: ["игра", "игры", "игр"] },
  points: { en: ["point", "points"], ru: ["очко", "очка", "очков"] },
} satisfies Record<string, PluralForms>;

const en = {
  kinds: { clubs: "Clubs", players: "Players" },
  positions: { GK: "Goalkeepers", DF: "Defenders", MF: "Midfielders", FW: "Forwards" },
  position: { GK: "Goalkeeper", DF: "Defender", MF: "Midfielder", FW: "Forward" },
  nav: { games: "Games", leaderboard: "Leaderboard", menu: "Menu", language: "Language" },
  footer: "One finished game · one point for the champion",
  home: {
    title: "Who's your club?",
    sub: "Two clubs at a time — tap the one you love more. Your pick stays on until it falls, and the last club standing scores the point.",
    openGames: "Open games",
    empty: "No open games right now — check back soon.",
    play: "Play",
    leaderboard: "🏆 Leaderboard",
    loadError: "Could not load games:",
  },
  play: {
    back: "← All games",
    eyebrow: "Knockout gauntlet",
    duel: "Duel",
    tap: "Tap the club you prefer — the winner stays on.",
    champion: "Your champion",
    counting: "Adding the point…",
    counted: "Point added to the leaderboard.",
    submitError: "Could not add the point:",
    retry: "Try again",
    viewLeaderboard: "View leaderboard",
    backToGames: "Back to games",
  },
  leaderboard: {
    back: "← All games",
    title: "Leaderboard",
    sub: "Every finished game crowns a champion — the champion scores a point.",
    playersSub: "Player points grouped by position — the best in each role rise to the top.",
    allPositions: "All positions",
    tabClubs: "Clubs",
    tabPlayers: "Players",
    loadError: "Could not load the leaderboard:",
  },
  admin: {
    staffOnly: "Staff only",
    title: "Admin · Games",
    newGame: "+ New game",
    logout: "Log out",
    empty: "No games yet — create the first one.",
    close: "Close game",
    reopen: "Reopen game",
    open: "open",
    closed: "closed",
    back: "← All games",
    newGameTitle: "New game",
    gameName: "Game name",
    gameNamePlaceholder: "e.g. Champions of Europe",
    kindLabel: "Game type",
    positionLabel: "Position",
    positionAll: "All positions",
    clubsLabel: "Clubs",
    playersLabel: "Players",
    allClubsNote: "Every club game includes all clubs.",
    allPlayersNote: "The game includes every player of the chosen position.",
    create: "Create game",
    creating: "Creating…",
    loadGamesError: "Could not load games:",
    loadClubsError: "Could not load clubs:",
  },
  login: {
    staffOnly: "Staff only",
    title: "Admin access",
    password: "Admin password",
    signIn: "Sign in",
    signingIn: "Signing in…",
    back: "← Back to games",
  },
};

const ru: typeof en = {
  kinds: { clubs: "Клубы", players: "Игроки" },
  positions: { GK: "Вратари", DF: "Защитники", MF: "Полузащитники", FW: "Нападающие" },
  position: { GK: "Вратарь", DF: "Защитник", MF: "Полузащитник", FW: "Нападающий" },
  nav: { games: "Игры", leaderboard: "Лидеры", menu: "Меню", language: "Язык" },
  footer: "Одна завершённая игра · одно очко чемпиону",
  home: {
    title: "Кто твой клуб?",
    sub: "Два клуба за раз — выбирай тот, что тебе ближе. Твой выбор остаётся в игре, пока не проиграет, а последний клуб получает очко.",
    openGames: "Открытые игры",
    empty: "Сейчас нет открытых игр — загляни позже.",
    play: "Играть",
    leaderboard: "🏆 Таблица лидеров",
    loadError: "Не удалось загрузить игры:",
  },
  play: {
    back: "← Все игры",
    eyebrow: "Игра на вылет",
    duel: "Дуэль",
    tap: "Выбери клуб, который тебе ближе — победитель остаётся.",
    champion: "Твой чемпион",
    counting: "Засчитываем очко…",
    counted: "Очко добавлено в таблицу лидеров.",
    submitError: "Не удалось засчитать очко:",
    retry: "Попробовать ещё раз",
    viewLeaderboard: "Таблица лидеров",
    backToGames: "К играм",
  },
  leaderboard: {
    back: "← Все игры",
    title: "Таблица лидеров",
    sub: "Каждая завершённая игра приносит чемпиону одно очко.",
    playersSub: "Очки игроков сгруппированы по позициям — лучшие в каждой роли наверху.",
    allPositions: "Все позиции",
    tabClubs: "Клубы",
    tabPlayers: "Игроки",
    loadError: "Не удалось загрузить таблицу лидеров:",
  },
  admin: {
    staffOnly: "Для организаторов",
    title: "Админ · Игры",
    newGame: "+ Новая игра",
    logout: "Выйти",
    empty: "Игр пока нет — создай первую.",
    close: "Закрыть игру",
    reopen: "Открыть снова",
    open: "открыта",
    closed: "закрыта",
    back: "← Все игры",
    newGameTitle: "Новая игра",
    gameName: "Название игры",
    gameNamePlaceholder: "напр. Чемпионы Европы",
    kindLabel: "Тип игры",
    positionLabel: "Позиция",
    positionAll: "Все позиции",
    clubsLabel: "Клубы",
    playersLabel: "Игроки",
    allClubsNote: "В каждой клубной игре участвуют все клубы.",
    allPlayersNote: "В игре участвуют все игроки выбранной позиции.",
    create: "Создать игру",
    creating: "Создаём…",
    loadGamesError: "Не удалось загрузить игры:",
    loadClubsError: "Не удалось загрузить клубы:",
  },
  login: {
    staffOnly: "Для организаторов",
    title: "Вход для админа",
    password: "Пароль админа",
    signIn: "Войти",
    signingIn: "Входим…",
    back: "← К играм",
  },
};

export type Dict = typeof en;

const dictionaries: Record<Locale, Dict> = { en, ru };

export function getDict(locale: Locale): Dict {
  return dictionaries[locale];
}
