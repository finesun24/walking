import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PHOTO_BUCKET } from "@/lib/storage";
import { isMood, MOOD_ORDER } from "@/lib/moods";
import { deriveSeason, deriveTimeOfDay, deriveWeekdayKorean } from "@/lib/datetime";

export const runtime = "nodejs";
export const maxDuration = 30;

const GEMINI_ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

interface GeminiResult {
  caption: string;
  tags: string[];
  mood: string;
}

function buildPrompt(season: string, timeOfDay: string, weekday: string, userNote: string | null) {
  return `너는 산책 중 찍은 사진에 짧은 한국어 캡션을 붙이는 역할이다.

[입력 정보]
- 계절: ${season}
- 시간대: ${timeOfDay}
- 요일: ${weekday}요일
${userNote ? `- 사용자가 남긴 한 줄: "${userNote}" (이 감정을 최우선으로 반영할 것)` : ""}

[지킬 것]
- caption은 1~2문장, 40자 내외
- 평서형(~다) 또는 명사형 종결. 존댓말 금지
- 계절과 시간대를 문장에 자연스럽게 녹일 것 (나열하지 말 것)
- tags는 3~5개, 각 6자 이내 한국어 명사. 대상(예: 골목·하늘·담벼락) + 상태/분위기(예: 비온뒤·해질녘·한적함)
- mood는 다음 8개 중 정확히 하나: ${MOOD_ORDER.join(", ")}

[금지]
- 사물 나열, 과한 미사여구, 조언·훈계, 이모지, 해시태그, 느낌표, 얼굴 묘사나 신원 추측

이미지를 보고 JSON으로만 답하라.`;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY가 설정되지 않았어요" }, { status: 500 });
  }

  let pinId: string;
  try {
    const body = await req.json();
    pinId = body.pinId;
    if (!pinId) throw new Error("pinId missing");
  } catch {
    return NextResponse.json({ error: "pinId가 필요해요" }, { status: 400 });
  }

  const { data: pin, error: pinError } = await supabase
    .from("pins")
    .select("id,image_path,taken_at,user_note")
    .eq("id", pinId)
    .single();
  if (pinError || !pin) {
    return NextResponse.json({ error: "핀을 찾을 수 없어요" }, { status: 404 });
  }

  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .download(pin.image_path);
  if (downloadError || !fileBlob) {
    return NextResponse.json({ error: "사진을 불러오지 못했어요" }, { status: 502 });
  }
  const imageBase64 = Buffer.from(await fileBlob.arrayBuffer()).toString("base64");

  const takenAt = new Date(pin.taken_at);
  const season = deriveSeason(takenAt);
  const timeOfDay = deriveTimeOfDay(takenAt);
  const weekday = deriveWeekdayKorean(takenAt);
  const prompt = buildPrompt(season, timeOfDay, weekday, pin.user_note);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 28000);

  let geminiJson: unknown;
  try {
    const res = await fetch(`${GEMINI_ENDPOINT(model)}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/webp", data: imageBase64 } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              caption: { type: "STRING" },
              tags: { type: "ARRAY", items: { type: "STRING" } },
              mood: { type: "STRING", enum: [...MOOD_ORDER] },
            },
            required: ["caption", "tags", "mood"],
          },
        },
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) {
      await markFailed(supabase, pinId);
      return NextResponse.json({ error: "Gemini 오류" }, { status: 502 });
    }
    geminiJson = await res.json();
  } catch (e) {
    clearTimeout(timeout);
    await markFailed(supabase, pinId);
    const isAbort = e instanceof Error && e.name === "AbortError";
    return NextResponse.json({ error: isAbort ? "타임아웃" : "Gemini 요청 실패" }, {
      status: isAbort ? 504 : 502,
    });
  }

  let result: GeminiResult;
  try {
    const text = (geminiJson as any)?.candidates?.[0]?.content?.parts?.[0]?.text;
    const finishReason = (geminiJson as any)?.candidates?.[0]?.finishReason;
    if (!text) throw new Error(`no text, finishReason=${finishReason}`);
    result = JSON.parse(text);
  } catch {
    await markFailed(supabase, pinId);
    return NextResponse.json({ error: "응답 파싱 실패" }, { status: 502 });
  }

  const mood = isMood(result.mood) ? result.mood : null;
  const tags = Array.isArray(result.tags) ? result.tags.slice(0, 5) : [];

  const { error: updateError } = await supabase
    .from("pins")
    .update({ caption: result.caption, tags, mood, caption_status: "done" })
    .eq("id", pinId);
  if (updateError) {
    return NextResponse.json({ error: "저장 실패" }, { status: 502 });
  }

  return NextResponse.json({ caption: result.caption, tags, mood, model });
}

async function markFailed(supabase: Awaited<ReturnType<typeof createClient>>, pinId: string) {
  await supabase.from("pins").update({ caption_status: "failed" }).eq("id", pinId);
}
