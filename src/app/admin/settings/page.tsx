"use client";
import { useState } from "react";
import { Eye, EyeOff, Loader2, CheckCircle, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Label, Card, CardContent } from "@/components/ui/index";
import { toast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPass !== form.confirm) { toast({ variant: "destructive", title: "Passwords don't match" }); return; }
    if (form.newPass.length < 8) { toast({ variant: "destructive", title: "Minimum 8 characters" }); return; }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) { setLoading(false); return; }
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: form.current });
    if (signInErr) { toast({ variant: "destructive", title: "Current password is incorrect" }); setLoading(false); return; }
    const { error } = await supabase.auth.updateUser({ password: form.newPass });
    if (error) { toast({ variant: "destructive", title: "Error", description: error.message }); }
    else { toast({ variant: "success", title: "Password updated" }); setForm({ current: "", newPass: "", confirm: "" }); }
    setLoading(false);
  };

  return (
    <div className="max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-500/10">
          <Settings className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm" style={{ color: "hsl(215, 14%, 55%)" }}>Manage your account</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold text-white mb-5">Change Password</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={form.current} onChange={e => setForm(p => ({ ...p, current: e.target.value }))} placeholder="Enter current password" required />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Input type={showPass ? "text" : "password"} value={form.newPass} onChange={e => setForm(p => ({ ...p, newPass: e.target.value }))} placeholder="Minimum 8 characters" required className="pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input type="password" value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} placeholder="Re-enter new password" required />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</> : <><CheckCircle className="h-4 w-4 mr-2" />Update Password</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
