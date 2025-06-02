"use client";
import React from "react";
import LoginForm from "@/components/layout/LoginForm";
import "@/styles/loading.css";

export default function LoginPage() {
  return (
    <div className="login-container">
      <LoginForm />
    </div>
  );
}