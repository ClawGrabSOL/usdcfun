// Store launched tokens in localStorage

export interface LaunchedToken {
  mint: string;
  name: string;
  symbol: string;
  image: string;
  creator: string;
  txSignature: string;
  launchedAt: number;
}

const STORAGE_KEY = "molt_launched_tokens";

export function saveToken(token: LaunchedToken): void {
  if (typeof window === "undefined") return;
  
  const existing = getTokens();
  const updated = [token, ...existing.filter(t => t.mint !== token.mint)];
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getTokens(): LaunchedToken[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getToken(mint: string): LaunchedToken | null {
  const tokens = getTokens();
  return tokens.find(t => t.mint === mint) || null;
}
