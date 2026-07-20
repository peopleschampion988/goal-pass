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

// Tiny template helper: format("Hi {name}", { name: "Sam" }) => "Hi Sam".
export function format(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

// Falls back to the other language so a game never renders nameless.
export function gameName(game: { name_en: string; name_ru: string }, locale: Locale): string {
  return (locale === "ru" ? game.name_ru : game.name_en) || game.name_en || game.name_ru;
}

export const words = {
  clubs: { en: ["club", "clubs"], ru: ["клуб", "клуба", "клубов"] },
  players: { en: ["player", "players"], ru: ["игрок", "игрока", "игроков"] },
  plays: { en: ["play", "plays"], ru: ["игра", "игры", "игр"] },
  points: { en: ["point", "points"], ru: ["очко", "очка", "очков"] },
} satisfies Record<string, PluralForms>;

const en = {
  meta: {
    title: "Club Duels",
    description: "Pick your favorite football club, duel by duel",
  },
  errors: {
    invalidIds: "Invalid ids.",
    gameNotFound: "Game not found.",
    gameClosed: "This game is closed.",
    unknownContender: "Unknown contender.",
    adminNotConfigured: "ADMIN_PASSWORD is not configured on the server.",
    wrongPassword: "Wrong password.",
    nameRequired: "Enter the game name in both languages.",
    invalidKind: "Invalid game type.",
    invalidPosition: "Invalid position.",
  },
  share: {
    share: "Share",
    copied: "Link copied!",
    championText: 'My champion in "{game}" — {name}! Pick yours:',
  },
  kinds: { clubs: "Clubs", players: "Players" },
  positions: { GK: "Goalkeepers", DF: "Defenders", MF: "Midfielders", FW: "Forwards" },
  position: { GK: "Goalkeeper", DF: "Defender", MF: "Midfielder", FW: "Forward" },
  nav: { games: "Games", leaderboard: "Leaderboard", menu: "Menu", language: "Language" },
  footer: "One finished game · one point for the champion",
  home: {
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
    playersSub: "The best players by position — switch tabs to see each role.",
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
    gameNameEn: "Game name — English",
    gameNameEnPlaceholder: "e.g. Champions of Europe",
    gameNameRu: "Game name — Russian",
    gameNameRuPlaceholder: "e.g. Чемпионы Европы",
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
  meta: {
    title: "Клубные дуэли",
    description: "Выбирай любимый футбольный клуб, дуэль за дуэлью",
  },
  errors: {
    invalidIds: "Неверные идентификаторы.",
    gameNotFound: "Игра не найдена.",
    gameClosed: "Эта игра закрыта.",
    unknownContender: "Неизвестный участник.",
    adminNotConfigured: "ADMIN_PASSWORD не настроен на сервере.",
    wrongPassword: "Неверный пароль.",
    nameRequired: "Укажи название игры на обоих языках.",
    invalidKind: "Неверный тип игры.",
    invalidPosition: "Неверная позиция.",
  },
  share: {
    share: "Поделиться",
    copied: "Ссылка скопирована!",
    championText: "Мой чемпион в «{game}» — {name}! Выбери своего:",
  },
  kinds: { clubs: "Клубы", players: "Игроки" },
  positions: { GK: "Вратари", DF: "Защитники", MF: "Полузащитники", FW: "Нападающие" },
  position: { GK: "Вратарь", DF: "Защитник", MF: "Полузащитник", FW: "Нападающий" },
  nav: { games: "Игры", leaderboard: "Лидеры", menu: "Меню", language: "Язык" },
  footer: "Одна завершённая игра · одно очко чемпиону",
  home: {
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
    playersSub: "Лучшие игроки по позициям — переключай вкладки, чтобы увидеть каждую роль.",
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
    gameNameEn: "Название игры — английское",
    gameNameEnPlaceholder: "напр. Champions of Europe",
    gameNameRu: "Название игры — русское",
    gameNameRuPlaceholder: "напр. Чемпионы Европы",
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
