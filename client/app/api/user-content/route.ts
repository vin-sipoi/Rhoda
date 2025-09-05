import { NextResponse, NextRequest } from 'next/server';

// Helper to get user id from session/auth (replace with your real auth logic)
async function getUserId(req: NextRequest): Promise<string | null> {
  // TODO: Replace with real authentication/session logic
  // For now, fallback to a static user id for demo
  return '1';
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Fetch user-courses from Strapi
  const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
  const res = await fetch(
    `${strapiUrl}/api/user-courses?filters[user][id][$eq]=${userId}&populate=course`,
    {
      headers: {
        'Content-Type': 'application/json',
        // Add auth headers if needed
      },
    }
  );
  const data = await res.json();

  // Map to dashboard format
  const enrolled = (data.data || []).map((entry: any) => {
    const course = entry.attributes?.course?.data?.attributes || {};
    return {
      id: entry.attributes?.course?.data?.id,
      title: course.title,
      subtitle: course.description || '',
      readTime: course.readTime || '',
      color: 'bg-blue-100', // Optionally map color
    };
  });

  // TODO: Implement bookmarks, drafts, published, subscriptions as needed
  return NextResponse.json({
    enrolled,
    bookmarks: [],
    drafts: [],
    published: [],
    subscriptions: []
  });
}
