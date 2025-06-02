"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { loginApi } from "@/lib/api/login";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import logo from "../../../public/logo.webp";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import dynamic from "next/dynamic";

const User = dynamic(() => import("lucide-react").then(mod => mod.User), { ssr: false });
const KeyRound = dynamic(() => import("lucide-react").then(mod => mod.KeyRound), { ssr: false });
const TriangleAlert = dynamic(() => import("lucide-react").then(mod => mod.TriangleAlert), { ssr: false });
const Eye = dynamic(() => import("lucide-react").then(mod => mod.Eye), { ssr: false });
const EyeOff = dynamic(() => import("lucide-react").then(mod => mod.EyeOff), { ssr: false });

const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  const { language, toggleLanguage, getTranslation } = useLanguage();
  const { login } = useAuth();
  const router = useRouter();
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setIsPageLoaded(true);
    const timer = setTimeout(() => {
      usernameInputRef.current?.focus();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError(null);
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!credentials.username || !credentials.password) {
      setError(getTranslation("LoginForm_EmptyFields"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await loginApi.login({
        username: credentials.username,
        password: credentials.password,
      });

      if (result && result.access) {
        await login(result.access);
        router.push("/Home/summary/ratings");
      } else {
        setError(getTranslation("LoginForm_NoToken") || "Access токен отсутствует в ответе");
      }
    } catch (err) {
      console.error("Ошибка:", err);
      setError(err instanceof Error ? err.message : getTranslation("LoginForm_Error") || "Ошибка при входе");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !isLoading) {
        formRef.current?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
      }
    },
    [isLoading]
  );

  const scrollStyle: React.CSSProperties = {
    overflowY: "auto",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div
      style={scrollStyle}
      className={`bg-gradient-to-br from-slate-100 to-slate-200 transition-opacity duration-500 ease-in-out ${
        isPageLoaded ? "opacity-100" : "opacity-0"
      }`}
      data-testid="login-form-container"
    >

      {/* Переключатель языка */}
      <div className="absolute top-2 right-2 flex animate-fadeIn">
        <div className="bg-blue-100/50 backdrop-blur-sm rounded-md border border-blue-200/50 shadow-sm flex">
          <button
            onClick={toggleLanguage}
            aria-label={language === "ru" ? "Переключить на кыргызский" : "Переключить на русский"}
            className={`px-2 py-1 text-xs font-semibold transition-all duration-200 ${
              language === "ru" ? "bg-blue-800 text-sky-50" : "text-sky-700 hover:bg-blue-400/50"
            }`}
          >
            RU
          </button>
          <button
            onClick={toggleLanguage}
            aria-label={language === "ky" ? "Переключить на русский" : "Переключить на кыргызский"}
            className={`px-2 py-1 text-xs font-semibold transition-all duration-200 ${
              language === "ky" ? "bg-blue-800 text-sky-50" : "text-sky-700 hover:bg-blue-400/50"
            }`}
          >
            KY
          </button>
        </div>
      </div>

      {/* Основной контент - форма входа */}
      <div className="flex-grow flex items-center justify-center py-4 px-4">
        <div className="w-full max-w-sm">
          <div className="relative bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50">
            <div className="text-center mb-4">
              <div className="flex justify-center mb-3">
                <Image
                  src={logo}
                  alt="Логотип"
                  width={80}
                  height={80}
                  className="rounded-lg"
                  priority
                />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                {getTranslation("LoginForm_LoginTitle")}
              </h2>
              <p className="text-gray-500 text-xs">
                {getTranslation("LoginForm_LoginSubtitle")}
              </p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" onKeyDown={handleKeyDown}>
              <div>
                <label
                  htmlFor="username"
                  className="text-xs font-medium text-gray-700 block mb-1 transition-all duration-200 hover:text-blue-600"
                >
                  {getTranslation("LoginForm_Username")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    id="username"
                    ref={usernameInputRef}
                    type="text"
                    name="username"
                    value={credentials.username}
                    onChange={handleInputChange}
                    autoComplete="username"
                    onFocus={(e) => e.target.setAttribute("placeholder", "")}
                    onBlur={(e) => e.target.setAttribute("placeholder", getTranslation("LoginForm_Username"))}
                    placeholder={getTranslation("LoginForm_Username")}
                    className="text-sm bg-gray-50 border border-gray-300 rounded-lg w-full pl-9 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-gray-700 block mb-1 transition-all duration-200 hover:text-blue-600"
                >
                  {getTranslation("LoginForm_Password")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <KeyRound className="w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={credentials.password}
                    onChange={handleInputChange}
                    autoComplete="current-password"
                    onFocus={(e) => e.target.setAttribute("placeholder", "")}
                    onBlur={(e) => e.target.setAttribute("placeholder", getTranslation("LoginForm_Password"))}
                    placeholder={getTranslation("LoginForm_Password")}
                    className="text-sm bg-gray-50 border border-gray-300 rounded-lg w-full pl-9 pr-9 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200"
                    required
                    aria-required="true"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-all duration-200"
                  >
                    {showPassword ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="p-3 rounded-lg text-xs bg-red-50 border-l-4 border-red-500 text-red-600 flex items-center"
                >
                  <TriangleAlert className="w-4 h-4 mr-2 flex-shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                aria-label={isLoading ? getTranslation("LoginForm_Loading") : getTranslation("LoginForm_LoginButton")}
                className="w-full py-2.5 px-4 rounded-lg text-sm text-white font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>{getTranslation("LoginForm_Loading")}</span>
                  </div>
                ) : (
                  getTranslation("LoginForm_LoginButton")
                )}
              </button>

              <div className="text-center text-xs text-gray-500">
                {getTranslation("LoginForm_HelpText")}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* CSS для анимаций (упрощены для мобильных) */}
      <style jsx global>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          0% {
            transform: translateY(10px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.4s forwards;
        }

        /* Медиа-запросы для адаптивности */
        @media (max-width: 640px) {
          .max-w-sm {
            max-width: 100%;
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .rounded-xl {
            border-radius: 0.75rem;
          }

          .p-6 {
            padding: 1.25rem;
          }

          .text-xl {
            font-size: 1.125rem;
            line-height: 1.75rem;
          }

          .text-sm {
            font-size: 0.875rem;
            line-height: 1.25rem;
          }

          .text-xs {
            font-size: 0.75rem;
            line-height: 1rem;
          }

          .mb-4 {
            margin-bottom: 0.75rem;
          }

          .mb-3 {
            margin-bottom: 0.5rem;
          }

          .mb-1 {
            margin-bottom: 0.25rem;
          }

          .py-2\.5 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }

          .p-2\.5 {
            padding: 0.5rem;
          }

          .w-4 {
            width: 0.875rem;
            height: 0.875rem;
          }

          .space-y-4 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 0.75rem;
          }

          .top-2 {
            top: 0.5rem;
          }

          .right-2 {
            right: 0.5rem;
          }

          .px-2 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }

          .py-1 {
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
          }
        }

        @media (max-width: 400px) {
          .max-w-sm {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }

          .text-xl {
            font-size: 1rem;
          }

          .text-sm {
            font-size: 0.75rem;
          }

          .text-xs {
            font-size: 0.625rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginForm;