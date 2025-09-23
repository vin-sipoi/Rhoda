'use client';

import React, { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  content: string;
  image: string;
  order?: number;
}

interface Course {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  content: string;
}

interface Comment {
  id: string;
  content: string;
  rating?: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  isApproved: boolean;
}

const CourseDetailPage: React.FC = () => {
  const routeParams = useParams();
  const id = Array.isArray(routeParams?.id) ? routeParams.id[0] : (routeParams?.id as string);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedSections, setCheckedSections] = useState<number[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Function to render Strapi content with formatting preserved
  const renderFormattedContent = (content: any): React.ReactNode => {
    if (!content) return null;

    // If it's already a string, return it
    if (typeof content === 'string') return content;

    // If it's an array, render each item
    if (Array.isArray(content)) {
      return content.map((item, index) => (
        <React.Fragment key={index}>
          {renderFormattedContent(item)}
          {item && typeof item === 'object' && item.type === 'paragraph' && index < content.length - 1 && <br />}
        </React.Fragment>
      ));
    }

    // Handle specific Strapi rich text types
    if (typeof content === 'object' && content.type) {
      switch (content.type) {
        case 'paragraph':
          return (
            <p className="mb-4 last:mb-0">
              {content.children && renderFormattedContent(content.children)}
            </p>
          );
        case 'text':
          const text = content.text || '';
          let element: React.ReactNode = text;

          // Apply formatting based on Strapi text formatting
          if (content.bold) {
            element = <strong>{element}</strong>;
          }
          if (content.italic) {
            element = <em>{element}</em>;
          }
          if (content.underline) {
            element = <u>{element}</u>;
          }
          if (content.strikethrough) {
            element = <s>{element}</s>;
          }

          return element;
        case 'heading':
          const level = Math.min(6, Math.max(1, content.level || 1));
          const headingClasses = {
            1: 'text-2xl font-bold mb-4',
            2: 'text-xl font-bold mb-3',
            3: 'text-lg font-bold mb-3',
            4: 'text-base font-bold mb-2',
            5: 'text-sm font-bold mb-2',
            6: 'text-xs font-bold mb-2'
          };

          // Create heading element based on level
          const className = headingClasses[level as keyof typeof headingClasses] || headingClasses[1];
          const children = content.children && renderFormattedContent(content.children);

          switch (level) {
            case 1: return <h1 className={className}>{children}</h1>;
            case 2: return <h2 className={className}>{children}</h2>;
            case 3: return <h3 className={className}>{children}</h3>;
            case 4: return <h4 className={className}>{children}</h4>;
            case 5: return <h5 className={className}>{children}</h5>;
            case 6: return <h6 className={className}>{children}</h6>;
            default: return <h1 className={className}>{children}</h1>;
          }
        case 'list':
          const listClass = content.format === 'ordered' ? 'list-decimal list-inside mb-4' : 'list-disc list-inside mb-4';
          const listChildren = content.children && renderFormattedContent(content.children);

          if (content.format === 'ordered') {
            return <ol className={listClass}>{listChildren}</ol>;
          } else {
            return <ul className={listClass}>{listChildren}</ul>;
          }
        case 'list-item':
          return (
            <li className="mb-1">
              {content.children && renderFormattedContent(content.children)}
            </li>
          );
        default:
          return content.children && renderFormattedContent(content.children);
      }
    }

    // If it's an object with children, render them
    if (typeof content === 'object' && content.children) {
      if (Array.isArray(content.children)) {
        return content.children.map((child: any, index: number) => (
          <React.Fragment key={index}>{renderFormattedContent(child)}</React.Fragment>
        ));
      }
      return renderFormattedContent(content.children);
    }

    return null;
  };

  // Function to extract plain text from Strapi content (fallback)
  const extractText = (content: any): string => {
    if (!content) return '';

    // If it's already a string, return it
    if (typeof content === 'string') return content;

    // If it's a number, convert to string
    if (typeof content === 'number') return content.toString();

    // If it's an object with children (rich text), extract text recursively
    if (typeof content === 'object' && content.children && Array.isArray(content.children)) {
      return content.children
        .map((child: any, index: number) => {
          // Only process valid child objects/strings
          if (child == null || typeof child === 'symbol') return '';

          const text = extractText(child);
          // Add paragraph breaks for block-level elements
          if (content.type === 'paragraph' && index === content.children.length - 1) {
            return text + '\n\n';
          }
          return text;
        })
        .join('');
    }

    // If it's an object with a text property, return that
    if (typeof content === 'object' && content.text) {
      return content.text;
    }

    // Default fallback
    return '';
  };

  // Function to safely display content - returns empty string if no valid text found
  const safeContent = (content: any): string => {
    const extracted = extractText(content);
    if (!extracted || extracted === '[object Object]' || extracted.trim() === '') {
      return '';
    }
    // Clean up excessive whitespace while preserving paragraph breaks
    return extracted
      .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
      .replace(/^\s+|\s+$/g, '') // Trim leading/trailing whitespace
      .replace(/[ \t]+/g, ' '); // Replace multiple spaces/tabs with single space
  };

  // Function to safely render formatted content
  const safeFormattedContent = (content: any): React.ReactNode => {
    if (!content) return null;
    try {
      const formatted = renderFormattedContent(content);
      return formatted || null;
    } catch (error) {
      // Fallback to plain text if formatting fails
      return safeContent(content) || null;
    }
  };

  const sidebarSections = lessons.length > 0
    ? lessons.map(lesson => safeContent(lesson.title) || `Lesson ${lesson.id}`)
    : [];

  // Save progress to localStorage
  const saveProgress = (sections: number[], completed: boolean, scrollPos: number) => {
    const progressData = {
      checkedSections: sections,
      isCompleted: completed,
      scrollProgress: scrollPos,
      timestamp: Date.now()
    };
    localStorage.setItem(`course_progress_${id}`, JSON.stringify(progressData));
  };

  // Load progress from localStorage
  const loadProgress = () => {
    try {
      const saved = localStorage.getItem(`course_progress_${id}`);
      if (saved) {
        const progressData = JSON.parse(saved);
        setCheckedSections(progressData.checkedSections || []);
        setIsCompleted(progressData.isCompleted || false);
        setScrollProgress(progressData.scrollProgress || 0);
        return progressData;
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
    return null;
  };

  // Mark course as completed
  const markAsCompleted = async () => {
    try {
      // Send completion to backend to update profile counter
      const response = await fetch('/api/courses/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id })
      });

      const result = await response.json();

      if (response.ok) {
        console.log(result.message);
        if (result.alreadyCompleted) {
          console.log('Course was already completed previously');
        }
      } else {
        console.error('Failed to mark course as completed:', result.error);
      }

      setIsCompleted(true);
      const allSections = Array.from({ length: sidebarSections.length }, (_, i) => i);
      setCheckedSections(allSections);
      setScrollProgress(100);
      saveProgress(allSections, true, 100);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (error) {
      console.error('Failed to mark course as completed:', error);
      // Still update local state even if backend fails
      setIsCompleted(true);
      const allSections = Array.from({ length: sidebarSections.length }, (_, i) => i);
      setCheckedSections(allSections);
      setScrollProgress(100);
      saveProgress(allSections, true, 100);

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
  };

  // Fetch comments for this course
  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const authToken = localStorage.getItem('jwt');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`/api/comments?courseId=${id}`, { headers });
      
      if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('jwt');
        window.location.href = '/auth/sign-in';
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      // Silently fail for comments fetch
    } finally {
      setLoadingComments(false);
    }
  };

  // Submit new comment
  const submitComment = async () => {
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      // Get auth token from localStorage
      const authToken = localStorage.getItem('jwt');

      if (!authToken) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          courseId: id,
          content: newComment.trim(),
          rating: newRating
        })
      });

      if (response.ok) {
        setNewComment('');
        setNewRating(5);
        // Refresh comments
        fetchComments();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to submit comment: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      alert('Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Load saved progress first
    loadProgress();

    // Fetch course data with authentication
    const authToken = localStorage.getItem('jwt');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    fetch(`/api/courses/${id}`, { headers })
      .then((res) => {
        if (res.status === 401) {
          // Token expired, redirect to login
          localStorage.removeItem('jwt');
          window.location.href = '/auth/sign-in';
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data?.course) {
          setCourse(data.course);
          setLessons(data.lessons || []);

          // Load progress after we have the course data
          setTimeout(() => {
            loadProgress();
          }, 100);

        } else {
          setCourse(null);
        }
      })
      .catch(() => setCourse(null))
      .finally(() => isMounted && setLoading(false));

    // Check bookmark status
    fetch(`/api/bookmarks?courseId=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        setIsBookmarked(data.bookmarked || false);
      })
      .catch(() => {
        // Silently fail for bookmarks
      });

    // Fetch comments
    fetchComments();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Scroll progress tracking with automatic section checking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      const normalizedProgress = Math.min(100, Math.max(0, progress));

      setScrollProgress(normalizedProgress);

      // Auto-check sections based on scroll progress
      if (sidebarSections.length > 0) {
        const sectionsToCheck = Math.floor((normalizedProgress / 100) * sidebarSections.length);
        const newCheckedSections: number[] = [];

        for (let i = 0; i <= sectionsToCheck; i++) {
          if (i < sidebarSections.length) {
            newCheckedSections.push(i);
          }
        }

        // Only update if there are new sections to check
        setCheckedSections(prev => {
          const hasNewSections = newCheckedSections.some(section => !prev.includes(section));
          if (hasNewSections) {
            const updatedSections = [...new Set([...prev, ...newCheckedSections])];
            // Save progress when sections are auto-checked
            saveProgress(updatedSections, updatedSections.length === sidebarSections.length, normalizedProgress);
            return updatedSections;
          }
          return prev;
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sidebarSections.length, id]);

  const progress = isCompleted ? 100 : scrollProgress;

  const toggleSectionCheck = (index: number) => {
    setCheckedSections(prev => {
      const newSections = prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index];

      // Save progress when manually toggling
      saveProgress(newSections, newSections.length === sidebarSections.length, scrollProgress);
      return newSections;
    });
  };

  return (
    <div className="relative min-h-screen text-white font-space-grotesk max-w-7xl mx-auto">
      {/* Custom Styles */}
      <style jsx global>{`
        /* Scrollbar Styles */
        html {
          scrollbar-width: thin;
          scrollbar-color: #4a5568 #2d3748;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #2d3748;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #4a5568;
          border-radius: 10px;
          border: 1px solid #2d3748;
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
      <div className="fixed top-20 right-4 z-50">
        <div className="progress-panel w-80">
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

                <div className="status-text">PROGRESS</div>
              </div>
              <div className="text-sm font-medium text-gray-400">
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

          <div className="inline-block bg-white/20 rounded-full px-3 py-1 text-sm font-semibold mb-2">
            {course?.category || 'Uncategorized'}
          </div>

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold leading-tight flex-1">
              {course?.title || 'Untitled'}
            </h1>
            <button
              onClick={async () => {
                try {

                  const response = await fetch('/api/bookmarks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ courseId: id, action: 'toggle' })
                  });


                  if (response.ok) {
                    const data = await response.json();

                    setIsBookmarked(data.bookmarked);
                  } else {
                    console.error('Bookmark request failed:', response.status);
                  }
                } catch (error) {
                  console.error('Bookmark error:', error);
                }
              }}
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
            {course?.date || ''} {course?.readTime ? ` • ${course.readTime}` : ''}
          </div>

          {/* Course Image */}
          {!loading && course?.image && (
            <div className="mb-8">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          <div className="mb-10 space-y-6">
            {loading && (
              <div className="text-white/70">Loading content…</div>
            )}
            {!loading && course && course.content && (
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h2 className="text-xl font-semibold mb-4 text-gray-400">Course Overview</h2>
                <div className="text-white/90 leading-relaxed">
                  {safeFormattedContent(course.content)}
                </div>
              </div>
            )}
            {!loading && lessons.length > 0 && (
              <div className="space-y-8">
                {lessons.map((lsn) => (
                  <div key={lsn.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-xl font-semibold mb-2">{safeContent(lsn.title) || `Lesson ${lsn.id}`}</div>
                    {lsn.image && (
                      <img
                        src={lsn.image}
                        alt={lsn.title}
                        className="rounded-md w-full max-h-[320px] object-cover mb-3"
                      />
                    )}
                    {lsn.content && (safeFormattedContent(lsn.content) || safeContent(lsn.content)) && (
                      <div className="text-white/90 leading-relaxed">
                        {safeFormattedContent(lsn.content) || safeContent(lsn.content)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!loading && !course?.content && lessons.length === 0 && (
              <div className="text-white/70">No content available for this course yet.</div>
            )}
          </div>

          {/* Comments Section */}
          {!loading && (
            <div className="mt-12 space-y-6">
              <h2 className="text-2xl font-bold text-white">Course Reviews</h2>

              {/* Add Comment Form */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4 text-white">Share Your Experience</h3>
                <div className="space-y-4">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewRating(star)}
                          className={`text-2xl transition-colors hover:scale-110 ${star <= newRating ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-300'
                            }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Comment</label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts about this course..."
                      className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <button
                      onClick={submitComment}
                      disabled={submittingComment || !newComment.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                      {submittingComment ? 'Submitting...' : 'Submit Review'}
                    </button>


                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {loadingComments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50 mx-auto"></div>
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {comment.user.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-white">{comment.user.username}</p>
                            <p className="text-xs text-white/60">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {comment.rating && (
                          <div className="flex text-yellow-400">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={i} className={i < comment.rating! ? 'text-yellow-400' : 'text-gray-600'}>
                                ★
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-white/90 leading-relaxed">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-white/60">
                    No reviews yet. Be the first to share your experience!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mark as Done Button */}
          <button
            onClick={markAsCompleted}
            className={`fixed bottom-8 right-8 font-medium py-3 px-6 rounded-full shadow-lg transition-all z-40 flex items-center gap-2 ${isCompleted
                ? 'bg-gray-600 text-white cursor-default'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            disabled={isCompleted}
          >
            {isCompleted ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Completed
              </>
            ) : (
              <>
                Mark as Done
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Sidebar */}
        <aside className="w-full md:w-80 space-y-6 sticky top-32 h-fit">
          <div className="bg-white/10 rounded-xl p-6 border border-white/5 backdrop-blur-sm">
            <div className="font-semibold mb-4">In this article</div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50"></div>
              </div>
            ) : (
              <ul className="space-y-3">
                {sidebarSections.map((section, idx) => (
                  <li key={idx} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={checkedSections.includes(idx)}
                      onChange={() => toggleSectionCheck(idx)}
                      className="mt-1 mr-3 cursor-pointer rounded border-white/30 focus:ring-green-400 text-gray-400 bg-black/20"
                    />
                    <span
                      className={`text-sm cursor-pointer transition-colors ${checkedSections.includes(idx) ? 'text-green-400 font-medium' : 'text-white/80 hover:text-white'
                        }`}
                      onClick={() => toggleSectionCheck(idx)}
                    >
                      {section}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CourseDetailPage;