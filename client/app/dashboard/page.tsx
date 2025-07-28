import React from 'react';
import { Bell, User } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="text-white text-2xl font-bold">
          Rhoda
        </div>
        
        <div className="flex items-center space-x-8">
          <NavLink>Dashboard</NavLink>
          <NavLink>Content</NavLink>
          <NavLink>About Us</NavLink>
          
          <Button variant="primary" className="text-sm">
            Create Content
          </Button>
          
          <div className="flex items-center space-x-4">
            <button className="text-white/80 hover:text-white transition-colors">
              <Bell size={20} />
            </button>
            
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">0</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-8 py-20">
        <div className="text-center space-y-8 max-w-4xl">
          {/* Welcome Message */}
          <h1 className="text-5xl md:text-6xl font-light text-white">
            Welcome <span className="font-semibold">John</span>
          </h1>
          
          {/* Subtitle */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-8 py-4 inline-block">
            <p className="text-white/90 text-lg font-medium">
              Discover Seamless WhatsApp Content Sharing and Management
            </p>
          </div>
          
          {/* CTA Button */}
          <div className="pt-4">
            <Button variant="primary" className="text-lg px-12 py-4 shadow-2xl">
              Write
            </Button>
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-teal-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default RhodaDashboard;