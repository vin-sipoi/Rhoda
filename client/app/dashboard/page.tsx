'use client'

import React, { useState } from 'react';
import { Bell, User } from 'lucide-react';
import Squares from '@/components/Squares';

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
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '' 
}) => {
  const baseClasses = "px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105";
  const variantClasses = variant === 'primary' 
    ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl" 
    : "bg-white/10 hover:bg-white/20 text-white border border-white/20";
  
  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </button>
  );
};

const RhodaDashboard: React.FC = () => {
  const [user,setUser] = useState(false);

  const userName = 'John'

  return (
    <div className="min-h-screen relative overflow-hidden">
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
      
      {/* Navigation Header */}
      <nav className="font-hahmlet flex items-center justify-between px-8 py-6 relative z-10  cursor-pointer">
        <div className="text-white text-2xl font-bold">
          Rhoda
        </div>
        
        <div className="font-space-grotesk flex items-center space-x-8  px-5">          
            <NavLink>Dashboard</NavLink>
            <NavLink>Content</NavLink>
            <NavLink>About Us</NavLink>

          <div className="flex items-center space-x-4 ml-5">
            <Button variant="primary" className="text-sm">
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
      <div className="font-space-grotesk flex flex-col items-center justify-center px-8 py-20 relative z-10">
        <div className="text-center space-y-8 max-w-4xl">
          {/* Welcome Message */}
         <h1 className="text-5xl md:text-6xl font-light text-white">
            {user ? "Welcome back" : "Welcome"}{" "}
            <span className="font-semibold">{userName}</span>
          </h1>
          
          {/* Subtitle */}
          <div className="bg-white/10 mx-4 p-3 backdrop-blur-sm border border-white/20 rounded-full px-8 py-4 inline-block">
            <p className="text-white/90 text-lg font-medium">
              Discover Seamless WhatsApp Content Sharing and Management
            </p>
          </div>
          
          {/* CTA Button */}
          <div className="pt-4">
            <Button variant="primary" className="text-lg font-semibold px-20 py-2 shadow-2xl ">
              Write
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RhodaDashboard;