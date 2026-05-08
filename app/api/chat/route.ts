import { GoogleGenAI, type Content } from "@google/genai";
import { NextResponse } from "next/server";

type ClientMessage = {
  role: "user" | "assistant";
  content: string;
};

const systemInstruction = `You are a precise, helpful AI assistant inside a professional chat application.
Answer clearly, format code when helpful, and ask concise follow-up questions only when needed.`;

function toGeminiHistory(messages: ClientMessage[]): Content[] {
  return messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }]
  }));
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY in .env.local." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as { messages?: ClientMessage[] };
    const messages = body.messages?.filter(
      (message) =>
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0
    );

    if (!messages?.length || messages[messages.length - 1].role !== "user") {
      return NextResponse.json(
        { error: "Send at least one user message." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: toGeminiHistory(messages),
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 1200
      }
    });

    return NextResponse.json({
      message: response.text ?? "I could not generate a response."
    });
  } catch (error) {
    console.error("Gemini chat error:", error);

    return NextResponse.json(
      { error: "The assistant could not respond. Please try again." },
      { status: 500 }
    );
  }
}
