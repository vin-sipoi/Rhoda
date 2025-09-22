"use client"

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Search } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import axios from "axios";

interface Category {
  category: string;
}

interface CourseData {
  id: string;
  category: string;
  title: string;
  date: string;
  readTime: string;
  image: string;
  content: string;
  author: any;
  shareText: string;
  articleSections: string[];
  relatedArticles: any[];
}

const DiscoverPage: React.FC = () => {
  const { user, token, isAuthenticated } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [allCourses, setAllCourses] = useState<CourseData[]>([]);
  const [openCourse, setOpenCourse] = useState<CourseData | null>(null);

  // Function to enroll user in a course
  const enrollInCourse = async (courseId: string) => {
    if (!user) return;
    
    try {
      const authToken = token || localStorage.getItem('jwt');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/user-courses', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          courseId: courseId,
          userId: user.id,
        })
      });
      
      if (response.ok) {
        const data = await response.json();
      }
    } catch (err) {
      console.error('Enrollment error:', err);
    }
  };

  // Enroll user in course when opening dialog (if authenticated)
  useEffect(() => {
    const enroll = async () => {
      if (openCourse && user) {
        try {
          const authToken = token || localStorage.getItem('jwt');
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };

          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }

          const response = await fetch('/api/user-courses', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              courseId: openCourse.id,
              userId: user.id,
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Enrollment failed:', errorData);
          } else {
            const data = await response.json();
          }
        } catch (err) {
          console.error('Enrollment error:', err);
        }
      }
    };
    enroll();
    // Only run when openCourse changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCourse]);

  useEffect(() => {
    const authToken = localStorage.getItem('jwt');
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    
    axios
      .get("/api/discover", { headers })
      .then((res) => {
        setCategories(res.data?.categories || []);
        setAllCourses(res.data?.courses || []);
      })
      .catch(() => {
        fetch("/data/discoverCourses.json")
          .then((res) => res.json())
          .then((data) => setCategories(data));
        fetch("/data/courseData.json")
          .then((res) => res.json())
          .then((data) => setAllCourses(data.courses || []));
      });
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // When a category is selected, show courses from courseData.json that match the category
  const selectedCourses = selectedCategory
    ? allCourses.filter(
        (course) =>
          course.category.toLowerCase().replace(/ /g, "") ===
          selectedCategory.toLowerCase().replace(/ /g, "")
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#1e1e1e]">
      {/* Top Bar */}
      

      {/* Category Cards or All Courses fallback */}
      {!selectedCategory ? (
        <main className="flex flex-col px-4 lg:px-8 py-10 flex-1 overflow-auto">
          {categories.length > 0 ? (
            <>

              <div className=" px-6 py-4 mb-6 flex justify-center">
                <div className="relative w-full max-w-xl">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                  <input
                    type="text"
                    placeholder="Search categories"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#353535] border border-transparent rounded-3xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto cursor-pointer">
                {filteredCategories.map((cat) => {
                  // Get the most recent course date for this category
                  const categoryData = allCourses.filter(
                    (course) =>
                      course.category.toLowerCase().replace(/ /g, "") ===
                      cat.category.toLowerCase().replace(/ /g, "")
                  );
                  const latestDate = categoryData.length > 0 
                    ? new Date(Math.max(...categoryData.map(course => new Date(course.date).getTime())))
                    : new Date();
                  
                  return (
                    <button
                      key={cat.category}
                      className="bg-[#232323] hover:bg-[#353535] rounded-3xl p-6 flex flex-col items-center justify-between shadow-lg transition-all duration-200 border border-transparent hover:border-blue-500 min-h-[160px]"
                      onClick={() => setSelectedCategory(cat.category)}
                    >
                      <div className="flex flex-col items-center flex-1 justify-center">
                        <span className="text-2xl mb-3 text-center">{cat.category}</span>
                      </div>
                      <span className="text-white/70 text-xs mt-auto">
                        Updated {latestDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-white text-2xl font-bold mb-8">All Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
                {allCourses.length > 0 ? (
                  allCourses.map((item) => (
                    <button
                      key={item.id}
                      onClick={async () => {
                        if (isAuthenticated) {
                          await enrollInCourse(item.id);
                          window.location.href = `/dashboard/course/${item.id}`;
                        } else {
                          setOpenCourse(item);
                        }
                      }}
                      className="flex flex-col rounded-3xl px-6 py-6 bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 min-h-[200px] text-left w-full"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <img
                          src={item.image && item.image.trim() !== "" ? item.image : "/file.svg"}
                          alt="avatar"
                          className="w-14 h-14 rounded-full border-2 border-gray-200 object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 leading-tight">
                            {item.title}
                          </div>
                          <div className="text-gray-600 text-sm font-medium">
                            by {item.author?.name || 'Unknown Author'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {item.readTime && (
                            <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full">
                              {item.readTime}
                            </span>
                          )}
                          <span className="text-gray-500 text-xs">
                            {item.category}
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {new Date(item.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-full text-center text-white/80 py-10">No courses available.</div>
                )}
              </div>
            </>
          )}
        </main>
      ) : (
        <main className="flex flex-col px-4 lg:px-8 py-10 flex-1 overflow-auto">
          <button
            className="mb-6 text-[gray-200] text-left cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            Back to Categories
          </button>
          <h2 className="text-white text-2xl font-bold mb-8">{selectedCategory} Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
            {selectedCourses.length > 0 ? (
              <>
                {selectedCourses.map((item) => (
                  <button
                    key={item.id}
                    className="flex flex-col rounded-3xl px-6 py-6 bg-white shadow-lg hover:shadow-xl transition-all duration-200 text-left hover:scale-105 min-h-[200px]"
                    onClick={async () => {
                      if (isAuthenticated) {
                        await enrollInCourse(item.id);
                        window.location.href = `/dashboard/course/${item.id}`;
                      } else {
                        setOpenCourse(item);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={item.image && item.image.trim() !== "" ? item.image : "/file.svg"}
                        alt="avatar"
                        className="w-14 h-14 rounded-full border-2 border-gray-200 object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 leading-tight">
                          {item.title}
                        </div>
                        <div className="text-gray-600 text-sm font-medium">
                          by {item.author?.name || 'Unknown Author'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {item.readTime && (
                          <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {item.readTime}
                          </span>
                        )}
                        <span className="text-gray-500 text-xs">
                          {item.category}
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {new Date(item.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </button>
                ))}
                {/* Dialog for course content */}
                <Dialog open={!!openCourse} onOpenChange={(open) => !open && setOpenCourse(null)}>
                  <DialogContent>
                    {openCourse && (
                      <>
                        <DialogHeader>
                          <DialogTitle>{openCourse.title}</DialogTitle>
                          <DialogDescription>
                            {openCourse.category} &middot; {openCourse.readTime}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 text-gray-900 whitespace-pre-line max-h-60 overflow-y-auto">
                          {openCourse.content ? openCourse.content.slice(0, 400) + (openCourse.content.length > 400 ? '...' : '') : 'No content available.'}
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                          {isAuthenticated ? (
                            <Link
                              href={`/dashboard/course/${openCourse.id}`}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                              Read More
                            </Link>
                          ) : (
                            <>
                              <button
                                onClick={() => setOpenCourse(null)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                              >
                                Cancel
                              </button>
                              <Link
                                href="/auth/sign-in"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                              >
                                Sign In to Continue
                              </Link>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <div className="col-span-full text-center text-white/80 py-10">
                No courses found in this category.
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
};

export default DiscoverPage;
