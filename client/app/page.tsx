"use client"

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import Link from "next/link"; 

// React Icons components (you'll need to install react-icons)
const FaInstagram = () => <span>IG</span>; // Replace with actual FaInstagram
const FaTiktok = () => <span>TT</span>; // Replace with actual FaTiktok  
const FaXTwitter = () => <span>X</span>; // Replace with actual FaXTwitter
const FaWhatsapp = () => <span>WA</span>; // Replace with actual FaWhatsapp

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

export default function CombinedPage() {
  const [currentView, setCurrentView] = useState<'landing' | 'discover'>('landing');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [allCourses, setAllCourses] = useState<CourseData[]>([]);

  useEffect(() => {
    fetch("/data/discoverCourses.json")
      .then((res) => res.json())
      .then((data) => setCategories(data));
    fetch("/data/courseData.json")
      .then((res) => res.json())
      .then((data) => setAllCourses(data.courses || []));
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCourses = selectedCategory
    ? allCourses.filter(
        (course) =>
          course.category.toLowerCase().replace(/ /g, "") ===
          selectedCategory.toLowerCase().replace(/ /g, "")
      )
    : [];

  const handleDiscoverClick = () => {
    setCurrentView('discover');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setSelectedCategory(null);
    setSearchQuery("");
  };

  // Landing Page Component
  const LandingView = () => (
    <div className="h-screen text-white flex flex-col relative overflow-hidden">
      {/* Gradient Background Overlay */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 800px 600px at 50% 50%, #61b693 0%, transparent 70%),
            radial-gradient(ellipse 700px 500px at 15% 85%, #2c304c 0%, #2c304c 30%, transparent 60%),
            radial-gradient(ellipse 600px 500px at 85% 15%, #1f2020 0%, #1f2020 40%, transparent 70%),
            radial-gradient(ellipse 600px 500px at 85% 85%, #1e1e1e 0%, #1e1e1e 40%, transparent 70%),
            radial-gradient(ellipse 500px 400px at 10% 10%, #1e1e1e 0%, transparent 60%),
            linear-gradient(135deg, #1e1e1e 0%, #2c304c 25%, #3c6351 50%, #61b693 75%, #1f2020 100%),
            #1e1e1e
          `,
        }}
      />
      
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 relative z-10 flex-shrink-0">
        <Link href="/">
          <span className="font-bold text-2xl">Rhoda</span>
        </Link>

        <button className="cursor-pointer border border-gray-200 hover:bg-gray-600 hover:text-white rounded-lg py-2 px-6 text-base font-medium transform transition hover:-translate-y-1 delay-150 duration-300 ease-in-out">
          Sign In
        </button>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col md:flex-row items-center justify-center px-6 md:px-16 gap-4 relative z-10 min-h-0">
        {/* Left Section */}
        <div className="flex-1 max-w-xl">
          <h1 className="text-3xl md:text-7xl font-extrabold mb-2">
            Welcome to <span className="text-[#F3C80F] underline decoration-4 decoration-orange-500">Rhoda</span>
          </h1>
          <p className="text-gray-200 mt-4 mb-6 text-base md:text-lg">
            Simplify content creation, management, and <br /> performance tracking  through WhatsApp and <br /> web interfaces.
          </p>
          
          <button 
            onClick={handleDiscoverClick}
            className="bg-orange-500 hover:bg-orange-600 text-[#FFFFFF] font-bold px-4 py-2 rounded-lg transition mb-4 text-base md:text-base cursor-pointer"
          >
            Share your first content
          </button>
        </div>
        
        {/* Center Illustration */}
        <div className="flex-1 flex flex-col items-center relative max-w-md">
          <div className="relative flex items-center justify-center w-[400px] h-[400px] md:w-[600px] md:h-[600px]">
            <img src="/landing.svg" alt="WhatsApp" width={512} height={512} className="object-contain w-full h-full" />         
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row items-center justify-between px-6 py-3 text-[#FFFFFF] font-normal text-base gap-2 relative z-10 flex-shrink-0"> 
        <div className="space-x-4">
          <button onClick={handleDiscoverClick}>Discover</button>
          <span>|</span>
          <button>Pricing</button>
          <span>|</span>
          <button>Privacy</button>
          <span>|</span>
          <button>Terms</button>
        </div>
        <div className="flex space-x-4 text-xl">
          <FaWhatsapp />
          <FaXTwitter />
          <FaInstagram />
          <FaTiktok />
        </div>
      </footer>
    </div>
  );

  // Discover Page Component
  const DiscoverView = () => (
    <div className="min-h-screen flex flex-col"
      style = {{
        background:`
            radial-gradient(ellipse 800px 600px at 50% 50%, #61b693 0%, transparent 70%),
            radial-gradient(ellipse 700px 500px at 15% 85%, #2c304c 0%, #2c304c 30%, transparent 60%),
            radial-gradient(ellipse 600px 500px at 85% 15%, #1f2020 0%, #1f2020 40%, transparent 70%),
            radial-gradient(ellipse 600px 500px at 85% 85%, #1e1e1e 0%, #1e1e1e 40%, transparent 70%),
            radial-gradient(ellipse 500px 400px at 10% 10%, #1e1e1e 0%, transparent 60%),
            linear-gradient(135deg, #1e1e1e 0%, #2c304c 25%, #3c6351 50%, #61b693 75%, #1f2020 100%),
            #1e1e1e
        `
      }}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-6">
         <button
          onClick={handleBackToLanding}
          className="flex items-center space-x-2 text-whitetransition-colors text-decoration-none cursor-pointer px-4 py-2 rounded-lg"
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
            <input
              type="text"
              placeholder="Search categories"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#353535] border border-transparent rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>
        </div>
      </div>

      {/* Category Cards */}
      {!selectedCategory ? (
        <main className="flex flex-col px-4 lg:px-8 py-10 flex-1 overflow-auto">
          <h2 className="text-white text-2xl font-bold mb-8">Discover Courses by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {filteredCategories.map((cat) => {
              const count = allCourses.filter(
                (course) =>
                  course.category.toLowerCase().replace(/ /g, "") ===
                  cat.category.toLowerCase().replace(/ /g, "")
              ).length;
              return (
                <button
                  key={cat.category}
                  className="bg-[#232323] hover:bg-[#353535] rounded-2xl p-8 flex flex-col items-center shadow-lg transition-all duration-200 border border-transparent hover:border-blue-500"
                  onClick={() => setSelectedCategory(cat.category)}
                >
                  <span className="text-3xl mb-4">{cat.category}</span>
                  <span className="text-white/70 text-sm">{count} Courses</span>
                </button>
              );
            })}
          </div>
        </main>
      ) : (
        <main className="flex flex-col px-4 lg:px-8 py-10 flex-1 overflow-auto">
          <button
            className="mb-6 text-blue-400 hover:underline text-left"
            onClick={() => setSelectedCategory(null)}
          >
            ← Back to Categories
          </button>
          <h2 className="text-white text-2xl font-bold mb-8">{selectedCategory} Courses</h2>
          <div className="flex flex-col space-y-4 lg:space-y-6 max-w-4xl mx-auto w-full">
            {selectedCourses.length > 0 ? (
              selectedCourses.map((item) => (
                <button
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl px-4 lg:px-6 py-4 lg:py-5 bg-white shadow-lg hover:shadow-xl transition-shadow duration-200`}
                >
                  <div className="flex items-start sm:items-center space-x-4 mb-4 sm:mb-0">
                    <img
                      src={item.image}
                      alt="avatar"
                      className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-white/40 object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base lg:text-lg text-gray-900 mb-1 line-clamp-2">
                        {item.title}
                      </div>
                      <div className="text-gray-700 text-sm mb-2 line-clamp-2 sm:line-clamp-1">
                        {item.author?.name}
                      </div>
                      {item.readTime && (
                        <div className="text-gray-600 text-xs">{item.readTime}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center text-white/80 py-10">
                No courses found in this category.
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );

  return (
    <div>
      {currentView === 'landing' ? <LandingView /> : <DiscoverView />}
    </div>
  );
}
