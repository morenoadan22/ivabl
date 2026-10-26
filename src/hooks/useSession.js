import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";

export function useSession() {
  const [user, setUser] = useState(undefined);

  const refresh = useCallback(async () => {
    try {
      const me = await api.me();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onUnauthorized = () => setUser(null);
    window.addEventListener("ivabl:unauthorized", onUnauthorized);
    return () => window.removeEventListener("ivabl:unauthorized", onUnauthorized);
  }, [refresh]);

  const login = useCallback(async (name, code) => {
    const me = await api.login(name, code);
    setUser({ id: me.id, name: me.name, role: me.role });
    return me;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return { user, login, logout, refresh };
}
