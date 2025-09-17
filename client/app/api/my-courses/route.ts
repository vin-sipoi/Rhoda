import { NextResponse, NextRequest } from 'next/server';

async function GET(req: NextRequest) {
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

    // First, get all available courses to filter valid enrollments
    const allCoursesResponse = await fetch(`${strapiUrl}/api/courses?populate=*`, {
      headers: {
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN || userToken}`,
        'Content-Type': 'application/json',
      },
    });

    let availableCourses: Array<{id: string, data: any}> = [];
    if (allCoursesResponse.ok) {
      try {
        const allCoursesData = await allCoursesResponse.json();
        availableCourses = (allCoursesData.data || []).map((course: any) => ({
          id: String(course.id),
          data: course
        }));
      } catch (jsonError) {
        console.error('Error parsing courses JSON:', jsonError);
        return NextResponse.json({ 
          error: 'Failed to parse courses data',
          courses: [],
          success: false
        }, { status: 500 });
      }
    } else {
      console.error('Failed to fetch all courses:', allCoursesResponse.status);
      return NextResponse.json({ 
        error: 'Failed to fetch available courses',
        courses: [],
        success: false
      }, { status: allCoursesResponse.status });
    }

    // Get user enrollments with basic populate
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
      console.error('Failed to fetch user courses:', userCoursesResponse.status);
      return NextResponse.json({ 
        error: 'Failed to fetch user courses',
        courses: [],
        success: false
      }, { status: userCoursesResponse.status });
    }

    let userCoursesData;
    try {
      userCoursesData = await userCoursesResponse.json();
    } catch (jsonError) {
      console.error('Error parsing user courses JSON:', jsonError);
      return NextResponse.json({ 
        error: 'Failed to parse user courses data',
        courses: [],
        success: false
      }, { status: 500 });
    }

    // Extract enrolled course IDs and filter out invalid ones
    const enrolledCourseIds = (userCoursesData.data || [])
      .map((enrollment: any) => {
        const courseId = enrollment.attributes?.course?.data?.id || 
                        enrollment.attributes?.course?.id ||
                        enrollment.course?.id ||
                        enrollment.course;
        return {
          courseId: String(courseId),
          enrolledAt: enrollment.attributes?.enrolledAt || new Date().toISOString()
        };
      })
      .filter((item: any) => item.courseId && item.courseId !== 'null')
      .filter((item: any) => 
        availableCourses.some((course: any) => course.id === item.courseId)
      );

    if (enrolledCourseIds.length === 0) {
      return NextResponse.json({ 
        success: true,
        courses: [],
        message: 'No valid enrolled courses found'
      });
    }

    // Build course data using the available courses we already fetched
    const validCourses = enrolledCourseIds.map((enrollment: any) => {
      const courseData = availableCourses.find((course: any) => course.id === enrollment.courseId);
      
      if (!courseData) {
        return null;
      }

      const courseItem = courseData.data;
      const attrs = courseItem.attributes || courseItem;

      // Extract image URL - same logic as discover API
      const extractImageUrl = (mediaField: any): string => {
        if (!mediaField) return '';
        const data = Array.isArray(mediaField?.data) ? mediaField.data[0] : mediaField.data;
        const url = data?.attributes?.formats?.thumbnail?.url || 
                   data?.attributes?.formats?.small?.url ||
                   data?.attributes?.url;
        return url ? (url.startsWith('http') ? url : `${strapiUrl}${url}`) : '';
      };

      const imageUrl = extractImageUrl(attrs.imagescontent) || 
                      extractImageUrl(attrs.image) || 
                      extractImageUrl(attrs.cover) || 
                      extractImageUrl(attrs.thumbnail) ||
                      '';

      // Extract content for subtitle - same logic as discover API
      const extractTextFromBlocks = (blocks: any): string => {
        if (!blocks) return '';
        if (typeof blocks === 'string') return blocks;
        if (Array.isArray(blocks)) {
          return blocks.map((block: any) => {
            if (block.children && Array.isArray(block.children)) {
              return block.children.map((child: any) => child.text || '').join('');
            }
            return block.text || '';
          }).join(' ');
        }
        return '';
      };

      const content = extractTextFromBlocks(attrs.description) || 
                     extractTextFromBlocks(attrs.content) || 
                     attrs.type_of_courses || 
                     '';

      const title = attrs.type_of_courses || 
                   attrs.title || 
                   attrs.name || 
                   `Course ${enrollment.courseId}`;

      // Calculate read time if not provided
      let readTime = attrs.readTime || '';
      if (!readTime && content) {
        const words = content.trim().split(/\s+/).length;
        const mins = Math.max(1, Math.round(words / 200));
        readTime = `${mins} min read`;
      }

      // Extract author name - same logic as discover API
      const extractAuthorName = (attrs: any): string => {
        const getSingle = (rel: any): any => (Array.isArray(rel?.data) ? rel?.data?.[0] : rel?.data);
        const edu = getSingle(attrs.educator)?.attributes;
        const aut = getSingle(attrs.author)?.attributes;
        const usr = getSingle(attrs.user)?.attributes;
        return edu?.name || edu?.fullName || edu?.username || 
               aut?.name || usr?.name || usr?.username || 
               'Unknown Author';
      };

      return {
        id: enrollment.courseId,
        title: title,
        subtitle: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
        content: content,
        readTime: readTime,
        image: imageUrl,
        category: attrs.type_of_courses || 'Uncategorized',
        date: attrs.publishedAt || attrs.createdAt || '',
        enrolledAt: enrollment.enrolledAt,
        author: { name: extractAuthorName(attrs) },
        shareText: attrs.shareText || '',
        articleSections: Array.isArray(attrs.articleSections) ? attrs.articleSections : [],
      };
    }).filter((course: any) => course !== null);

    return NextResponse.json({ 
      success: true,
      courses: validCourses,
      totalEnrolled: enrolledCourseIds.length,
      validCourses: validCourses.length
    });

  } catch (error) {
    console.error('Error in my-courses API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      courses: []
    }, { status: 500 });
  }
}

export { GET };
