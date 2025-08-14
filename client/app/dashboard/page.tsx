'use client'

import React, { useState } from 'react';
import { Bell, User, Search, FileText, Edit, Users, BookOpen, Download, Send, X, Menu, TrendingUp, Bookmark, Check, LogOut } from 'lucide-react';
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
    Published: [
     
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
        w-64 h-screen border-r border-white/10 flex flex-col bg-[#181818]
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo and Close Button */}
        <div className="p-6 flex items-center justify-between">
          <span className="text-white text-2xl font-bold font-hahmlet">Rhoda</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/80 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-6 flex flex-col justify-between">
          <div className="flex flex-col gap-1">
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base bg-[#232323] text-white" disabled>
              <Users size={20} />
              <span>My Courses</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base text-white/80 hover:text-white hover:bg-[#232323]">
              <TrendingUp size={20} />
              <span>Not Started</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base text-white/80 hover:text-white hover:bg-[#232323]">
              <TrendingUp size={20} />
              <span>In Progress</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base text-white/80 hover:text-white hover:bg-[#232323]">
              <Bookmark size={20} />
              <span>Bookmarks</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base text-white/80 hover:text-white hover:bg-[#232323]">
              <Check size={20} />
              <span>Completed</span>
            </button>
          </div>
          {/* Logout button removed; should only appear after authentication */}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar (matches image: search bar, bell, avatar) */}
        <div className="flex items-center justify-between px-6 py-6 bg-[#232323] border-b border-[#232323]">
          {/* Search Bar Centered */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#353535] border border-transparent rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
          </div>
          {/* Bell and Avatar */}
          <div className="flex items-center gap-4 ml-6">
            <button className="text-white/80 hover:text-white transition-colors">
              <Bell size={24} />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 flex items-center justify-center bg-[#353535]">
              {/* Example avatar, replace src as needed */}
              <img src="/images/author1.jpg" alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Main Content Area - Fixed Grid Layout */}
        <main className="p-6">
          {filteredContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredContent.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.id ? `/dashboard/course/${item.id}` : '#'}
                  className={`flex flex-col rounded-2xl px-4 lg:px-6 py-4 lg:py-5 ${item.color} shadow-lg hover:shadow-xl transition-shadow duration-200`}
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
              {searchQuery ? 'No content matches your search.' : 'No content available.'}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RhodaDashboard;