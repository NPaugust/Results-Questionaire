"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setCookie, getCookie, deleteCookie, getCurrentUser } from "@/lib/api/login";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  user: { first_name: string; last_name: string; court: string; role: string; court_id: string } | null; 
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  user: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthContextType['user']>(null); 
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const token = getCookie("access_token");
      if (token) {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Ошибка при проверке пользователя:", error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (token: string) => {
    setIsLoading(true);
    try {
      setCookie("access_token", token);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);

      let redirectUrl;

      if (currentUser.role === "Председатель 1 инстанции") {
        redirectUrl = "/results/Home/summary1/ratings";
      } else if (currentUser.role === "Председатель 2 инстанции") {
        redirectUrl = "/results/Home/first_instance/ratings";
      } else if (currentUser.role === "Председатель 3 инстанции") {
        redirectUrl = "/results/Home/summary/ratings";
      } else {
        redirectUrl = "/results/Home/summary/ratings";
      }

      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Ошибка при логине:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    deleteCookie("access_token");
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

function getRegionSlug(courtName: string): string {
  const regionMap: { [key: string]: string } = {
    "Таласский областной суд": "Talas",
    "Иссык-кульский областной суд": "Issyk-Kyl",
    "Нарынский областной суд": "Naryn",
    "Баткенский областной суд": "Batken",
    "Чуйский областной суд": "Chyi",
    "Ошский областной суд": "Osh",
    "Жалал-Абадский областной суд": "Djalal-Abad",
    "Бишкекский городской суд": "Bishkek",
  };

  return regionMap[courtName] || "unknown";
}