"use client";
import React, { ComponentType, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCookie,
  deleteCookie,
  isTokenExpired,
  reLogin,
} from "@/lib/api/login";

export const withAuth = (WrappedComponent: ComponentType) => {
  return function AuthenticatedComponent(props: any) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        let accessToken = getCookie("access_token");
        const refreshToken = getCookie("refresh_token");

        if (!accessToken || isTokenExpired(accessToken)) {
          if (refreshToken) {
            const newAccessToken = await reLogin(refreshToken);
            if (newAccessToken) {
              accessToken = newAccessToken;
              setIsAuthenticated(true);
              return;
            }
          }

          deleteCookie("access_token");
          deleteCookie("refresh_token");

          const pathname = window.location.pathname;
          let loginPath = "/login";

          if (pathname.startsWith("/results")) {
            loginPath = "/results/login";
          } else if (pathname.includes("/results/")) {
            const parts = pathname.split("/results/");
            loginPath = parts[0] + "/results/login";
          }

          window.location.href = window.location.origin + loginPath;
        } else {
          setIsAuthenticated(true);
        }
      };

      checkAuth();
    }, [router]);

    if (!isAuthenticated) {
      return (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10000,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #2563eb",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                margin: "0 auto",
                animation: "spin 1s linear infinite",
              }}
            />
            <style jsx>{`
              @keyframes spin {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
            `}</style>
            <p style={{ marginTop: "10px", color: "#2563eb" }}>Загрузка...</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};
