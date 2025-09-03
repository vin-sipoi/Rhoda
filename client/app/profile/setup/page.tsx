"use client"

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const categories = [
  'Technology',
  'Design',
  'Business',
  'Marketing',
  'Programming',
  'Art & Creativity',
  'Music',
  'Health & Fitness',
  'Language Learning',
  'Science',
  'Mathematics',
  'History',
  'Photography',
  'Cooking',
  'Writing'
]

export default function ProfileSetupPage() {
  const { user, createProfile, isLoading: authLoading } = useAuth()
  const [profileType, setProfileType] = useState<'learner' | 'educator'>('learner')
  const [formData, setFormData] = useState({
    name: user?.username || '',
    age: '',
    category: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Debug logging
  console.log('ProfileSetup render - user:', user)
  console.log('ProfileSetup render - authLoading:', authLoading)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isFormValid = () => {
    return formData.name.trim() !== '' && formData.age.trim() !== '' && formData.category !== ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid()) return

    setIsLoading(true)

    try {
      const profileData = {
        Name: formData.name,
        age: parseInt(formData.age),
        interests: [formData.category]
      }

      await createProfile(profileType, profileData)
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to create profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    console.log('ProfileSetup - Auth is loading, showing spinner')
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading authentication...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('ProfileSetup - No user found, showing spinner')
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading user data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="w-full max-w-md bg-[#2a2a2a] border-[#404040]">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">Complete Your Profile</CardTitle>
            <CardDescription className="text-gray-400">
              Set up your account to get started with Rhoda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Type Selection */}
              <div className="space-y-3">
                <Label className="text-white font-medium">I am a...</Label>
                <RadioGroup
                  value={profileType}
                  onValueChange={(value) => setProfileType(value as 'learner' | 'educator')}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="learner" id="learner" className="border-gray-500 text-white" />
                    <Label htmlFor="learner" className="cursor-pointer text-white">
                      Learner
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="educator" id="educator" className="border-gray-500 text-white" />
                    <Label htmlFor="educator" className="cursor-pointer text-white">
                      Educator
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="bg-[#404040] border-[#555555] text-white placeholder:text-gray-400 focus:border-white"
                />
              </div>

              {/* Age Field */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-white">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="Enter your age"
                  min="13"
                  max="120"
                  required
                  className="bg-[#404040] border-[#555555] text-white placeholder:text-gray-400 focus:border-white"
                />
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label className="text-white">
                  {profileType === 'learner' ? 'What would you like to learn?' : 'What do you teach?'}
                </Label>
                <Select onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="bg-[#404040] border-[#555555] text-white focus:border-white">
                    <SelectValue placeholder="Select a category" className="text-gray-400" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#404040] border-[#555555]">
                    {categories.map((category) => (
                      <SelectItem 
                        key={category} 
                        value={category}
                        className="text-white hover:bg-[#555555] focus:bg-[#555555]"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-gray-200 font-medium"
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? 'Creating Profile...' : 'Complete Setup'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
