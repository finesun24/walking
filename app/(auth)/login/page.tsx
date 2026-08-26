"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { COLORS, inkAlpha, safeTop } from "@/lib/ui";

type AuthMode = "login" | "signup";
type AuthStatus = "idle" | "error" | "loading";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async () => {
    if (!email.trim() || !password.trim()) {
      setStatus("error");
      setErrorMsg("이메일과 비밀번호를 입력해주세요");
      return;
    }
    if (!isValidEmail(email)) {
      setStatus("error");
      setErrorMsg("이메일 형식을 확인해주세요");
      return;
    }
    if (password.length < 6) {
      setStatus("error");
      setErrorMsg("비밀번호는 6자 이상이어야 해요");
      return;
    }

    setStatus("loading");
    const supabase = createClient();
    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (error) {
      setStatus("error");
      setErrorMsg(
        mode === "login" ? "이메일 또는 비밀번호가 올바르지 않아요" : error.message
      );
      return;
    }

    setStatus("idle");
    router.replace("/");
  };

  const emailBorder =
    status === "error" && !email.trim() ? COLORS.error : inkAlpha(0.15);
  const passBorder =
    status === "error" && !password.trim() ? COLORS.error : inkAlpha(0.15);

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: COLORS.paper,
      }}
    >
      <div style={{ padding: `${safeTop(40)} 28px 0`, flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.ink, textAlign: "center" }}>
          동네수집
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 16,
          padding: "24px 28px 60px",
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: COLORS.ink,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          {mode === "login" ? "로그인" : "회원가입"}
        </div>

        <input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus("idle");
          }}
          placeholder="이메일"
          style={{
            height: 50,
            borderRadius: 12,
            border: `1.5px solid ${emailBorder}`,
            padding: "0 14px",
            fontSize: 15,
            color: COLORS.ink,
            background: "#fff",
          }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setStatus("idle");
          }}
          placeholder="비밀번호"
          style={{
            height: 50,
            borderRadius: 12,
            border: `1.5px solid ${passBorder}`,
            padding: "0 14px",
            fontSize: 15,
            color: COLORS.ink,
            background: "#fff",
          }}
        />

        {status === "error" && (
          <div style={{ fontSize: 12.5, color: COLORS.error, fontWeight: 600, marginTop: -4 }}>
            {errorMsg}
          </div>
        )}

        <button
          onClick={submit}
          disabled={status === "loading"}
          style={{
            height: 52,
            borderRadius: 14,
            border: "none",
            background: COLORS.ink,
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            opacity: status === "loading" ? 0.75 : 1,
          }}
        >
          {status === "loading" && (
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: "2.5px solid rgba(255,255,255,0.35)",
                borderTopColor: "#fff",
                animation: "spin 0.7s linear infinite",
              }}
            />
          )}
          {status !== "loading" && (mode === "login" ? "로그인" : "가입하기")}
        </button>

        <button
          onClick={() => {
            setMode((m) => (m === "login" ? "signup" : "login"));
            setStatus("idle");
          }}
          style={{
            background: "none",
            border: "none",
            fontSize: 13.5,
            color: inkAlpha(0.6),
            cursor: "pointer",
            textAlign: "center",
            padding: 6,
          }}
        >
          {mode === "login" ? "계정이 없으신가요? 가입하기" : "이미 계정이 있으신가요? 로그인"}
        </button>
      </div>
    </div>
  );
}
