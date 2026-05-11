declare global {
  // eslint-disable-next-line no-var
  var __games: Map<string, { country: string; startedAt: number }> | undefined;
}

if (!globalThis.__games) {
  globalThis.__games = new Map();
}

const games = globalThis.__games;

export function createGame(country: string): string {
  const id = crypto.randomUUID();
  games.set(id, { country, startedAt: Date.now() });
  return id;
}

export function getCountry(gameId: string): string | null {
  const game = games.get(gameId);
  if (!game) return null;
  if (Date.now() - game.startedAt > 2 * 60 * 60 * 1000) {
    games.delete(gameId);
    return null;
  }
  return game.country;
}

export function endGame(gameId: string): string | null {
  const country = getCountry(gameId);
  games.delete(gameId);
  return country;
}
