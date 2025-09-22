"use client"

import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  Camera,
  Save,
  Loader2,
  ArrowLeft
} from 'lucide-react'

interface ProfileData {
  username: string
  email: string
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  courseUpdates: boolean
  marketingEmails: boolean
}

const SettingsPage = () => {
  const { user, token, isLoading } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    email: ''
  })
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    courseUpdates: true,
    marketingEmails: false
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/sign-in')
    }
  }, [user, isLoading, router])

  // Initialize profile data from user context
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || ''
      })
    }
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setLoading(true)
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      })

      const responseData = await response.json()
      
      if (response.ok) {
        // Handle success - could be actual update or no changes
        if (responseData.message === 'No changes detected') {
          toast({
            title: "No Changes",
            description: "Your profile is already up to date.",
          })
        } else {
          toast({
            title: "Profile Updated",
            description: "Your profile has been successfully updated.",
          })
        }
      } else {
        // Handle specific errors
        if (response.status === 403) {
          toast({
            title: "Permission Denied",
            description: "Profile updates may be restricted. Please contact an administrator.",
            variant: "destructive",
          })
        } else if (response.status === 400 && responseData.error) {
          // Show the specific error from the API (like "Email already taken")
          toast({
            title: "Update Failed",
            description: responseData.error,
            variant: "destructive",
          })
        } else {
          throw new Error(responseData.error || 'Failed to update profile')
        }
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData)
      })

      if (response.ok) {
        toast({
          title: "Password Changed",
          description: "Your password has been successfully updated.",
        })
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        throw new Error('Failed to change password')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationUpdate = async () => {
    if (!token) return

    setLoading(true)
    try {
      const response = await fetch('/api/auth/update-notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationSettings)
      })

      if (response.ok) {
        toast({
          title: "Settings Updated",
          description: "Your notification preferences have been saved.",
        })
      } else {
        throw new Error('Failed to update notifications')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#181818] backdrop-blur supports-[backdrop-filter]:bg-[#181818]">
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        {/* Header with back button */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white hover:bg-[#2a2a2a]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-300">Manage your account settings and preferences</p>
        </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-[#2a2a2a] border-none">
          <TabsTrigger value="profile" className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-[#181818] data-[state=active]:text-white">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-[#181818] data-[state=active]:text-white">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-[#181818] data-[state=active]:text-white">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-none bg-[#181818] backdrop-blur supports-[backdrop-filter]:bg-[#181818]">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription className="text-gray-300">
                Update your profile details and personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Profile Picture */}
                

                <Separator className="bg-gray-600" />

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white">Username</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter your username"
                      required
                      className="bg-[#2a2a2a] border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      required
                      className="bg-[#2a2a2a] border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-gray-600 text-white">
                      {user.role?.name || 'User'}
                    </Badge>
                    <Badge variant={user.confirmed ? "default" : "destructive"} className={user.confirmed ? "bg-gray-600 text-white" : "bg-red-600 text-white"}>
                      {user.confirmed ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  <Button type="submit" disabled={loading} className="bg-gray-600 text-white">
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-none bg-[#181818] backdrop-blur supports-[backdrop-filter]:bg-[#181818]">
            <CardHeader>
              <CardTitle className="text-white">Change Password</CardTitle>
              <CardDescription className="text-gray-300">
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter your current password"
                    className="bg-[#2a2a2a] border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-white">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter your new password"
                    className="bg-[#2a2a2a] border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm your new password"
                    className="bg-[#2a2a2a] border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                <Button type="submit" disabled={loading} className="bg-gray-600 text-white">
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Lock className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none bg-[#181818] backdrop-blur supports-[backdrop-filter]:bg-[#181818]">
            <CardHeader>
              <CardTitle className="text-white">Account Information</CardTitle>
              <CardDescription className="text-gray-300">
                Your account details and login information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-white">Account Created</Label>
                  <p className="text-sm text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-white">Last Updated</Label>
                  <p className="text-sm text-gray-300">
                    {new Date(user.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-white">Login Provider</Label>
                  <p className="text-sm text-gray-300 capitalize">
                    {user.provider}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-white">Account Status</Label>
                  <p className="text-sm text-gray-300">
                    {user.blocked ? 'Blocked' : 'Active'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-none bg-[#181818] backdrop-blur supports-[backdrop-filter]:bg-[#181818]">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
              <CardDescription className="text-gray-300">
                Choose how you want to be notified about activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Email Notifications</Label>
                    <p className="text-sm text-gray-400">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>
                <Separator className="bg-gray-600" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Push Notifications</Label>
                    <p className="text-sm text-gray-400">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>
                <Separator className="bg-gray-600" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Course Updates</Label>
                    <p className="text-sm text-gray-400">
                      Get notified about new lessons and course updates
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.courseUpdates}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, courseUpdates: checked }))
                    }
                  />
                </div>
                <Separator className="bg-gray-600" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Marketing Emails</Label>
                    <p className="text-sm text-gray-400">
                      Receive emails about new features and promotions
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))
                    }
                  />
                </div>
              </div>
              <Button onClick={handleNotificationUpdate} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}

export default SettingsPage