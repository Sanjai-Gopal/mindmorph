"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { WelcomeStep } from "@/components/features/Onboarding/WelcomeStep";
import { QuizStep } from "@/components/features/Onboarding/QuizStep";
import { ProcessingStep } from "@/components/features/Onboarding/ProcessingStep";
import { ResultsStep } from "@/components/features/Onboarding/ResultsStep";
import { FirstTransformStep } from "@/components/features/Onboarding/FirstTransformStep";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function OnboardingPage() {
  const router = useRouter();
  const [quizIndex, setQuizIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const {
    step,
    setStep,
    answers,
    setAnswers,
    processing,
    styleScores,
    primaryStyle,
    secondaryStyle,
    startProcessing,
    save
  } = useOnboarding();

  return (
    <DashboardLayout>
      {step === 0 && (
        <WelcomeStep
          onNext={() => {
            setStep(1);
            setQuizIndex(0);
          }}
        />
      )}

      {step === 1 && (
        <QuizStep
          questionIndex={quizIndex}
          answers={answers}
          setAnswers={setAnswers}
          onBack={() => {
            if (quizIndex === 0) {
              setStep(0);
            } else {
              setQuizIndex((prev) => prev - 1);
            }
          }}
          onNext={() => {
            if (quizIndex >= 4) {
              setStep(2);
              void startProcessing();
            } else {
              setQuizIndex((prev) => prev + 1);
            }
          }}
        />
      )}

      {step === 2 && processing && <ProcessingStep />}

      {step === 3 && (
        <ResultsStep
          data={styleScores}
          primaryStyle={primaryStyle}
          secondaryStyle={secondaryStyle}
          onStart={() => setStep(4)}
        />
      )}

      {step === 4 && (
        <div className="space-y-4">
          <FirstTransformStep dominantStyle={primaryStyle} />
          <button
            onClick={async () => {
              if (saving) return;
              setSaving(true);
              try {
                await save();
                toast.success("Profile saved.");
                router.push("/study");
              } catch {
                toast.error("Could not save your profile. Please try again.");
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            className="rounded-md border border-white/20 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving profile..." : "Save profile and continue"}
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
