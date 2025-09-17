import { NextResponse, NextRequest } from 'next/server';

export async function DELETE(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userToken = authHeader.substring(7);
    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';

    // Get current user
    const userResponse = await fetch(`${strapiUrl}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    // Get all available courses
    const allCoursesResponse = await fetch(`${strapiUrl}/api/courses`, {
      headers: {
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN || userToken}`,
        'Content-Type': 'application/json',
      },
    });

    let availableCourseIds = [];
    if (allCoursesResponse.ok) {
      const allCoursesData = await allCoursesResponse.json();
      availableCourseIds = (allCoursesData.data || []).map((course: any) => String(course.id));
    }

    // Get user enrollments
    const userCoursesResponse = await fetch(
      `${strapiUrl}/api/user-courses?filters[user][id][$eq]=${userId}&populate=course`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN || userToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!userCoursesResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch user courses' }, { status: 500 });
    }

    const userCoursesData = await userCoursesResponse.json();

    // Find invalid enrollments
    const invalidEnrollments = (userCoursesData.data || []).filter((enrollment: any) => {
      const courseId = String(enrollment.attributes?.course?.data?.id || 
                             enrollment.attributes?.course?.id ||
                             enrollment.course?.id ||
                             enrollment.course || '');
      
      return courseId && courseId !== 'null' && !availableCourseIds.includes(courseId);
    });

    // Delete invalid enrollments
    const deletionResults = [];
    for (const enrollment of invalidEnrollments) {
      try {
        const deleteResponse = await fetch(`${strapiUrl}/api/user-courses/${enrollment.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN || userToken}`,
            'Content-Type': 'application/json',
          },
        });

        deletionResults.push({
          enrollmentId: enrollment.id,
          courseId: enrollment.attributes?.course?.data?.id || enrollment.attributes?.course?.id,
          success: deleteResponse.ok,
          status: deleteResponse.status
        });
      } catch (error) {
        deletionResults.push({
          enrollmentId: enrollment.id,
          courseId: enrollment.attributes?.course?.data?.id || enrollment.attributes?.course?.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${invalidEnrollments.length} invalid enrollments`,
      deletedEnrollments: deletionResults,
      totalInvalid: invalidEnrollments.length,
      availableCourses: availableCourseIds.length
    });

  } catch (error) {
    console.error('Error cleaning up enrollments:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
