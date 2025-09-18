import { NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

// GET - Fetch comments for a course
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Fetch comments for the course with user details populated
    const response = await fetch(
      `${STRAPI_URL}/api/comments?filters[course][id][$eq]=${courseId}&populate=*&sort=createdAt:desc`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(STRAPI_TOKEN ? { 'Authorization': `Bearer ${STRAPI_TOKEN}` } : {}),
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch comments from Strapi:', response.status, errorText);
      return NextResponse.json({ error: "Failed to fetch comments", details: errorText }, { status: 500 });
    }

    const data = await response.json();
    
    // Transform the data to match our interface
    const comments = data.data?.map((comment: any) => {
      const attrs = comment.attributes || comment;
      
      // Since there's no user field in the Strapi schema, we'll show anonymous for now
      const processedComment = {
        id: comment.id,
        content: attrs.content || '',
        rating: attrs.Rating || attrs.rating || null, // Try both cases
        createdAt: attrs.createdAt || attrs.created_at || new Date().toISOString(),
        isApproved: true, // Default to true since no approval field exists
        user: {
          id: 'anonymous',
          username: 'Anonymous User',
          email: '',
        }
      };
      
      return processedComment;
    }) || [];

    return NextResponse.json({ comments });

  } catch (error) {
    console.error('Comments fetch error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new comment
export async function POST(request: Request) {
  try {
    const { courseId, content, rating } = await request.json();
    
    if (!courseId || !content) {
      return NextResponse.json({ error: "Course ID and content are required" }, { status: 400 });
    }

    // Get the user's authentication token from headers
    const authorization = request.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    const authToken = authorization.replace('Bearer ', '');

    // Get the current user
    const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: "Failed to authenticate user" }, { status: 401 });
    }

    const userData = await userResponse.json();

    // Create the comment with only the fields that exist in Strapi schema
    const commentData = {
      data: {
        content: content.trim(),
        Rating: rating || null, // Using capital R as per Strapi schema
        course: courseId, // lowercase as per schema
        // Note: No user field exists in the current Strapi schema
      }
    };

    const response = await fetch(`${STRAPI_URL}/api/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to create comment:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        sentData: commentData
      });
      return NextResponse.json({ 
        error: "Failed to create comment", 
        details: errorData,
        status: response.status 
      }, { status: 500 });
    }

    const result = await response.json();
    
    return NextResponse.json({ 
      message: "Comment created successfully",
      comment: result.data 
    });

  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
