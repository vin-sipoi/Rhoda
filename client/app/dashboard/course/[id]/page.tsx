'use client';

import React, { useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import courseData from '../../../../data/courseData.json';
import { ArrowLeft } from 'lucide-react';

interface Params {
  params: {
    id: string;
  };
}

const CourseDetailPage: React.FC<Params> = ({ params }) => {
  const { id } = params;
  const course = courseData.courses.find(c => c.id === id);
  const [checkedSections, setCheckedSections] = useState<number[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const sidebarSections = [
    "Introduction",
    "Exploring Generative AI in Content Creation",
    "Steering Clear of Common AI Writing Pitfalls",
    "Understanding ChatGPT Capabilities - Define Your Style",
    "Understand Your Readers",
    "Creating Quality AI-powered Blogs that Stand Out",
    "Conclusion: Embracing AI in Blog Creation",
    "Afterword: The AI Behind This Article"
  ];

  if (!course) {
    notFound();
  }

  const progress = (checkedSections.length / sidebarSections.length) * 100;

  const toggleSectionCheck = (index: number) => {
    setCheckedSections(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleNextClick = () => {
    const nextSection = currentSection + 1;
    if (nextSection < sidebarSections.length) {
      setCurrentSection(nextSection);
      if (!checkedSections.includes(nextSection)) {
        setCheckedSections(prev => [...prev, nextSection]);
      }
    }
  };

  return (
    <div className="relative min-h-screen text-white font-space-grotesk max-w-7xl mx-auto">
      {/* Custom Styles */}
      <style jsx global>{`
        /* Scrollbar Styles */
        html {
          scrollbar-width: thin;
          scrollbar-color: #4ade80 #1e293b;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1e293b;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #4ade80;
          border-radius: 10px;
          border: 1px solid #1e293b;
        }

        /* Progress Bar Styles */
        .progress-panel {
          background: rgba(20, 20, 20, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          width: 100%;
        }
        .progress-wrapper {
          position: relative;
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .progress-line {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background: linear-gradient(90deg, rgba(0, 255, 157, 0.7), rgba(0, 255, 157, 0.3));
          border-radius: 20px;
          animation: progressGlow 2s infinite;
          transition: width 0.3s ease;
        }
        .progress-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 1px, transparent 1px);
          background-size: 8px 8px;
          animation: particleFlow 20s linear infinite;
        }
        .system-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .status-indicator {
          width: 8px;
          height: 8px;
          background: #00ff9d;
          border-radius: 50%;
          animation: pulse 2s infinite ease-in-out;
        }
        .status-text {
          font-size: 12px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: 1px;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
        @keyframes progressGlow {
          0%, 100% { opacity: 1; box-shadow: 0 0 20px rgba(0, 255, 157, 0.3); }
          50% { opacity: 0.8; box-shadow: 0 0 30px rgba(0, 255, 157, 0.5); }
        }
        @keyframes particleFlow {
          0% { background-position: 0 0; }
          100% { background-position: 100% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .status-indicator, .progress-line, .progress-particles {
            animation: none;
          }
        }
      `}</style>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div className="progress-panel max-w-sm ml-auto">
          <div className="progress-section">
            <div className="progress-wrapper">
              <div 
                className="progress-line" 
                style={{ width: `${progress}%` }}
              />
              <div className="progress-particles" />
            </div>
            <div className="flex justify-between items-center">
              <div className="system-status">
                <div className="status-indicator" />
                <div className="status-text">PROGRESS</div>
              </div>
              <div className="text-sm font-medium text-[#00ff9d]">
                {Math.round(progress)}% COMPLETE
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 px-4 py-6 pt-32">
        {/* Main Content */}
        <div className="flex-1 space-y-6 pb-20 relative">
          <Link
            href="/dashboard"
            className="absolute top-0 left-0 bg-white/10 hover:bg-white/20 text-white font-medium p-2 rounded-full shadow-lg transition-all z-40 flex items-center justify-center"
            aria-label="Back to Dashboard"
            style={{ top: '-4.5rem', left: '0rem' }}
          >
            <ArrowLeft size={24} />
          </Link>
          <img
            src={course.image}
            alt={course.title}
            className="rounded-lg w-full max-h-[400px] object-cover"
          />
          <div className="inline-block bg-white/20 rounded-full px-3 py-1 text-sm font-semibold mb-2">
            {course.category}
          </div>
          
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold leading-tight flex-1">
              {course.title}
            </h1>
            <button 
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="p-2 text-white/70 hover:text-yellow-400 transition-colors"
              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill={isBookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </div>

          <div className="text-sm text-white/70 mb-6">
            {course.date} &bull; {course.readTime}
          </div>

          <div className="mb-10">
           
            <p className="whitespace-pre-line text-white/90">
              Hello there! As a marketing manager in the SaaS industry, you might be looking for innovative ways to engage your audience. I bet generative AI has crossed your mind as an option for creating content. Well, let me share from my firsthand experience.
            </p>
            <p className="mt-4">
              Google encourages high-quality blogs regardless of whether they're written by humans or created using artificial intelligence like ChatGPT. Here's what matters: producing original material with expertise and trustworthiness based on Google E-E-A-T principles.
            </p>
            <p className="mt-4">
              This means focusing more on people-first writing rather than primarily employing AI tools to manipulate search rankings. There comes a time when many experienced professionals want to communicate their insights but get stuck due to limited writing skills – that's where Generative AI can step in.
            </p>
          </div>
          
          {/* Next Button */}
          <button
            onClick={handleNextClick}
            className="fixed bottom-8 right-8 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-full shadow-lg transition-all z-40 flex items-center gap-2"
          >
            Next Section
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Sidebar */}
        <aside className="w-full md:w-80 space-y-6 sticky top-32 h-fit">
          <div className="bg-white/10 rounded-xl p-6 border border-white/5 backdrop-blur-sm">
            <div className="font-semibold mb-4">In this article</div>
            <ul className="space-y-3">
              {sidebarSections.map((section, idx) => (
                <li key={idx} className="flex items-start">
                  <input
                    type="checkbox"
                    checked={checkedSections.includes(idx)}
                    onChange={() => toggleSectionCheck(idx)}
                    className="mt-1 mr-3 cursor-pointer rounded border-white/30 focus:ring-green-400 text-green-500"
                  />
                  <span 
                    className={`text-sm cursor-pointer transition-colors ${
                      checkedSections.includes(idx) ? 'text-green-400 font-medium' : 'text-white/80 hover:text-white'
                    }`}
                    onClick={() => toggleSectionCheck(idx)}
                  >
                    {section}
                  </span>
                </li>
              ))}

            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CourseDetailPage;