'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import courseData from '../../../../data/courseData.json';

interface Params {
  params: {
    id: string;
  };
}

const CourseDetailPage: React.FC<Params> = ({ params }) => {
  const { id } = params;
  const course = courseData.courses.find(c => c.id === id);

  if (!course) {
    notFound();
  }

  return (
    <div className="relative min-h-screen text-white font-space-grotesk px-8 py-10 max-w-7xl mx-auto flex flex-col md:flex-row gap-10">
      <div
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      
      />
      {/* Left Content */}
      <div className="flex-1 space-y-6">
        <img
          src={course.image}
          alt={course.title}
          className="rounded-lg w-full max-h-[400px] object-cover"
        />
        <div className="inline-block bg-white/20 rounded-full px-3 py-1 text-sm font-semibold mb-2">
          {course.category}
        </div>
        <h1 className="text-3xl font-bold leading-tight">{course.title}</h1>
        <div className="text-sm text-white/70 mb-6">
          {course.date} &bull; {course.readTime}
        </div>
        <p className="whitespace-pre-line text-white/90">{course.content}</p>

      {/* <div className="bg-white/10 rounded-lg p-4 flex items-center justify-between mt-10">
          <div className="flex items-center space-x-4">
            <img
              src={course.author.avatar}
              alt={course.author.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
            />
            <div>
              <div className="font-semibold text-lg">{course.author.name}</div>
              <div className="text-sm text-white/70">{course.author.title}</div>
              <p className="text-xs text-white/60 mt-1 max-w-xs">{course.author.bio}</p>
            </div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2 flex items-center space-x-2 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-400"
              fill="currentColor"
              viewBox="0 0 24 24"
              stroke="none"
            >
              <path d="M20.52 3.48a11.94 11.94 0 00-17 0 11.94 11.94 0 000 17l-1.5 4.5 4.5-1.5a11.94 11.94 0 0017 0 11.94 11.94 0 000-17zM9 17.5l-2.5-2.5 1.5-1.5 1 1 3-3 1 1-3 3 1 1-1 1z" />
            </svg>
            <span className="text-sm">Share with your community!</span>
          </div>
        </div>
*/}
      {/*  <div className="bg-white/10 rounded-lg p-4 mt-10">
          <div className="font-semibold mb-4">Like what you see? Share with a friend.</div>
          <div className="flex justify-end">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-400 cursor-pointer"
              fill="currentColor"
              viewBox="0 0 24 24"
              stroke="none"
            >
              <path d="M20.52 3.48a11.94 11.94 0 00-17 0 11.94 11.94 0 000 17l-1.5 4.5 4.5-1.5a11.94 11.94 0 0017 0 11.94 11.94 0 000-17zM9 17.5l-2.5-2.5 1.5-1.5 1 1 3-3 1 1-3 3 1 1-1 1z" />
            </svg>
          </div>
        </div>*/}
      </div>

      {/* Right Sidebar */}
      <aside className="w-full md:w-96 space-y-6">
       {/*  <div className="bg-white/10 rounded-lg p-6 flex flex-col items-center space-y-4">
          <img
            src={course.author.avatar}
            alt={course.author.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-white/30"
          />
         <div className="text-center">
            <div className="font-semibold text-lg">{course.author.name}</div>
            <div className="text-sm text-white/70">{course.author.title}</div>
            <p className="text-xs text-white/60 mt-1">{course.author.bio}</p>
          </div> 
        </div>*/}

      <div className="bg-white/10 rounded-lg p-6">
          <div className="font-semibold mb-4">Share with your community!</div>
          <div className="flex items-center space-x-2 text-green-400 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              stroke="none"
            >
              <path d="M20.52 3.48a11.94 11.94 0 00-17 0 11.94 11.94 0 000 17l-1.5 4.5 4.5-1.5a11.94 11.94 0 0017 0 11.94 11.94 0 000-17zM9 17.5l-2.5-2.5 1.5-1.5 1 1 3-3 1 1-3 3 1 1-1 1z" />
            </svg>
            <span>WhatsApp</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-6">
          <div className="font-semibold mb-4">In this article</div>
          <ul className="space-y-2 text-sm text-white/80">
            {course.articleSections.map((section, idx) => (
              <li key={idx} className="cursor-pointer hover:text-white transition-colors">
                {section}
              </li>
            ))}
          </ul>
        </div>

       {/* <div className="bg-white/10 rounded-lg p-6">
          <div className="font-semibold mb-4">Related Articles</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {course.relatedArticles.map(article => (
              <Link
                key={article.id}
                href={`/dashboard/course/${article.id}`}
                className="bg-white/20 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
              <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-32 object-cover"
                />
                <div className="p-3">
                  <div className="inline-block bg-white/20 rounded-full px-2 py-1 text-xs font-semibold mb-1">
                    {article.category}
                  </div>
                  <div className="text-sm font-semibold">{article.title}</div>
                  <div className="text-xs text-white/70 mt-1">
                    {article.date} &bull; {article.readTime}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>*/}
      </aside>
    </div>
  );
};

export default CourseDetailPage;
