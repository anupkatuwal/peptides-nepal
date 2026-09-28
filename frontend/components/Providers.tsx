"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { apiFetch } from "@/lib/api";
import type { CartLine, TokenResponse, User } from "@/lib/types";

const TOKEN_KEY = "pn_token";
const CART_KEY = "pn_cart";

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* private mode or storage blocked: the session just won't persist */
  }
}

// --- Auth -------------------------------------------------------------------

type AuthState = {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (fullName: string, email: string, password: string) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Restore the session and check the token is still valid.
  useEffect(() => {
    const saved = readStorage(TOKEN_KEY);
    if (!saved) {
      setReady(true);
      return;
    }
    apiFetch<User>("/api/auth/me", { token: saved })
      .then((u) => {
        setToken(saved);
        setUser(u);
      })
      .catch(() => writeStorage(TOKEN_KEY, null))
      .finally(() => setReady(true));
  }, []);

  const accept = useCallback((res: TokenResponse) => {
    writeStorage(TOKEN_KEY, res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  }, []);

  const login = useCallback(
    async (email: string, password: string) =>
      accept(await apiFetch<TokenResponse>("/api/auth/login", { method: "POST", body: { email, password } })),
    [accept],
  );

  const register = useCallback(
    async (fullName: string, email: string, password: string) =>
      accept(
        await apiFetch<TokenResponse>("/api/auth/register", {
          method: "POST",
          body: { full_name: fullName, email, password },
        }),
      ),
    [accept],
  );

  const logout = useCallback(() => {
    writeStorage(TOKEN_KEY, null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, token, ready, login, register, logout }), [user, token, ready, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <Providers>");
  return ctx;
}

// --- Cart -------------------------------------------------------------------

type CartState = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartState | null>(null);

const MAX_PER_LINE = 20; // matches the API's per-line limit

function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(readStorage(CART_KEY) ?? "[]");
      if (Array.isArray(saved)) setLines(saved);
    } catch {
      /* corrupt cart: start empty */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) writeStorage(CART_KEY, JSON.stringify(lines));
  }, [lines, loaded]);

  const add = useCallback((line: Omit<CartLine, "quantity">, quantity = 1) => {
    setLines((prev) => {
      const cap = Math.min(line.maxQuantity, MAX_PER_LINE);
      const existing = prev.find((l) => l.productId === line.productId);
      if (existing) {
        return prev.map((l) =>
          l.productId === line.productId ? { ...l, ...line, quantity: Math.min(l.quantity + quantity, cap) } : l,
        );
      }
      return [...prev, { ...line, quantity: Math.min(quantity, cap) }];
    });
  }, []);

  const setQuantity = useCallback((productId: number, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.productId === productId
            ? { ...l, quantity: Math.max(0, Math.min(quantity, l.maxQuantity, MAX_PER_LINE)) }
            : l,
        )
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const remove = useCallback((productId: number) => setLines((prev) => prev.filter((l) => l.productId !== productId)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, add, setQuantity, remove, clear],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <Providers>");
  return ctx;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
