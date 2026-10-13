import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { ChatbotService } from "@/modules/chatbot/service";
import { checkRateLimit } from "@/modules/auth/ratelimit";

const ChatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000, "Message cannot exceed 2000 characters"),
  conversationId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  // Enforce same-origin check for cross-origin defense
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) {
    return NextResponse.json(
      { error: "Cross-origin request rejected" },
      { status: 403 },
    );
  }

  // Extract client IP
  const forwarded = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const ip = forwarded.split(",")[0]!.trim();

  // Rate limit: 20 chat requests per minute per IP to prevent compute exhaustion & prompt flood abuse
  const rateLimitKey = `chat_abuse:${ip}`;
  const rateCheck = await checkRateLimit({
    key: rateLimitKey,
    maxAttempts: 20,
    windowSeconds: 60,
  });

  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error:
          "Too many chat requests. Please slow down and try again shortly.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateCheck.retryAfterSeconds ?? 60),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  try {
    const sessionTokenHash = crypto
      .createHash("sha256")
      .update(`chat_${ip}`)
      .digest("hex");

    const result = await ChatbotService.processMessage({
      message: parsed.data.message,
      sessionTokenHash,
      conversationId: parsed.data.conversationId,
    });

    return NextResponse.json(result);
  } catch (error) {
    const errMessage =
      error instanceof Error ? error.message : "Failed to process chat message";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
