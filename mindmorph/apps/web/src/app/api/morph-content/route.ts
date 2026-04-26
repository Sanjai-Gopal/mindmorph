import { NextResponse } from "next/server";
import { transformContent } from "@/lib/ai/content-transformer";
import { generateStudyHint } from "@/lib/ai/gemini";

export async function POST(req: Request) {
  const body = await req.json();
  const content = String(body.content ?? "");
  const format = body.format === "quiz" || body.format === "flashcards" ? body.format : "simple";

  try {
    const prompt = `Transform this study topic into an engaging ${format} explanation for a college student: ${content}`;
    const transformed = await generateStudyHint(prompt);
    return NextResponse.json({ success: true, transformed });
  } catch {
    return NextResponse.json({ success: true, transformed: transformContent(content, format) });
  }
}
