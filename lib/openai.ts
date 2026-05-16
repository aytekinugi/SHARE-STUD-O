import OpenAI from "openai";

let cached: OpenAI | undefined;

export function openai() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set.");
  }
  if (!cached) cached = new OpenAI({ apiKey: key });
  return cached;
}
