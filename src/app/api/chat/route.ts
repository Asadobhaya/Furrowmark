import { NextResponse } from "next/server";
import { ChatbotService } from "@/modules/chatbot/service";
import crypto from "node:crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // IP or header-based session identifier hash
    const forwarded = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const ip = forwarded.split(",")[0]!.trim();
    const sessionTokenHash = crypto
      .createHash("sha256")
      .update(`chat_${ip}`)
      .digest("hex");

    const result = await ChatbotService.processMessage({
      message,
      sessionTokenHash,
      conversationId: body.conversationId,
    });

    return NextResponse.json(result);
  } catch (error) {
    const errMessage =
      error instanceof Error ? error.message : "Failed to process chat message";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
