import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { generateFreeReport } from "@/lib/analysis";
import { MOCK_MODE } from "@/lib/devMode";
import { buildMockFreeReport } from "@/lib/mockAnalysis";
import { saveReport } from "@/lib/reportStore";
import { AnswerValue, PartnerInfo } from "@/lib/types";

// One Haiku request; the deep dive happens later, after payment.
export const maxDuration = 60;

interface AnalyzeBody {
  partner1?: PartnerInfo;
  partner2?: PartnerInfo;
  relationshipStart?: string;
  email?: string;
  answers?: Record<string, AnswerValue>;
}

export async function POST(request: NextRequest) {
  let body: AnalyzeBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { partner1, partner2, relationshipStart = "", email = "", answers } = body;

  if (!partner1?.name || !partner2?.name) {
    return Response.json({ error: "Both partner names are required." }, { status: 400 });
  }
  if (!answers || Object.keys(answers).length === 0) {
    return Response.json({ error: "No answers were submitted." }, { status: 400 });
  }

  // Checked after the body so a malformed request still reports what's wrong
  // with it rather than being masked by a config error.
  if (!MOCK_MODE && !process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not configured." },
      { status: 500 },
    );
  }

  const transcript = { partner1, partner2, relationshipStart, answers };

  try {
    const free = MOCK_MODE
      ? buildMockFreeReport(partner1.name, partner2.name)
      : await generateFreeReport(transcript);

    const id = randomUUID();
    await saveReport({
      id,
      createdAt: Date.now(),
      email,
      partner1Name: partner1.name,
      partner2Name: partner2.name,
      // Stored so the paid pass can replay the test without the client.
      answers: transcript,
      free,
      paid: null,
      paidStatus: "unpaid",
    });

    // Only the free sections cross the wire. The paid ones don't exist yet.
    return Response.json({ reportId: id, teaser: free });
  } catch (error) {
    // The specific reason (bad JSON, refusal, truncation, transport) goes to
    // the server log; the client gets a message it can show a user.
    console.error("[analyze] failed:", error);
    return Response.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 },
    );
  }
}
