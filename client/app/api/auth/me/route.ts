import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization');
    
    console.log("Auth me request - Authorization header:", authorization?.substring(0, 30) + "...");
    
    if (!authorization) {
      console.log("No authorization header provided");
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    // Extract token from Bearer header
    const token = authorization.replace('Bearer ', '');
    console.log("Extracted token:", token?.substring(0, 20) + "...");

    // Fetch user from Strapi using the JWT
    const userResponse = await fetch(`${STRAPI_URL}/api/users/me?populate=*`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("Strapi users/me response status:", userResponse.status);

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("Strapi users/me error:", errorText);
      return NextResponse.json({ error: 'Failed to fetch user from Strapi' }, { status: userResponse.status });
    }

    const userData = await userResponse.json();
    console.log("Strapi user data:", userData);

    // Try to fetch associated learner or educator profile
    let profile = null;
    
    // First try to fetch learner profile
    try {
      const learnerResponse = await fetch(
        `${STRAPI_URL}/api/learners?filters[user][documentId][$eq]=${userData.documentId}&populate=*`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (learnerResponse.ok) {
        const learnerData = await learnerResponse.json();
        console.log("Learner data:", learnerData);
        if (learnerData.data && learnerData.data.length > 0) {
          profile = {
            ...learnerData.data[0].attributes,
            id: learnerData.data[0].id,
            type: 'learner'
          };
        }
      }
    } catch (error) {
      console.log('No learner profile found:', error);
    }

    // If no learner profile, try educator profile
    if (!profile) {
      try {
        const educatorResponse = await fetch(
          `${STRAPI_URL}/api/educators?filters[user][documentId][$eq]=${userData.documentId}&populate=*`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (educatorResponse.ok) {
          const educatorData = await educatorResponse.json();
          console.log("Educator data:", educatorData);
          if (educatorData.data && educatorData.data.length > 0) {
            profile = {
              ...educatorData.data[0].attributes,
              id: educatorData.data[0].id,
              type: 'educator'
            };
          }
        }
      } catch (error) {
        console.log('No educator profile found:', error);
      }
    }

    const completeUserData = {
      ...userData,
      profile
    };

    console.log("Complete user data being returned:", completeUserData);
    return NextResponse.json(completeUserData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
