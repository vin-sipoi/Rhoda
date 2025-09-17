'use client'

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface NavLinkProps {
  children: React.ReactNode;
  href?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ children, href = "#" }) => (
  <a
    href={href}
    className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium"
  >
    {children}
  </a>
);

const RhodaDashboard: React.FC = () => {
  // All hooks at the top, before any early returns
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [enrolled, setEnrolled] = useState<any[]>([]);


  React.useEffect(() => {
    const fetchUserCourses = async () => {
      try {
        // Get user token from auth context
        const authToken = token || localStorage.getItem('jwt');

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch('/api/my-courses', { headers });

        if (!response.ok) {
          try {
            const errorData = await response.json();
            console.error('Failed to fetch user courses:', response.status, response.statusText, errorData);
          } catch (jsonError) {
            console.error('Failed to fetch user courses (non-JSON response):', response.status, response.statusText);
          }
          return;
        }

        const data = await response.json();
        const courses = data.courses || data.enrolled || [];
        setEnrolled(courses);
      } catch (error) {
        console.error('Error fetching user courses:', error);
        // Set empty courses array to prevent UI from breaking
        setEnrolled([]);
      }
    };

    if (isAuthenticated && user && token) {
      fetchUserCourses();
    }
  }, [isAuthenticated, user, token]);

  // Authentication check
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e]">
      {/* Header Section with Search */}
      <div className=" px-6 py-4 flex justify-center">
        {/* Search Bar */}
        <div className="relative max-w-xl w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
          <input
            type="text"
            placeholder="Search your courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#353535] border border-transparent rounded-3xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">My Courses</h1>
          <p className="text-gray-400">Continue your learning journey</p>
        </div>

        {enrolled.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {enrolled
              .filter(item =>
                item.title?.toLowerCase?.().includes(searchQuery.toLowerCase()) ||
                item.subtitle?.toLowerCase?.().includes(searchQuery.toLowerCase()) ||
                item.category?.toLowerCase?.().includes(searchQuery.toLowerCase())
              )
              .map((item, idx) => (
                <Link
                  key={item.id || idx}
                  href={item.id ? `/dashboard/course/${item.id}` : '#'}
                  className="flex flex-col rounded-3xl px-6 py-6 bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 min-h-[200px] text-left w-full"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={item.image && item.image.trim() !== "" ? item.image : "/file.svg"}
                      alt="course thumbnail"
                      className="w-14 h-14 rounded-full border-2 border-gray-200 object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 leading-tight">
                        {item.title}
                      </div>
                      <div className="text-gray-600 text-sm font-medium">
                        Continue Learning
                      </div>
                    </div>
                  </div>

                  <div className="text-gray-700 text-sm mb-4 line-clamp-3 flex-1">
                    {item.subtitle || item.content?.substring(0, 120) + (item.content?.length > 120 ? '...' : '')}
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {item.readTime && (
                        <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {item.readTime}
                        </span>
                      )}
                      {item.category && (
                        <span className="text-gray-500 text-xs">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {item.enrolledAt && (
                      <span className="text-gray-400 text-xs">
                        Enrolled {new Date(item.enrolledAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
          </div>
        ) : (
          <div className="text-center text-white/80 py-10">
            {searchQuery ? 'No courses match your search.' : 'No courses enrolled yet.'}
          </div>
        )}
      </main>
    </div>
  );
};

export default RhodaDashboard;