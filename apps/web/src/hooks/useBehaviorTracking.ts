import { useEffect, useMemo, useRef, useState } from "react";

export type BehaviorMetrics = {
  tabSwitches: number;
  tabHiddenMs: number;
  idleSeconds: number;
  clickCount: number;
  clickFrequency: number;
  scrollDepth: number;
  scrollSpeed: number;
  scrollPattern: "smooth" | "rapid" | "none" | "mixed";
  typingSpeedWpm: number;
  activeSeconds: number;
  focusLossCount: number;
};

type Options = {
  subject: string;
  topic: string;
  enabled?: boolean;
  onEngagementUpdate?: (score: number) => void;
};

export function useBehaviorTracking({
  subject,
  topic,
  enabled = true,
  onEngagementUpdate
}: Options) {
  const [metrics, setMetrics] = useState<BehaviorMetrics>({
    tabSwitches: 0,
    tabHiddenMs: 0,
    idleSeconds: 0,
    clickCount: 0,
    clickFrequency: 0,
    scrollDepth: 0,
    scrollSpeed: 0,
    scrollPattern: "none",
    typingSpeedWpm: 0,
    activeSeconds: 0,
    focusLossCount: 0
  });
  const lastActivityRef = useRef(Date.now());
  const hiddenStartRef = useRef<number | null>(null);
  const keyCountRef = useRef(0);
  const lastScrollRef = useRef({ y: 0, t: Date.now(), speeds: [] as number[] });
  const lastPayloadAtRef = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const onActivity = () => {
      lastActivityRef.current = Date.now();
    };
    const onClick = () => {
      onActivity();
      setMetrics((m) => ({ ...m, clickCount: m.clickCount + 1 }));
    };
    const onKeyDown = () => {
      onActivity();
      keyCountRef.current += 1;
    };
    const onVisibility = () => {
      if (document.hidden) {
        hiddenStartRef.current = Date.now();
        setMetrics((m) => ({ ...m, tabSwitches: m.tabSwitches + 1 }));
      } else if (hiddenStartRef.current) {
        const hiddenDuration = Date.now() - hiddenStartRef.current;
        hiddenStartRef.current = null;
        setMetrics((m) => ({ ...m, tabHiddenMs: m.tabHiddenMs + hiddenDuration }));
      }
    };
    const onWindowBlur = () => setMetrics((m) => ({ ...m, focusLossCount: m.focusLossCount + 1 }));
    const onScroll = () => {
      onActivity();
      const now = Date.now();
      const y = window.scrollY;
      const deltaY = Math.abs(y - lastScrollRef.current.y);
      const deltaT = Math.max(1, now - lastScrollRef.current.t);
      const speed = (deltaY / deltaT) * 1000;
      const speeds = [...lastScrollRef.current.speeds, speed].slice(-15);
      const depth =
        (y + window.innerHeight) / Math.max(1, document.documentElement.scrollHeight || 1);
      lastScrollRef.current = { y, t: now, speeds };
      const avg = speeds.reduce((a, b) => a + b, 0) / Math.max(1, speeds.length);
      const pattern: BehaviorMetrics["scrollPattern"] =
        avg < 200 ? "smooth" : avg > 1200 ? "rapid" : avg > 0 ? "mixed" : "none";
      setMetrics((m) => ({ ...m, scrollDepth: Math.min(1, depth), scrollSpeed: avg, scrollPattern: pattern }));
    };

    window.addEventListener("mousemove", onActivity);
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("blur", onWindowBlur);
    document.addEventListener("visibilitychange", onVisibility);

    const heartbeat = window.setInterval(() => {
      const now = Date.now();
      const idleMs = now - lastActivityRef.current;
      const elapsedMin = (now - lastPayloadAtRef.current) / 60000;
      const wpm = elapsedMin > 0 ? Math.round(keyCountRef.current / 5 / elapsedMin) : 0;
      setMetrics((m) => ({
        ...m,
        idleSeconds: m.idleSeconds + (idleMs > 12_000 ? 1 : 0),
        activeSeconds: m.activeSeconds + (idleMs <= 12_000 ? 1 : 0),
        typingSpeedWpm: wpm,
        clickFrequency: elapsedMin > 0 ? Number((m.clickCount / elapsedMin).toFixed(2)) : m.clickFrequency
      }));
    }, 1000);

    const sendInterval = window.setInterval(async () => {
      const snapshot = useBehaviorMetricsSnapshot();
      try {
        const response = await fetch("/api/study-session/metrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, topic, metrics: snapshot })
        });
        const data = await response.json();
        if (typeof data.engagementScore === "number") {
          onEngagementUpdate?.(data.engagementScore);
        }
      } catch {
        // keep session alive even if metrics push fails
      }
      keyCountRef.current = 0;
      lastPayloadAtRef.current = Date.now();
    }, 60_000);

    return () => {
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("blur", onWindowBlur);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(heartbeat);
      window.clearInterval(sendInterval);
    };
  }, [enabled, subject, topic, onEngagementUpdate]);

  const useBehaviorMetricsSnapshot = () => {
    return {
      ...metrics,
      sampledAt: new Date().toISOString()
    };
  };

  const engagementEstimate = useMemo(() => {
    const idlePenalty = Math.min(50, metrics.idleSeconds * 0.5);
    const focusBonus = Math.min(20, metrics.activeSeconds * 0.12);
    const typingBonus = Math.min(20, metrics.typingSpeedWpm * 0.25);
    const distractionPenalty = metrics.tabSwitches * 3 + metrics.focusLossCount * 2;
    return Math.max(0, Math.min(100, 55 + focusBonus + typingBonus - idlePenalty - distractionPenalty));
  }, [metrics]);

  return { metrics, engagementEstimate };
}
