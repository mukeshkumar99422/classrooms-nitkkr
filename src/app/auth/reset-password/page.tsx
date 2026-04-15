"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Label, Toaster } from "@/components/ui/index";
import { toast } from "@/hooks/use-toast";
import AuthBackground from "@/components/shared/AuthBackground";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast({ variant: "destructive", title: "Passwords don't match" }); return; }
    if (password.length < 8) { toast({ variant: "destructive", title: "Minimum 8 characters required" }); return; }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { toast({ variant: "destructive", title: "Error", description: error.message }); setLoading(false); return; }
    setDone(true);
    await supabase.auth.signOut();
    setTimeout(() => router.push("/auth/login"), 2000);
  };

  return (
    <>
      <Toaster />
      <AuthBackground>
      <div className="min-h-dvh flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "hsl(222, 20%, 16%)", border: "1px solid hsl(222, 14%, 22%)" }}>

            <div className="px-8 pt-6 pb-6 text-center" style={{ background: "hsl(222, 28%, 22%)" }}>
              <div className="mx-auto flex items-center justify-center bg-white p-3 rounded-full w-[88px] h-[88px] mb-4 shadow-lg">
                <img src="/logo.png" alt="NIT Kurukshetra" width={64} height={64} className="object-contain" />
              </div>
              <h1 className="text-xl font-bold text-white">Classrooms Scheduler</h1>
            </div>

            <div className="px-8 py-4">
              {done ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: "hsl(142, 70%, 50%)" }} />
                  <h2 className="text-lg font-semibold text-white">Password Updated!</h2>
                  <p className="text-sm mt-2" style={{ color: "hsl(215, 14%, 55%)" }}>Redirecting to login...</p>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-white">Set New Password</h2>
                  <p className="text-sm mb-4" style={{ color: "hsl(215, 14%, 55%)" }}>Choose a strong password.</p>
                  <form onSubmit={handleReset} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium" style={{ color: "hsl(210, 20%, 82%)" }}>New Password</Label>
                      <div className="relative">
                        <Input type={showPass ? "text" : "password"} value={password}
                          onChange={e => setPassword(e.target.value)} placeholder="Minimum 8 characters" required
                          className="bg-transparent border-[hsl(222,14%,28%)] text-white placeholder:text-[hsl(215,14%,40%)] focus-visible:ring-[hsl(217,80%,58%)] h-11 pr-10" />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(215,14%,50%)] hover:text-white">
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium" style={{ color: "hsl(210, 20%, 82%)" }}>Confirm Password</Label>
                      <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                        placeholder="Re-enter password" required
                        className="bg-transparent border-[hsl(222,14%,28%)] text-white placeholder:text-[hsl(215,14%,40%)] focus-visible:ring-[hsl(217,80%,58%)] h-11" />
                    </div>
                    <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}
                      style={{ background: "hsl(217, 80%, 50%)" }}>
                      {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</> : "Update Password"}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
          <p className="text-center text-blue-200 text-xs mt-5">National Institute of Technology, Kurukshetra</p>
        </div>
      </div>
      </AuthBackground>
    </>
  );
}
