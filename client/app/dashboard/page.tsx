'use client'

import React, { useState } from 'react';
import { Bell, User, Search, FileText, Edit, Users, BookOpen, Download, Send, X, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '',
  onClick,
  style
}) => {
  const baseClasses = "px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105";
  const variantClasses = variant === 'primary' 
    ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl" 
    : "bg-white/10 hover:bg-white/20 text-white border border-white/20";
  
  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} onClick={onClick} style={style}>
      {children}
    </button>
  );
};

const RhodaDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const userName = 'John';

  const handleWriteClick = () => {
    router.push('/content');
  };

  const [activeTab, setActiveTab] = useState('Courses');
    
  const contentData: Record<string, Array<{ id?: string; avatar: string; title: string; subtitle: string; color: string; readTime?: string; progress?: number }>> = {
    Courses: [
      {
        id: '1',
        avatar: '/images/author1.jpg',
        title: "Mastering ChatGPT Blog Creation: Dos and Don'ts for SaaS Marketing Managers",
        subtitle: "Hello there! As a marketing manager in the SaaS industry, you might be looking for innovative ways to engage your audience.",
        color: 'bg-green-100',
        readTime: '5 min read',
        progress: 37
      },
    ],
    Published: [
      {
        avatar: '/public/avatar1.png',
        title: 'I Tried These Creative Challenges—Heres What They Taught Me',
        subtitle: 'From trending TikToks to 30-day content sprints, I share what worked, what flopped, and what surprised me.',
        color: 'bg-green-100',
        readTime: '3 min read',
        progress: 100
      },
      {
        avatar: '/public/avatar2.png',
        title: 'Lets Talk Trends: Whats Hot in Content Right Now and How I amm Responding',
        subtitle: 'A thoughtful analysis of current trends and how I adapt them to stay authentic and relevant.',
        color: 'bg-yellow-100',
        readTime: '7 min read',
        progress: 100
      },
      {
        avatar: '/public/avatar3.png',
        title: 'A Behind-the-Scenes Look at How I Bring My Content Ideas to Life',
        subtitle: 'Step into my creative world and see the real process behind planning, filming, and editing content.',
        color: 'bg-blue-100',
        readTime: '4 min read',
        progress: 100
      },
    ],
    'My Content': [],
    Drafts: [],
    Subscriptions: [],
  };

  const tabs = [
    { label: 'Courses', value: 'Courses', icon: <BookOpen size={18} /> },
    { label: 'My Content', value: 'My Content', icon: <FileText size={18} /> },
    { label: 'Drafts', value: 'Drafts', icon: <Edit size={18} /> },
    { label: 'Published', value: 'Published', icon: <Send size={18} /> },
    { label: 'Subscriptions', value: 'Subscriptions', icon: <Download size={18} /> } 
  ];

  const filteredContent = contentData[activeTab]?.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen flex bg-[#1e1e1e] relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-50
        w-64 h-screen border-r border-white/10 flex flex-col bg-[#1e1e1e]
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo and Close Button */}
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className="text-white text-2xl font-bold font-hahmlet">
            Rhoda
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/80 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-6">
          <div className="flex flex-col space-y-4">
            {tabs.map((item, index) => (
              <button
                key={index}
                className={`px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === item.value ? 'bg-gray-200 text-black' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => {
                  setActiveTab(item.value);
                  setSidebarOpen(false); // Close sidebar on mobile after selection
                }}
              >
                <div className="flex flex-row items-center gap-2">
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <nav className="font-hahmlet flex items-center justify-between px-4 lg:px-8 py-6">
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-white/80 hover:text-white transition-colors mr-4"
            >
              <Menu size={24} />
            </button>
            {/* Mobile Logo */}
            <Link href="/" className="lg:hidden text-white text-xl font-bold font-hahmlet">
              Rhoda
            </Link>
          </div>
          
          <div className="font-space-grotesk flex items-center space-x-2 lg:space-x-8">
            <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
              <NavLink>Dashboard</NavLink>
              <NavLink>Content</NavLink>
              <NavLink>About Us</NavLink>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Button 
                variant="primary" 
                className="text-xs lg:text-sm px-3 lg:px-6 py-1 lg:py-2" 
                onClick={handleWriteClick}
              >
                <span className="hidden sm:inline">Create Content</span>
                <span className="sm:hidden">Create</span>
              </Button>
              <button className="text-white/80 hover:text-white transition-colors">
                <Bell size={20} className="lg:hidden" />
                <Bell size={28} className="hidden lg:block" />
              </button>
              <div className="relative">
                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border-gray-200 flex items-center justify-center">
                  <User size={20} className="lg:hidden text-white" />
                  <User size={28} className="hidden lg:block text-white" />
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Welcome Section and Search Bar */}
        <div className="px-4 lg:px-7 py-3">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            {/* Welcome Section */}
            <div className="flex flex-col">
              <h1
                className="text-[#F3F3F3]"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: 'clamp(24px, 5vw, 35px)',
                  lineHeight: '1.2',
                  letterSpacing: '-2%',
                  margin: 0,
                }}
              >
                Welcome{' '}
                <span
                  style={{
                    fontWeight: 700,
                    fontStyle: 'bold',
                  }}
                >
                  {userName}
                </span>
              </h1>
              <div
                className="text-[#F3F3F3] mt-2"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: 'clamp(14px, 3vw, 18px)',
                }}
              >
                Discover Seamless WhatsApp Content Sharing and Management
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full lg:w-80 xl:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 lg:py-3 bg-[#3a3a3a] border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="font-space-grotesk flex flex-col px-4 lg:px-8 py-6 flex-1 overflow-auto">
          {/* Content Cards */}
          <div className="flex flex-col space-y-4 lg:space-y-6 max-w-4xl mx-auto w-full">
            {filteredContent.length > 0 ? (
              filteredContent.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.id ? `/dashboard/course/${item.id}` : '#'}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl px-4 lg:px-6 py-4 lg:py-5 ${item.color} shadow-lg hover:shadow-xl transition-shadow duration-200`}
                >
                  <div className="flex items-start sm:items-center space-x-4 mb-4 sm:mb-0">
                    <img 
                      src={item.avatar} 
                      alt="avatar" 
                      className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-white/40 object-cover flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base lg:text-lg text-gray-900 mb-1 line-clamp-2">
                        {item.title}
                      </div>
                      <div className="text-gray-700 text-sm mb-2 line-clamp-2 sm:line-clamp-1">
                        {item.subtitle}
                      </div>
                      {item.readTime && (
                        <div className="text-gray-600 text-xs">{item.readTime}</div>
                      )}
                    </div>
                  </div>
                  {item.progress !== undefined && (
                    <div className="flex items-center justify-center sm:justify-end">
                      <div className="relative w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center">
                        <svg width="48" height="48" viewBox="0 0 48 48" className="absolute top-0 left-0 lg:w-14 lg:h-14">
                          <circle cx="24" cy="24" r="20" stroke="#e5e5e5" strokeWidth="4" fill="none" />
                          <circle 
                            cx="24" 
                            cy="24" 
                            r="20" 
                            stroke="#61b693" 
                            strokeWidth="4" 
                            fill="none" 
                            strokeDasharray="125.6" 
                            strokeDashoffset={125.6 - (125.6 * item.progress / 100)} 
                          />
                        </svg>
                        <span className="font-bold text-sm lg:text-lg text-gray-900 z-10">{item.progress}%</span>
                      </div>
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <div className="text-center text-white/80 py-10">
                {searchQuery ? 'No content matches your search.' : 'No content available.'}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RhodaDashboard;