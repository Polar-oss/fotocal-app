import { NextResponse } from "next/server";
import { MEAL_IMAGE_MAX_BYTES } from "@/lib/fotocal/constants";
import { getAiConfig } from "@/lib/ai/env";
import { getAiUsageSnapshot } from "@/lib/ai/limits";
import { incrementAiUsage } from "@/lib/ai/usage";
import { getUserSubscription } from "@/lib/subscriptions/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type MealAnalysis = {
  carbs_g: number;
  confidence: "alta" | "baixa" | "media";
  diet_feedback: string;
  estimated_calories: number;
  fats_g: number;
  foods: string[];
  intake_signal: "abaixo" | "equilibrado" | "acima";
  notes_suggestion: string;
  next_meal_suggestion: string;
  protein_g: number;
  rationale: string;
  title: string;
};

type OpenAIResponsePayload = {
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
    type?: string;
  }>;
  output_text?: string;
};

type GeminiResponsePayload = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

const GEMINI_FALLBACK_MODEL = "gemini-2.5-flash-lite";
const GEMINI_RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const GEMINI_RETRY_DELAYS_MS = [700, 1600];

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0;
}

async function fileToDataUrl(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

async function fileToBase64(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString("base64");
}

function parseAnalysisPayload(content: string): MealAnalysis | null {
  try {
    const parsed = JSON.parse(content) as Partial<MealAnalysis>;

    if (
      typeof parsed.carbs_g === "number" &&
      typeof parsed.title === "string" &&
      typeof parsed.protein_g === "number" &&
      typeof parsed.fats_g === "number" &&
      typeof parsed.diet_feedback === "string" &&
      typeof parsed.estimated_calories === "number" &&
      Array.isArray(parsed.foods) &&
      parsed.foods.every((item) => typeof item === "string") &&
      typeof parsed.intake_signal === "string" &&
      typeof parsed.rationale === "string" &&
      typeof parsed.notes_suggestion === "string" &&
      typeof parsed.next_meal_suggestion === "string" &&
      (parsed.intake_signal === "abaixo" ||
        parsed.intake_signal === "equilibrado" ||
        parsed.intake_signal === "acima") &&
      (parsed.confidence === "alta" ||
        parsed.confidence === "media" ||
        parsed.confidence === "baixa")
    ) {
      return {
        carbs_g: Math.max(0, Math.round(parsed.carbs_g)),
        confidence: parsed.confidence,
        diet_feedback: parsed.diet_feedback,
        estimated_calories: Math.max(1, Math.round(parsed.estimated_calories)),
        fats_g: Math.max(0, Math.round(parsed.fats_g)),
        foods: parsed.foods,
        intake_signal: parsed.intake_signal,
        notes_suggestion: parsed.notes_suggestion,
        next_meal_suggestion: parsed.next_meal_suggestion,
        protein_g: Math.max(0, Math.round(parsed.protein_g)),
        rationale: parsed.rationale,
        title: parsed.title,
      };
    }
  } catch {
    return null;
  }

  return null;
}

function getOpenAiOutputText(payload: OpenAIResponsePayload) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return "";
}

function getGeminiOutputText(payload: GeminiResponsePayload) {
  for (const candidate of payload.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      if (typeof part.text === "string" && part.text.trim()) {
        return part.text;
      }
    }
  }

  return "";
}

function getPrompt(hintText: string, contextText: string) {
  return (
    "Voce e um assistente de nutricao visual para um app chamado FotoCal. " +
    "Analise a foto de uma refeicao e devolva uma estimativa util, honesta e conservadora. " +
    "A estimativa deve considerar apenas o que parece visivel na imagem. Nunca invente itens ausentes. " +
    "Use nomes comuns no Brasil quando isso fizer sentido para a refeicao. " +
    "Sempre produza o JSON solicitado. " +
    contextText +
    " " +
    hintText
  );
}

const analysisSchema = {
  additionalProperties: false,
  properties: {
    carbs_g: {
      type: "number",
    },
    confidence: {
      enum: ["baixa", "media", "alta"],
      type: "string",
    },
    diet_feedback: {
      type: "string",
    },
    estimated_calories: {
      type: "number",
    },
    fats_g: {
      type: "number",
    },
    foods: {
      items: {
        type: "string",
      },
      type: "array",
    },
    intake_signal: {
      enum: ["abaixo", "equilibrado", "acima"],
      type: "string",
    },
    notes_suggestion: {
      type: "string",
    },
    next_meal_suggestion: {
      type: "string",
    },
    protein_g: {
      type: "number",
    },
    rationale: {
      type: "string",
    },
    title: {
      type: "string",
    },
  },
  required: [
    "title",
    "estimated_calories",
    "protein_g",
    "carbs_g",
    "fats_g",
    "foods",
    "rationale",
    "confidence",
    "intake_signal",
    "diet_feedback",
    "next_meal_suggestion",
    "notes_suggestion",
  ],
  type: "object",
};

async function callOpenAIAnalysis(
  apiKey: string,
  model: string,
  imageFile: File,
  hintText: string,
  contextText: string,
) {
  const imageUrl = await fileToDataUrl(imageFile);

  const response = await fetch("https://api.openai.com/v1/responses", {
    body: JSON.stringify({
      input: [
        {
          content: [
            {
              text: getPrompt(hintText, contextText),
              type: "input_text",
            },
            {
              detail: "high",
              image_url: imageUrl,
              type: "input_image",
            },
          ],
          role: "user",
        },
      ],
      max_output_tokens: 500,
      model,
      text: {
        format: {
          name: "meal_analysis",
          schema: analysisSchema,
          strict: true,
          type: "json_schema",
        },
      },
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload = (await response.json()) as OpenAIResponsePayload & {
    error?: {
      message?: string;
    };
  };

  if (!response.ok) {
    return {
      analysis: null,
      error:
        payload.error?.message ??
        "A IA nao conseguiu analisar essa imagem agora. Tente outra foto ou preencha manualmente.",
      status: response.status,
    };
  }

  return {
    analysis: parseAnalysisPayload(getOpenAiOutputText(payload)),
    error: null,
    status: 200,
  };
}

async function callGeminiAnalysis(
  apiKey: string,
  model: string,
  imageFile: File,
  hintText: string,
  contextText: string,
) {
  const modelsToTry = Array.from(
    new Set([model, GEMINI_FALLBACK_MODEL]),
  );
  const base64Image = await fileToBase64(imageFile);

  function isTransientGeminiError(status: number, message?: string) {
    if (GEMINI_RETRYABLE_STATUSES.has(status)) {
      return true;
    }

    if (!message) {
      return false;
    }

    const normalizedMessage = message.toLowerCase();

    return [
      "high demand",
      "overloaded",
      "temporarily unavailable",
      "try again later",
      "unavailable",
      "resource exhausted",
    ].some((snippet) => normalizedMessage.includes(snippet));
  }

  async function runGeminiRequest(currentModel: string) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent`,
      {
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    data: base64Image,
                    mime_type: imageFile.type,
                  },
                },
                {
                  text: getPrompt(hintText, contextText),
                },
              ],
            },
          ],
          generationConfig: {
            responseJsonSchema: analysisSchema,
            responseMimeType: "application/json",
            temperature: 0.2,
            ...(currentModel.startsWith("gemini-2.5-")
              ? {
                  thinkingConfig: {
                    thinkingBudget: 0,
                  },
                }
              : {}),
          },
        }),
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        method: "POST",
      },
    );

    const payload = (await response.json()) as GeminiResponsePayload;

    if (!response.ok) {
      const rawMessage =
        payload.error?.message ??
        "A IA nao conseguiu analisar essa imagem agora. Tente outra foto ou preencha manualmente.";

      return {
        analysis: null,
        error: isTransientGeminiError(response.status, rawMessage)
          ? "A IA esta com alta demanda agora. Tente novamente em alguns segundos ou preencha manualmente."
          : rawMessage,
        shouldRetry: isTransientGeminiError(response.status, rawMessage),
        status: response.status,
      };
    }

    return {
      analysis: parseAnalysisPayload(getGeminiOutputText(payload)),
      error: null,
      shouldRetry: false,
      status: 200,
    };
  }

  let lastResult:
    | {
        analysis: MealAnalysis | null;
        error: string | null;
        shouldRetry: boolean;
        status: number;
      }
    | null = null;

  for (const currentModel of modelsToTry) {
    for (let attempt = 0; attempt <= GEMINI_RETRY_DELAYS_MS.length; attempt += 1) {
      const result = await runGeminiRequest(currentModel);
      lastResult = result;

      if (result.analysis || !result.shouldRetry) {
        return {
          analysis: result.analysis,
          error: result.error,
          status: result.status,
        };
      }

      const retryDelay = GEMINI_RETRY_DELAYS_MS[attempt];

      if (typeof retryDelay === "number") {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  return {
    analysis: null,
    error:
      lastResult?.error ??
      "A IA nao conseguiu analisar essa imagem agora. Tente outra foto ou preencha manualmente.",
    status: lastResult?.status ?? 503,
  };
}

export async function POST(request: Request) {
  let aiConfig;
  let user = null;
  let isPremium = false;
  let currentUsage = null;

  try {
    aiConfig = getAiConfig();
  } catch (error) {
    return jsonError(
      error instanceof Error
        ? error.message
        : "Nenhuma IA foi configurada neste ambiente.",
    );
  }

  if (hasSupabaseEnv) {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return jsonError("Sua sessao expirou. Entre novamente para usar a IA.", 401);
    }

    user = authUser;
    const subscription = await getUserSubscription(authUser.id);
    isPremium = Boolean(subscription?.isActive);
    currentUsage = getAiUsageSnapshot({
      isPremium,
      user: authUser,
    });

    if (currentUsage.reachedLimit) {
      return NextResponse.json(
        {
          error:
            "Seu plano gratuito ja usou as 3 analises de hoje. Assine o premium para liberar analises ilimitadas ou volte amanha.",
          usage: currentUsage,
        },
        { status: 403 },
      );
    }
  }

  const formData = await request.formData();
  const imageValue = formData.get("image");
  const titleHint = formData.get("titleHint");
  const rawObjective = formData.get("objective");
  const rawCalorieGoal = formData.get("calorieGoal");
  const rawCurrentDayCalories = formData.get("currentDayCalories");

  if (!isUploadedFile(imageValue)) {
    return jsonError("Envie uma foto da refeicao para usar a analise por IA.");
  }

  if (!imageValue.type.startsWith("image/")) {
    return jsonError("A IA precisa receber um arquivo de imagem valido.");
  }

  if (imageValue.size > MEAL_IMAGE_MAX_BYTES) {
    return jsonError("Use uma foto de ate 5 MB para a analise por IA.");
  }

  const hintText =
    typeof titleHint === "string" && titleHint.trim()
      ? `O usuario acha que pode ser algo como: ${titleHint.trim()}. Use isso apenas como pista fraca, nunca como verdade.`
      : "Nao assuma o nome do prato sem evidencias visuais suficientes.";
  const contextParts: string[] = [];

  if (typeof rawObjective === "string" && rawObjective.trim()) {
    contextParts.push(`Objetivo atual do usuario: ${rawObjective.trim()}.`);
  }

  if (typeof rawCalorieGoal === "string" && rawCalorieGoal.trim()) {
    contextParts.push(`Meta calorica do dia: ${rawCalorieGoal.trim()} kcal.`);
  }

  if (typeof rawCurrentDayCalories === "string" && rawCurrentDayCalories.trim()) {
    contextParts.push(
      `Ate agora o usuario consumiu aproximadamente ${rawCurrentDayCalories.trim()} kcal hoje.`,
    );
  }

  contextParts.push(
    "Tambem estime proteinas, carboidratos e gorduras. Diga se esta abaixo, equilibrado ou acima da meta de forma prudente. Sugira a proxima refeicao em uma frase curta e util.",
  );
  const contextText = contextParts.join(" ");

  const result =
    aiConfig.provider === "gemini"
      ? await callGeminiAnalysis(
          aiConfig.apiKey,
          aiConfig.model,
          imageValue,
          hintText,
          contextText,
        )
      : await callOpenAIAnalysis(
          aiConfig.apiKey,
          aiConfig.model,
          imageValue,
          hintText,
          contextText,
        );

  if (result.error) {
    return jsonError(result.error, result.status);
  }

  if (!result.analysis) {
    return jsonError(
      "Recebi uma resposta da IA, mas nao consegui transformar isso em uma estimativa valida.",
      502,
    );
  }

  const usage =
    user && currentUsage
      ? await incrementAiUsage({
          isPremium,
          user,
        })
      : null;

  return NextResponse.json({
    data: result.analysis,
    message:
      "Foto analisada. Revise calorias, macros e sugestoes antes de salvar a refeicao.",
    usage,
  });
}
