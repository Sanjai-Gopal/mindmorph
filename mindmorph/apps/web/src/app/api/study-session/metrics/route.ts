import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type IncomingMetrics = {
  tabSwitches: number;
  idleSeconds: number;
  clickFrequency: number;
  scrollDepth: number;
  typingSpeedWpm: number;
  focusLossCount: number;
};

function calculateEngagementScore(metrics: IncomingMetrics) {
  const focusSignal = Math.min(35, metrics.typingSpeedWpm * 0.7);
  const interactionSignal = Math.min(20, metrics.clickFrequency * 2.5);
  const depthSignal = Math.min(15, metrics.scrollDepth * 15);
  const distractionPenalty = metrics.tabSwitches * 4 + metrics.focusLossCount * 3 + metrics.idleSeconds * 0.18;
  return Math.max(0, Math.min(100, Math.round(40 + focusSignal + interactionSignal + depthSignal - distractionPenalty)));
}

export async function POST(req: Request) {
  const body = await req.json();
  const metrics = (body.metrics ?? {}) as IncomingMetrics;
  const subject = String(body.subject ?? "General");
  const topic = String(body.topic ?? "Untitled");
  const engagementScore = calculateEngagementScore({
    tabSwitches: Number(metrics.tabSwitches ?? 0),
    idleSeconds: Number(metrics.idleSeconds ?? 0),
    clickFrequency: Number(metrics.clickFrequency ?? 0),
    scrollDepth: Number(metrics.scrollDepth ?? 0),
    typingSpeedWpm: Number(metrics.typingSpeedWpm ?? 0),
    focusLossCount: Number(metrics.focusLossCount ?? 0)
  });

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("study_sessions").insert({
        user_id: user.id,
        subject,
        topic,
        engagement_score: engagementScore,
        behavior_metrics: metrics,
        duration_seconds: 60
      });
    }
  } catch {
    // non-blocking write path
  }

  return NextResponse.json({ success: true, engagementScore });
}
