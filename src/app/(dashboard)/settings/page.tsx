'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)

    const { error } = await supabase.auth.updateUser({ email })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Confirmation email sent to your new address. Please verify to complete the change.')
      setEmail('')
    }
    setEmailLoading(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setPasswordLoading(true)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    }
    setPasswordLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="h-7 w-7 text-amber-400" />
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your account settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Change Email */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-amber-400" />
              Change Email
            </CardTitle>
            <CardDescription className="text-slate-400">
              Update your email address. You&apos;ll need to verify the new email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangeEmail} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">New Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="new-email@nitkkr.ac.in"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <Button
                type="submit"
                className="bg-amber-600 hover:bg-amber-500"
                disabled={emailLoading}
              >
                {emailLoading ? 'Sending...' : 'Update Email'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5 text-amber-400" />
              Change Password
            </CardTitle>
            <CardDescription className="text-slate-400">
              Update your account password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <Button
                type="submit"
                className="bg-amber-600 hover:bg-amber-500"
                disabled={passwordLoading}
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
