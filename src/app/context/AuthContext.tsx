// context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  username: string;
  id?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userObj: User) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
});

// ⏱️ Tiempo de inactividad antes de cerrar sesión (ej: 15 minutos)
const INACTIVITY_TIMEOUT = 1000 * 60 * 15; // 15 minutos

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  let inactivityTimer: NodeJS.Timeout;

  // ✅ Reinicia el temporizador
  const resetTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_TIMEOUT);
  };

  // ✅ Cierra sesión y limpia
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    router.push("/login");
  };

  // ✅ Inicia escucha de eventos al montar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 🔄 Reinicia el temporizador al haber actividad
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, true);
    });

    // ✅ Inicia el temporizador al cargar
    resetTimer();

    // 🔚 Limpieza al desmontar
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer, true);
      });
    };
  }, []);

  const login = async (userObj: User) => {
    setUser(userObj);
    localStorage.setItem("user", JSON.stringify(userObj));
    resetTimer(); // ✅ Reinicia el temporizador al iniciar sesión
    router.push("/");
  };

  const logout = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    handleLogout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);