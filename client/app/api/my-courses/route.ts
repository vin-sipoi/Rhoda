import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
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
    console.log('Current user:', userData);

    // Try to fetch user-courses using different approaches
    const userId = userData.id;
    
    // Try different populate strategies - most explicit first
    const populateStrategies = [
      'populate[course][fields][0]=id&populate[course][fields][1]=type_of_courses&populate[course][fields][2]=description',
      'populate[course]=*',
      'populate=*',
      'populate[course][populate]=*', 
      'populate=course'
    ];
    
    let userCoursesResponse;
    let strategyUsed = '';
    
    // First, try to get ALL user-courses to see the structure
    console.log('=== TESTING: Fetching ALL user-courses without filtering ===');
    const testResponse = await fetch(
      `${strapiUrl}/api/user-courses?populate=*`,
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('ALL user-courses (unfiltered):', JSON.stringify(testData, null, 2));
      
      // Also let's check what courses exist in Strapi
      console.log('=== CHECKING ALL COURSES IN STRAPI ===');
      const coursesResponse = await fetch(`${strapiUrl}/api/courses?populate=*`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        console.log('ALL courses in Strapi:', JSON.stringify(coursesData, null, 2));
        console.log('Course IDs in Strapi:', coursesData.data?.map((c: any) => ({ 
          id: c.id, 
          title: c.attributes?.type_of_courses || c.attributes?.title,
          documentId: c.documentId 
        })));
      }
    }

    // Try each strategy until one works
    for (const strategy of populateStrategies) {
      console.log(`Trying populate strategy: ${strategy}`);
      userCoursesResponse = await fetch(
        `${strapiUrl}/api/user-courses?filters[user][id][$eq]=${userId}&${strategy}`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (userCoursesResponse.ok) {
        strategyUsed = strategy;
        console.log(`Success with strategy: ${strategy}`);
        break;
      } else {
        console.log(`Failed with strategy: ${strategy}, status: ${userCoursesResponse.status}`);
      }
    }

    if (!userCoursesResponse) {
      console.error('All populate strategies failed');
      return NextResponse.json({ 
        error: 'Failed to fetch courses with any populate strategy',
        courses: []
      });
    }

    console.log('User-courses response status:', userCoursesResponse.status);
    console.log('Successful strategy:', strategyUsed);

    // If user token doesn't work, try with API token (if available)
    if (!userCoursesResponse.ok && process.env.STRAPI_API_TOKEN) {
      console.log('Trying with API token...');
      userCoursesResponse = await fetch(
        `${strapiUrl}/api/user-courses?filters[user][id][$eq]=${userId}&${strategyUsed}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('API token response status:', userCoursesResponse.status);
    }

    if (!userCoursesResponse.ok) {
      const errorText = await userCoursesResponse.text();
      console.error('Failed to fetch user courses:', userCoursesResponse.status, errorText);
      
      return NextResponse.json({ 
        error: `Failed to fetch courses: ${userCoursesResponse.status}`,
        debug: {
          userId,
          status: userCoursesResponse.status,
          errorText,
          strategyUsed
        },
        courses: []
      });
    }

    const userCoursesData = await userCoursesResponse.json();
    console.log('User courses raw data:', JSON.stringify(userCoursesData, null, 2));
    
    // Log each enrollment structure in detail
    if (userCoursesData.data && userCoursesData.data.length > 0) {
      console.log('Number of enrollments found:', userCoursesData.data.length);
      userCoursesData.data.forEach((enrollment: any, index: number) => {
        console.log(`=== Enrollment ${index} ===`);
        console.log('Enrollment ID:', enrollment.id);
        console.log('Enrollment attributes:', enrollment.attributes);
        console.log('Course relation structure:', enrollment.attributes?.course);
        console.log('Full enrollment object:', JSON.stringify(enrollment, null, 2));
      });
    } else {
      console.log('No enrollment data found or empty array');
    }

    // Map the courses and fetch course details separately if needed
    const coursePromises = (userCoursesData.data || []).map(async (enrollment: any) => {
      console.log('Full enrollment object:', JSON.stringify(enrollment, null, 2));
      
      // Debug: Log all possible paths to find the course data
      console.log('=== DETAILED COURSE EXTRACTION DEBUG ===');
      console.log('enrollment.attributes:', JSON.stringify(enrollment.attributes, null, 2));
      console.log('enrollment.attributes?.course:', JSON.stringify(enrollment.attributes?.course, null, 2));
      console.log('enrollment.attributes?.course?.data:', JSON.stringify(enrollment.attributes?.course?.data, null, 2));
      console.log('enrollment.attributes?.course?.data?.attributes:', JSON.stringify(enrollment.attributes?.course?.data?.attributes, null, 2));
      
      // Try ALL possible course data structures
      let course = enrollment.attributes?.course?.data?.attributes || 
                  enrollment.attributes?.course?.attributes ||
                  enrollment.attributes?.course?.data ||
                  enrollment.attributes?.course || 
                  {};
      
      let courseId = enrollment.attributes?.course?.data?.id || 
                    enrollment.attributes?.course?.id ||
                    enrollment.course?.id ||
                    enrollment.course ||
                    null;
      
      console.log('Final extracted course data:', JSON.stringify(course, null, 2));
      console.log('Final extracted course ID:', courseId);
      console.log('Course ID type:', typeof courseId);
      
      // If we don't have course data but have an ID, fetch it separately
      if (courseId && Object.keys(course).length === 0) {
        console.log(`Fetching course data separately for ID: ${courseId}`);
        try {
          const courseResponse = await fetch(`${strapiUrl}/api/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN || userToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (courseResponse.ok) {
            const courseData = await courseResponse.json();
            course = courseData.data?.attributes || courseData.attributes || {};
            console.log('Fetched course data:', JSON.stringify(course, null, 2));
          } else if (courseResponse.status === 404) {
            console.warn(`Course ${courseId} not found (404) - this enrollment points to a deleted course`);
            // Return null to filter out this invalid enrollment
            return null;
          }
        } catch (error) {
          console.error(`Failed to fetch course ${courseId}:`, error);
          return null;
        }
      }
      
      // Extract text content from blocks/rich text
      const extractTextFromBlocks = (blocks: any): string => {
        if (!blocks) return '';
        if (typeof blocks === 'string') return blocks;
        if (Array.isArray(blocks)) {
          return blocks.map(block => {
            if (block.children && Array.isArray(block.children)) {
              return block.children.map((child: any) => child.text || '').join('');
            }
            return block.text || '';
          }).join(' ');
        }
        return '';
      };
      
      const description = extractTextFromBlocks(course.description) || 
                         extractTextFromBlocks(course.content) || 
                         course.type_of_courses || 
                         'No description available';
      
      // Try multiple possible title fields
      const title = course.type_of_courses || 
                   course.title || 
                   course.name || 
                   course.displayName ||
                   course.Name ||
                   (courseId ? `Course ${courseId}` : `Enrollment ${enrollment.id}`);
      
      console.log(`Mapping course ${courseId}: title="${title}", type_of_courses="${course.type_of_courses}"`);
      
      // If we still don't have course data, return a placeholder
      if (!courseId) {
        console.warn('No course ID found for enrollment:', enrollment.id);
        return {
          id: null,
          title: `Enrollment ${enrollment.id}`,
          subtitle: 'Course data not available - please re-enroll',
          readTime: '5 min read',
          enrolledAt: enrollment.attributes?.enrolledAt,
          color: 'bg-red-100',
          _debug: { enrollment, course }
        };
      }

      return {
        id: courseId,
        title: title,
        subtitle: description.substring(0, 150) + (description.length > 150 ? '...' : ''),
        readTime: course.readTime || '5 min read',
        enrolledAt: enrollment.attributes?.enrolledAt,
        color: 'bg-blue-100',
        _debug: course
      };
    });

    // Wait for all course data to be fetched
    const allCourses = await Promise.all(coursePromises);
    
    // Filter out null values (invalid enrollments pointing to deleted courses)
    const validCourses = allCourses.filter(course => course !== null);
    
    console.log(`Filtered out ${allCourses.length - validCourses.length} invalid enrollments`);

    return NextResponse.json({ 
      success: true,
      courses: validCourses,
      debug: {
        userId,
        totalEnrollments: userCoursesData.data?.length || 0,
        validEnrollments: validCourses.length,
        invalidEnrollments: allCourses.length - validCourses.length
      }
    });

  } catch (error) {
    console.error('Error in my-courses API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      courses: []
    }, { status: 500 });
  }
}
