const preferredProvider = process.env.AI_PROVIDER;
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiVisionModel = process.env.GEMINI_VISION_MODEL ?? "gemini-2.5-flash";
const openAiApiKey = process.env.OPENAI_API_KEY;
const openAiVisionModel = process.env.OPENAI_VISION_MODEL ?? "gpt-4.1-mini";

export type AiProvider = "gemini" | "openai";

export const hasAiEnv = Boolean(geminiApiKey || openAiApiKey);

export function getAiConfig() {
  if (preferredProvider === "openai" && openAiApiKey) {
    return {
      apiKey: openAiApiKey,
      model: openAiVisionModel,
      provider: "openai" as const,
    };
  }

  if (preferredProvider === "gemini" && geminiApiKey) {
    return {
      apiKey: geminiApiKey,
      model: geminiVisionModel,
      provider: "gemini" as const,
    };
  }

  if (geminiApiKey) {
    return {
      apiKey: geminiApiKey,
      model: geminiVisionModel,
      provider: "gemini" as const,
    };
  }

  if (openAiApiKey) {
    return {
      apiKey: openAiApiKey,
      model: openAiVisionModel,
      provider: "openai" as const,
    };
  }

  throw new Error(
    "Nenhuma chave de IA foi configurada neste ambiente.",
  );
}
