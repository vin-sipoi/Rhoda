"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Mail,
  Calendar,
  Edit,
  Settings,
  BookOpen,
  Award,
  Clock,
  Loader2
} from 'lucide-react'

interface Course {
  id: string
  title: string
  subtitle?: string
  content?: string
  image?: string
  category?: string
  readTime?: string
  enrolledAt?: string
}

const ProfilePage = () => {
  const { user, isLoading, token } = useAuth()
  const router = useRouter()
  const [recentCourses, setRecentCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/sign-in')
    }
  }, [user, isLoading, router])

  // Fetch recent courses
  React.useEffect(() => {
    const fetchRecentCourses = async () => {
      try {
        setLoadingCourses(true)
        const authToken = token || localStorage.getItem('jwt')

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }

        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`
        }

        const response = await fetch('/api/my-courses', { headers })

        if (!response.ok) {
          console.error('Failed to fetch recent courses:', response.status, response.statusText)
          setRecentCourses([])
          return
        }

        const data = await response.json()
        const courses: Course[] = data.courses || data.enrolled || []
        
        // Get the 3 most recent courses based on enrolledAt date
        const sortedCourses = courses
          .filter((course: Course) => course.enrolledAt)
          .sort((a: Course, b: Course) => {
            const dateA = a.enrolledAt ? new Date(a.enrolledAt).getTime() : 0
            const dateB = b.enrolledAt ? new Date(b.enrolledAt).getTime() : 0
            return dateB - dateA
          })
          .slice(0, 3)
        
        setRecentCourses(sortedCourses)
      } catch (error) {
        console.error('Error fetching recent courses:', error)
        setRecentCourses([])
      } finally {
        setLoadingCourses(false)
      }
    }

    if (user && token) {
      fetchRecentCourses()
    }
  }, [user, token])

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
        <div className="space-y-6">
        {/* Profile Header */}
        <Card className="border-none bg-[#181818] backdrop-blur supports-[backdrop-filter]:bg-[#181818]">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={(user as any).avatar} alt={user.username} />
                <AvatarFallback className="text-2xl">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {user.username}
                    </h1>
                    <p className="text-gray-300">@{user.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className='bg-[#181818] backdrop-blur supports-[backdrop-filter]:bg-[#181818]"' asChild>
                      <a href="/settings">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </a>
                    </Button>
                    <Button variant="outline" className='bg-[#181818] backdrop-blur supports-[backdrop-filter]:bg-[#181818]"' asChild>
                      <a href="/settings">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {user.role?.name || 'User'}
                  </Badge>
                  <Badge variant={user.confirmed ? "default" : "destructive"}>
                    {user.confirmed ? 'Verified' : 'Unverified'}
                  </Badge>
                  <Badge variant="outline">
                    {user.provider} Account
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card className="border-none bg-[#181818] backdrop-blur supports-[backdrop-filter]:bg-[#181818]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-white">Email</p>
                  <p className="text-sm text-gray-300">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-white">Username</p>
                  <p className="text-sm text-gray-300">@{user.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-white">Joined</p>
                  <p className="text-sm text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Stats */}
          <Card className="border-none bg-[#181818] backdrop-blur supports-[backdrop-filter]:bg-[#181818]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BookOpen className="h-5 w-5" />
                Learning Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-[#2a2a2a] rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <BookOpen className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{recentCourses.length}</p>
                  <p className="text-sm text-gray-300">Courses</p>
                </div>
                <div className="text-center p-4 bg-[#2a2a2a] rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{Math.floor(recentCourses.length / 2)}</p>
                  <p className="text-sm text-gray-300">Completed</p>
                </div>
                <div className="text-center p-4 bg-[#2a2a2a] rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{recentCourses.length * 2}h</p>
                  <p className="text-sm text-gray-300">Study Time</p>
                </div>
                <div className="text-center p-4 bg-[#2a2a2a] rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <User className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-sm text-gray-300">Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-none bg-[#181818] backdrop-blur supports-[backdrop-filter]:bg-[#181818]">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-gray-300">
              Your latest learning activities and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCourses ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-300 mx-auto mb-4" />
                <p className="text-gray-300">Loading recent courses...</p>
              </div>
            ) : recentCourses.length > 0 ? (
              <div className="space-y-4">
                {recentCourses.map((course, idx) => (
                  <Link
                    key={course.id || idx}
                    href={course.id ? `/dashboard/course/${course.id}` : '#'}
                    className="flex items-center space-x-4 p-4 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a] transition-colors duration-200"
                  >
                    <img
                      src={course.image && course.image.trim() !== "" ? course.image : "/file.svg"}
                      alt="course thumbnail"
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white mb-1 line-clamp-1">
                        {course.title}
                      </div>
                      <div className="text-sm text-gray-400 line-clamp-2">
                        {course.subtitle || (course.content ? course.content.substring(0, 80) + (course.content.length > 80 ? '...' : '') : '')}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          {course.category && (
                            <span className="text-xs  text-white px-2 py-1 rounded-2xl border-gray-100">
                              {course.category}
                            </span>
                          )}
                          {course.readTime && (
                            <span className="text-xs text-gray-400">
                              {course.readTime}
                            </span>
                          )}
                        </div>
                        {course.enrolledAt && (
                          <span className="text-xs text-gray-500">
                            Enrolled {new Date(course.enrolledAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="text-center pt-4">
                  <Button asChild variant="outline" className="bg-transparent border-gray-600 text-white hover:bg-[#2a2a2a]">
                    <Link href="/dashboard">
                      View All Courses
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">No recent activity</p>
                <p className="text-sm text-gray-400 mb-4">
                  Start learning to see your progress here
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/discover">
                    Explore Courses
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
