"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Label, Toaster } from "@/components/ui/index";
import { toast } from "@/hooks/use-toast";
import AuthBackground from "@/components/shared/AuthBackground";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ variant: "destructive", title: "Login failed", description: error.message });
      setLoading(false);
      return;
    }
    const { data: dept } = await supabase
      .from("departments").select("is_admin").eq("id", data.user.id).single();
    window.location.href = dept?.is_admin ? "/admin/dashboard" : "/dashboard";
  };

  return (
    <>
      <Toaster />
      <AuthBackground>
      <div className="min-h-screen flex items-center justify-center p-4">

        <div className="w-full max-w-sm">
          <div className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "hsl(222, 20%, 16%)", border: "1px solid hsl(222, 14%, 22%)" }}>

            {/* Header */}
            <div className="px-8 pt-8 pb-7 text-center"
              style={{ background: "hsl(222, 28%, 22%)" }}>
              <div className="mx-auto flex items-center justify-center bg-white p-3 rounded-full w-[88px] h-[88px] mb-4 shadow-lg">
                <img src="/logo.png" alt="NIT Kurukshetra" width={64} height={64}
                  className="object-contain" />
              </div>
              <h1 className="text-xl font-bold text-white">Classrooms Scheduler</h1>
            </div>

            {/* Form */}
            <div className="px-8 py-7">
              <h2 className="text-lg font-semibold text-white mb-1 text-center">Sign In</h2>
              <p className="text-sm mb-6 text-center" style={{ color: "hsl(215, 14%, 55%)" }}>Login to your account</p>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium" style={{ color: "hsl(210, 20%, 82%)" }}>
                    Email Address
                  </Label>
                  <Input id="email" type="email" placeholder="dept@nitkkr.ac.in"
                    value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
                    className="bg-transparent border-[hsl(222,14%,28%)] text-white placeholder:text-[hsl(215,14%,40%)] focus-visible:ring-[hsl(217,80%,58%)] h-11" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium" style={{ color: "hsl(210, 20%, 82%)" }}>
                      Password <span className="text-red-400">*</span>
                    </Label>
                  </div>
                  <div className="relative">
                    <Input id="password" type={showPass ? "text" : "password"} placeholder="Enter your password"
                      value={password} onChange={e => setPassword(e.target.value)} required
                      className="bg-transparent border-[hsl(222,14%,28%)] text-white placeholder:text-[hsl(215,14%,40%)] focus-visible:ring-[hsl(217,80%,58%)] h-11 pr-10" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(215,14%,50%)] hover:text-white transition-colors">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link href="/auth/forgot-password"
                    className="text-sm hover:underline transition-colors"
                    style={{ color: "hsl(217, 80%, 65%)" }}>
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" className="w-full h-11 font-semibold text-sm" disabled={loading}
                  style={{ background: "hsl(217, 80%, 50%)" }}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in...</> : "Sign In"}
                </Button>
              </form>
            </div>
          </div>
          <p className="text-center text-blue-200 text-xs mt-5">National Institute of Technology, Kurukshetra</p>
        </div>
      </div>
      </AuthBackground>
    </>
  );
}
