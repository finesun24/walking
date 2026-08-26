"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COLORS, inkAlpha, safeTop, safeBottom } from "@/lib/ui";

const ONBOARDING_KEY = "onboarding_v1";

const STEPS = [
  { title: ["마음에 든 장면,", "그냥 찍어두세요"] },
  { title: ["캡션은", "AI가 씁니다"] },
  { title: ["걸을수록", "내 지도가 채워져요"] },
];

function StepIllustration({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div style={{ width: 200, height: 180, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 20,
            top: 14,
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(240,131,107,0.22)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 0,
            right: 16,
            height: 2,
            background: inkAlpha(0.15),
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 26,
            transform: "translateX(-50%)",
            width: 96,
            height: 64,
            borderRadius: 14,
            background: COLORS.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "3px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#7B8FA1" }} />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 96,
            transform: "translateX(-50%)",
            width: 16,
            height: 10,
            background: COLORS.ink,
            borderRadius: "3px 3px 0 0",
          }}
        />
      </div>
    );
  }
  if (step === 1) {
    return (
      <div
        style={{
          width: 200,
          height: 180,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 140,
            height: 150,
            borderRadius: 16,
            background: "#fff",
            boxShadow: "0 6px 18px rgba(28,27,24,0.1)",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              flex: 1,
              borderRadius: 10,
              background:
                "repeating-linear-gradient(135deg,rgba(95,179,179,0.18) 0 14px,rgba(95,179,179,0.05) 14px 28px)",
            }}
          />
          <div style={{ height: 8, width: "90%", borderRadius: 4, background: inkAlpha(0.7) }} />
          <div style={{ height: 8, width: "55%", borderRadius: 4, background: inkAlpha(0.25) }} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 6,
            right: 8,
            width: 14,
            height: 14,
            background: "#E2A044",
            transform: "rotate(45deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 26,
            width: 8,
            height: 8,
            background: "#E2A044",
            transform: "rotate(45deg)",
            opacity: 0.6,
          }}
        />
      </div>
    );
  }
  return (
    <div
      style={{
        width: 200,
        height: 180,
        position: "relative",
        borderRadius: 16,
        background: "#EDEAE0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg,rgba(28,27,24,0.06) 0 1px,transparent 1px 30px),repeating-linear-gradient(90deg,rgba(28,27,24,0.06) 0 1px,transparent 1px 30px)",
        }}
      />
      {[
        { left: "35%", top: "30%", size: 16, color: "#7B8FA1" },
        { left: "65%", top: "40%", size: 20, color: "#F0836B" },
        { left: "50%", top: "62%", size: 14, color: "#5FB3B3" },
        { left: "75%", top: "68%", size: 14, color: "#E2A044" },
      ].map((pin, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: pin.left,
            top: pin.top,
            width: pin.size,
            height: pin.size,
            borderRadius: "50% 50% 50% 0",
            transform: "translate(-50%,-100%) rotate(45deg)",
            background: pin.color,
            border: "2px solid #fff",
          }}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const finish = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    router.replace("/feed");
  };

  const next = () => (step >= 2 ? finish() : setStep((s) => s + 1));

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: COLORS.paper,
      }}
    >
      <div style={{ display: "flex", justifyContent: "flex-end", padding: `${safeTop(20)} 20px 0`, flexShrink: 0 }}>
        <button
          onClick={finish}
          style={{
            background: "none",
            border: "none",
            fontSize: 14,
            fontWeight: 700,
            color: inkAlpha(0.85),
            cursor: "pointer",
          }}
        >
          건너뛰기
        </button>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          padding: "0 32px",
        }}
      >
        <StepIllustration step={step} />
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.ink, lineHeight: 1.4 }}>
            {STEPS[step].title[0]}
            <br />
            {STEPS[step].title[1]}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          padding: `0 32px ${safeBottom(28)}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              style={{
                width: i === step ? 20 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background: i === step ? COLORS.ink : inkAlpha(0.2),
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </div>
        <button
          onClick={next}
          style={{
            width: "100%",
            height: 52,
            borderRadius: 14,
            border: "none",
            background: COLORS.ink,
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {step === 2 ? "시작하기" : "다음"}
        </button>
      </div>
    </div>
  );
}
