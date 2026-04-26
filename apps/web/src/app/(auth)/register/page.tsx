"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
    acceptedTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms" })
    })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const password = watch("password", "");
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`
      }
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setRegistered(true);
    toast.success("Account created.");
    setTimeout(() => router.push("/onboarding"), 1200);
  };

  return (
    <div className="min-h-screen md:grid md:grid-cols-2">
      <motion.section
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-center px-6 py-12 md:px-12"
      >
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-3xl font-bold">Create your MindMorph account</h1>
          <p className="text-sm text-gray-300">Get started with adaptive AI learning today.</p>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <input
                type="text"
                placeholder="Full name"
                className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-300">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2"
                {...register("email")}
              />
              {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email.message}</p>}
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2"
                {...register("password")}
              />
              <div className="mt-2 h-2 w-full rounded bg-white/10">
                <div
                  className="h-2 rounded bg-cyan-400 transition-all"
                  style={{ width: `${(strength / 4) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirm password"
                className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-300">{errors.confirmPassword.message}</p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("acceptedTerms")} />
              I agree to the Terms and Privacy Policy.
            </label>
            {errors.acceptedTerms && (
              <p className="text-xs text-red-300">{errors.acceptedTerms.message}</p>
            )}

            <Button type="submit" className="w-full py-2" disabled={loading || registered}>
              {loading ? "Creating account..." : "Create account"}
            </Button>

            {registered && (
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center gap-2 rounded-md border border-green-300/40 bg-green-500/10 py-2 text-green-300"
              >
                <CheckCircle2 className="h-4 w-4" />
                Registration successful
              </motion.div>
            )}
          </form>

          <p className="text-sm text-gray-300">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-300 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative hidden overflow-hidden bg-gradient-to-br from-cyan-700/40 via-indigo-700/30 to-purple-700/40 md:flex md:items-center md:justify-center"
      >
        <div className="max-w-md p-8 text-center">
          <h2 className="text-4xl font-extrabold">Build your learning edge</h2>
          <p className="mt-4 text-gray-100/90">
            MindMorph continuously adapts lessons to your cognitive patterns in real-time.
          </p>
        </div>
      </motion.section>
    </div>
  );
}
