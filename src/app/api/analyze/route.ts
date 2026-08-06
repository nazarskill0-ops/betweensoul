import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { generateAnalysis } from "@/lib/analysis";
import { MOCK_MODE } from "@/lib/devMode";
import { buildMockAnalysis } from "@/lib/mockAnalysis";
import { saveReport } from "@/lib/reportStore";
import { AnswerValue, PartnerInfo } from "@/lib/types";

// Four parallel Haiku calls finish well inside this; the headroom is for a
// retried part on a slow day.
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

  try {
    const analysis = MOCK_MODE
      ? buildMockAnalysis(partner1.name, partner2.name)
      : await generateAnalysis({
          partner1,
          partner2,
          relationshipStart,
          answers,
        });

    const id = randomUUID();
    await saveReport({
      id,
      createdAt: Date.now(),
      paid: false,
      email,
      partner1Name: partner1.name,
      partner2Name: partner2.name,
      analysis,
    });

    // Only the teaser crosses the wire — the full report stays server-side
    // until the order is confirmed paid.
    return Response.json({ reportId: id, teaser: analysis.teaser });
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
