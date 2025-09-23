import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

export async function POST(request: Request) {
  try {
    const { courseId } = await request.json();
    
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Get the user's authentication token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('jwt')?.value;
    
    if (!authToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // First, get the user's current profile to get the current completed courses count
    const userResponse = await fetch(`${STRAPI_URL}/api/users/me?populate=*`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch user profile');
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
    }

    const userData = await userResponse.json();
    const currentCompletedCourses = userData.completedCourses || 0;

    // Check if the course is already completed to avoid duplicate counting
    const completedCoursesResponse = await fetch(
      `${STRAPI_URL}/api/user-courses?filters[user][id][$eq]=${userData.id}&filters[course][id][$eq]=${courseId}&filters[completed][$eq]=true`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (completedCoursesResponse.ok) {
      const completedData = await completedCoursesResponse.json();
      
      // If course is already completed, don't increment counter
      if (completedData.data && completedData.data.length > 0) {
        return NextResponse.json({ 
          message: "Course already completed",
          alreadyCompleted: true 
        });
      }
    }

    // Mark the course as completed in user-courses
    const userCourseData = {
      data: {
        user: userData.id,
        course: courseId,
        completed: true,
        completedAt: new Date().toISOString(),
        progress: 100
      }
    };

    const userCourseResponse = await fetch(`${STRAPI_URL}/api/user-courses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userCourseData),
    });

    if (!userCourseResponse.ok) {
      console.error('Failed to create user-course completion record');
      // Continue to update profile even if this fails
    }

    // Update the user's completed courses counter
    const updateData = {
      completedCourses: currentCompletedCourses + 1
    };

    const updateResponse = await fetch(`${STRAPI_URL}/api/users/${userData.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!updateResponse.ok) {
      console.error('Failed to update user completed courses count');
      return NextResponse.json({ error: "Failed to update completion count" }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Course marked as completed successfully",
      completedCourses: currentCompletedCourses + 1
    });

  } catch (error) {
    console.error('Course completion error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
