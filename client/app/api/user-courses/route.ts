import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, userId } = body;

    if (!courseId || !userId) {
      return NextResponse.json(
        { error: 'Course ID and User ID are required' }, 
        { status: 400 }
      );
    }

    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    const strapiToken = process.env.STRAPI_API_TOKEN || process.env.STRAPI_TOKEN;

    console.log('Strapi URL:', strapiUrl);
    console.log('Has Strapi Token:', !!strapiToken);
    console.log('Enrolling user:', userId, 'in course:', courseId);

    // Check if user is already enrolled
    const existingEnrollment = await fetch(
      `${strapiUrl}/api/user-courses?filters[user][id][$eq]=${userId}&filters[course][id][$eq]=${courseId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${strapiToken}`,
        },
      }
    );

    const existingData = await existingEnrollment.json();
    
    if (existingData.data && existingData.data.length > 0) {
      return NextResponse.json({ 
        message: 'User already enrolled in this course',
        enrolled: true 
      });
    }

    // Create new enrollment with proper relationship structure
    const enrollmentData = {
      data: {
        user: userId,
        course: courseId,
        enrolledAt: new Date().toISOString(),
        Name: `User ${userId} enrolled in Course ${courseId}` // Add a name for the enrollment
      }
    };
    
    console.log('Creating enrollment with data:', JSON.stringify(enrollmentData, null, 2));

    const response = await fetch(`${strapiUrl}/api/user-courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${strapiToken}`,
      },
      body: JSON.stringify(enrollmentData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      console.error('Strapi enrollment error:', errorData);
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      return NextResponse.json(
        { error: 'Failed to enroll user in course', details: errorData, status: response.status }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Enrollment created successfully:', JSON.stringify(data, null, 2));
    
    return NextResponse.json({ 
      message: 'Successfully enrolled in course',
      data,
      enrolled: true 
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      );
    }

    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    const strapiToken = process.env.STRAPI_API_TOKEN || process.env.STRAPI_TOKEN;

    const response = await fetch(
      `${strapiUrl}/api/user-courses?filters[user][id][$eq]=${userId}&populate=course`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${strapiToken}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user courses' }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Fetch user courses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
