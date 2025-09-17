import { NextResponse, NextRequest } from 'next/server';

// Helper to get user id from session/auth
async function getUserId(req: NextRequest): Promise<string | null> {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Verify token with Strapi
    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    const response = await fetch(`${strapiUrl}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const userData = await response.json();
    return userData.id?.toString() || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get authorization header from the request
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userToken = authHeader.substring(7);
    
    // Verify token and get user info
    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    const userResponse = await fetch(`${strapiUrl}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userData = await userResponse.json();
    const userId = userData.id?.toString();

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    // Fetch user-courses using the user's token (this should have the right permissions)
    const res = await fetch(
      `${strapiUrl}/api/user-courses?filters[user][id][$eq]=${userId}&populate=course`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`, // Use user's token instead of API token
        },
      }
    );
  if (!res.ok) {
    console.error(`Failed to fetch user courses: ${res.status} ${res.statusText}`);
    return NextResponse.json({ 
      error: 'Failed to fetch user courses',
      enrolled: [],
      bookmarks: [],
      drafts: [],
      published: [],
      subscriptions: []
    });
  }

  const data = await res.json();


  // Map to dashboard format
  const enrolled = (data.data || []).map((entry: any) => {
    const course = entry.attributes?.course?.data?.attributes || {};
    return {
      id: entry.attributes?.course?.data?.id,
      title: course.title || course.type_of_courses || 'Untitled Course',
      subtitle: course.description || course.content || 'No description available',
      readTime: course.readTime || '5 min read',
      color: 'bg-blue-100', // Optionally map color
      enrolledAt: entry.attributes?.enrolledAt,
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
  } catch (error) {
    console.error('Error in user-content API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      enrolled: [],
      bookmarks: [],
      drafts: [],
      published: [],
      subscriptions: []
    }, { status: 500 });
  }
}
