"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { Button, Input, Label, Toaster } from "@/components/ui/index";
import { toast } from "@/hooks/use-toast";
import AuthBackground from "@/components/shared/AuthBackground";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally { setLoading(false); }
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
              {sent ? (
                <div className="text-center py-4">
                  <MailCheck className="h-12 w-12 mx-auto mb-4" style={{ color: "hsl(142, 70%, 50%)" }} />
                  <h2 className="text-lg font-semibold text-white mb-1">Check your email</h2>
                  <p className="text-sm mb-6" style={{ color: "hsl(215, 14%, 55%)" }}>
                    Reset link sent to <strong className="text-white">{email}</strong>. Expires in 1 hour.
                  </p>
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full border-[hsl(222,14%,28%)] text-white hover:bg-[hsl(222,16%,22%)]">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-white text-center">Reset Password</h2>
                  <p className="text-sm mb-4 text-center" style={{ color: "hsl(215, 14%, 55%)" }}>
                    Enter your email and we'll send a reset link.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium" style={{ color: "hsl(210, 20%, 82%)" }}>Email Address</Label>
                      <Input type="email" placeholder="dept@nitkkr.ac.in" value={email}
                        onChange={e => setEmail(e.target.value)} required
                        className="bg-transparent border-[hsl(222,14%,28%)] text-white placeholder:text-[hsl(215,14%,40%)] focus-visible:ring-[hsl(217,80%,58%)] h-11" />
                    </div>
                    <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}
                      style={{ background: "hsl(217, 80%, 50%)" }}>
                      {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : "Send Reset Link"}
                    </Button>
                    <Link href="/auth/login" className="flex items-center justify-center gap-2 text-sm transition-colors hover:text-white"
                      style={{ color: "hsl(215, 14%, 55%)" }}>
                      <ArrowLeft className="h-4 w-4" /> Back to login
                    </Link>
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
