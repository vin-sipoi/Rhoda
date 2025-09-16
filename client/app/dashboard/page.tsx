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

        console.log('Fetching user courses with token:', !!authToken);
        const response = await fetch('/api/my-courses', { headers });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to fetch user courses:', response.status, response.statusText, errorData);
          return;
        }

        const data = await response.json();
        console.log('Dashboard received data:', data);
        
        const courses = data.courses || data.enrolled || [];
        console.log('Setting enrolled courses:', courses);
        courses.forEach((course: any, index: number) => {
          console.log(`Course ${index}:`, {
            id: course.id,
            title: course.title,
            subtitle: course.subtitle
          });
        });
        
        setEnrolled(courses);
      } catch (error) {
        console.error('Error fetching user courses:', error);
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



  // Ensure each course card has a visible background color
  const getCardColor = (item: any, idx: number) => {
    // Use color from item if present, else fallback to a visible default
    return item.color || [
      'bg-green-100',
      'bg-yellow-100',
      'bg-blue-100',
      'bg-purple-100',
      'bg-pink-100',
      'bg-orange-100',
      'bg-red-100',
    ][idx % 7];
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {enrolled
              .filter(item =>
                item.title?.toLowerCase?.().includes(searchQuery.toLowerCase()) ||
                item.subtitle?.toLowerCase?.().includes(searchQuery.toLowerCase())
              )
              .map((item, idx) => (
                <Link
                  key={item.id || idx}
                  href={item.id ? `/dashboard/course/${item.id}` : '#'}
                  className={`flex flex-col rounded-2xl px-4 lg:px-6 py-4 lg:py-5 ${getCardColor(item, idx)} shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer`}
                  onClick={() => console.log('Clicking course:', item.id, 'URL:', `/dashboard/course/${item.id}`)}
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base lg:text-lg text-gray-900 mb-1 line-clamp-2">
                        {item.title}
                      </div>
                      <div className="text-gray-700 text-sm mb-2 line-clamp-2">
                        {item.subtitle}
                      </div>
                      {item.readTime && (
                        <div className="text-gray-600 text-xs">{item.readTime}</div>
                      )}
                    </div>
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