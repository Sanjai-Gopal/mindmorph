"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(true)
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: true
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    localStorage.setItem("mindmorph_remember_me", String(values.rememberMe));
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back.");
    router.push(searchParams.get("next") ?? "/dashboard");
  };

  useEffect(() => {
    const hasSensitiveParams = searchParams.has("email") || searchParams.has("password");
    if (!hasSensitiveParams) return;
    const next = searchParams.get("next");
    const safeUrl = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
    router.replace(safeUrl);
  }, [router, searchParams]);

  const onGoogleSignIn = async () => {
    setGoogleLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      searchParams.get("next") ?? "/dashboard"
    )}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo }
    });
    setGoogleLoading(false);
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen md:grid md:grid-cols-2">
      <motion.section
        initial={false}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-center px-6 py-12 md:px-12"
      >
        <div className="w-full max-w-md space-y-5">
          <h1 className="text-3xl font-bold">Welcome back to MindMorph</h1>
          <p className="text-sm text-gray-300">Log in to continue your adaptive study journey.</p>

          <Button
            type="button"
            onClick={onGoogleSignIn}
            className="w-full bg-white text-black hover:bg-white/90"
            disabled={googleLoading}
          >
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </Button>

          <div className="relative py-2 text-center text-xs text-gray-400">
            <span className="bg-background px-3">or</span>
          </div>

          <form action="/login" method="post" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
              {errors.password && (
                <p className="mt-1 text-xs text-red-300">{errors.password.message}</p>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register("rememberMe")} />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-cyan-300 hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full py-2" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-sm text-gray-300">
            New here?{" "}
            <Link href="/register" className="text-cyan-300 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </motion.section>

      <motion.section
        initial={false}
        animate={{ opacity: 1, x: 0 }}
        className="relative hidden overflow-hidden bg-gradient-to-br from-purple-700/40 via-fuchsia-600/30 to-cyan-600/30 md:flex md:items-center md:justify-center"
      >
        <div className="max-w-md p-8 text-center">
          <h2 className="text-4xl font-extrabold">Focus. Morph. Master.</h2>
          <p className="mt-4 text-gray-100/90">
            Personalized AI study sessions that adapt to how your brain learns best.
          </p>
        </div>
      </motion.section>
    </div>
  );
}
