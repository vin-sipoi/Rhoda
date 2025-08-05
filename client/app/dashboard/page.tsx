'use client'

import React, { useState } from 'react';
import { Bell, User } from 'lucide-react';
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
  const [user, setUser] = useState(false);
  const router = useRouter();

  const userName = 'John';

  const handleWriteClick = () => {
    router.push('/content');
  };

 
  const [activeTab, setActiveTab] = useState('Courses');

  
  const contentData: Record<string, Array<{ id?: string; avatar: string; title: string; subtitle: string; color: string }>> = {
    Courses: [
      {
        id: '1',
        avatar: '/images/author1.jpg',
        title: "Mastering ChatGPT Blog Creation: Dos and Don'ts for SaaS Marketing Managers",
        subtitle: "Hello there! As a marketing manager in the SaaS industry, you might be looking for innovative ways to engage your audience.",
        color: 'bg-green-100',
      },
    ],
    Published: [
      {
        avatar: '/public/avatar1.png',
        title: 'I Tried These Creative Challenges—Here’s What They Taught Me',
        subtitle: 'From trending TikToks to 30-day content sprints, I share what worked, what flopped, and what surprised me.',
        color: 'bg-green-100',
      },
      {
        avatar: '/public/avatar2.png',
        title: 'Let’s Talk Trends: What’s Hot in Content Right Now and How I’m Responding',
        subtitle: 'A thoughtful analysis of current trends and how I adapt them to stay authentic and relevant.',
        color: 'bg-yellow-100',
      },
      {
        avatar: '/public/avatar3.png',
        title: 'A Behind-the-Scenes Look at How I Bring My Content Ideas to Life',
        subtitle: 'Step into my creative world and see the real process behind planning, filming, and editing content.',
        color: 'bg-blue-100',
      },
    ],
    'My Content': [],
    Drafts: [],
    Subscriptions: [],
  };

  const tabs = ['Courses', 'My Content', 'Drafts', 'Published', 'Subscriptions'];

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-between bg-[#1e1e1e]">
      {/* Background */}
     {/* <div
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 800px 600px at 50% 50%, #61b693 0%, transparent 70%),
            radial-gradient(ellipse 700px 500px at 15% 85%, #2c304c 0%, #2c304c 30%, transparent 60%),
            radial-gradient(ellipse 600px 500px at 85% 15%, #1f2020 0%, #1f2020 40%, transparent 70%),
            radial-gradient(ellipse 600px 500px at 85% 85%, #1e1e1e 0%, #1e1e1e 40%, transparent 70%),
            radial-gradient(ellipse 500px 400px at 10% 10%, #1e1e1e 0%, transparent 60%);
            linear-gradient(135deg, #1e1e1e 0%, #2c304c 25%, #3c6351 50%, #61b693 75%, #1f2020 100%),
            #1e1e1e
          `,
        }}
      />*/}

      {/* Navigation Header */}
      <nav className="font-hahmlet flex items-center justify-between px-8 py-6 relative z-10 cursor-pointer">
        <Link href="/" className="text-white text-2xl font-bold">
          Rhoda
        </Link>
        <div className="font-space-grotesk flex items-center space-x-8 px-5">
          <NavLink>Dashboard</NavLink>
          <NavLink>Content</NavLink>
          <NavLink>About Us</NavLink>
          <div className="flex items-center space-x-4 ml-5">
            <Button variant="primary" className="text-sm" onClick={handleWriteClick}>
              Create Content
            </Button>
            <button className="text-white/80 hover:text-white transition-colors">
              <Bell size={28} />
            </button>
            <div className="relative">
              <div className="w-8 h-8 rounded-full border-gray-200 flex items-center justify-center">
                <User size={28} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="font-space-grotesk flex flex-col items-center justify-start px-8 py-10 relative z-10 flex-1 w-full">
        {/* Welcome Section */}
        <div className="flex items-center justify-between w-full max-w-4xl mb-6">
          <div className="flex flex-col">
            <h1
              className="text-[#F3F3F3]"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 400,
                fontStyle: 'normal',
                fontSize: '35px',
                lineHeight: '72px',
                letterSpacing: '-4%',
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
              className="text-[#F3F3F3]"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 400,
                fontStyle: 'normal',
                fontSize: '18px',
                marginTop: '-10px',
              }}
            >
              Discover Seamless WhatsApp Content Sharing and Management
            </div>
          </div>
          <Button
            variant="primary"
            className="shadow-2xl text-2xl"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              borderRadius: '10px',
              padding: '8px 14px',
            }}
            onClick={handleWriteClick}
          >
            Write
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6 w-full">
          <div className="flex space-x-2 bg-[#7c7c7c]/30 rounded-lg px-2 py-2 w-full max-w-4xl">
            {tabs.map(tab => (
              <button
                key={tab}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-base transition-colors duration-200 ${activeTab === tab ? 'bg-white text-gray-900 shadow' : 'bg-transparent text-white/80 hover:text-white'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Cards */}
        <div className="flex flex-col space-y-6 w-full max-w-4xl">
          {contentData[activeTab] && contentData[activeTab].length > 0 ? (
            contentData[activeTab].map((item: { id?: string; avatar: string; title: string; subtitle: string; color: string }, idx: number) => (
              <Link
                key={idx}
                href={item.id ? `/dashboard/course/${item.id}` : '#'}
                className={`flex items-center justify-between rounded-2xl px-6 py-5 ${item.color} shadow-lg`}
              >
                <div className="flex items-center">
                  <img src={item.avatar} alt="avatar" className="w-12 h-12 rounded-full mr-4 border-2 border-white/40 object-cover" />
                  <div>
                    <div className="font-bold text-lg text-gray-900 mb-1">{item.title}</div>
                    <div className="text-gray-700 text-sm">{item.subtitle}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg width="56" height="56" viewBox="0 0 56 56" className="absolute top-0 left-0">
                      <circle cx="28" cy="28" r="25" stroke="#e5e5e5" strokeWidth="6" fill="none" />
                      <circle cx="28" cy="28" r="25" stroke="#61b693" strokeWidth="6" fill="none" strokeDasharray="157" strokeDashoffset="99" />
                    </svg>
                    <span className="font-bold text-lg text-gray-900 z-10">37%</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center text-white/80 py-10">No content available.</div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col items-center justify-center py-8 px-4 z-10">
        <div className="flex justify-between items-center w-full max-w-4xl">
          <div className="flex space-x-6 text-white/80 text-base">
            <span>Discover</span>
            <span>|</span>
            <span>Pricing</span>
            <span>|</span>
            <span>Privacy</span>
            <span>|</span>
            <span>Terms</span>
          </div>
          <div className="flex space-x-4 text-white text-2xl">
            <span className="inline-block"><i className="fab fa-whatsapp" /></span>
            <span className="inline-block"><i className="fab fa-x-twitter" /></span>
            <span className="inline-block"><i className="fab fa-instagram" /></span>
            <span className="inline-block"><i className="fab fa-tiktok" /></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RhodaDashboard;
