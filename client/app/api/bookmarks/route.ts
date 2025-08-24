import { NextResponse } from "next/server";

// In a real app, you'd use a database
// For now, we'll use a simple in-memory store (this will reset on server restart)
let bookmarks = new Set<string>();

export async function POST(request: Request) {
  try {
    const { courseId, action } = await request.json();
    
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }
    
    if (action === 'add') {
      bookmarks.add(courseId);
      return NextResponse.json({ success: true, bookmarked: true });
    } else if (action === 'remove') {
      bookmarks.delete(courseId);
      return NextResponse.json({ success: true, bookmarked: false });
    } else if (action === 'toggle') {
      if (bookmarks.has(courseId)) {
        bookmarks.delete(courseId);
        return NextResponse.json({ success: true, bookmarked: false });
      } else {
        bookmarks.add(courseId);
        return NextResponse.json({ success: true, bookmarked: true });
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }
    
    const isBookmarked = bookmarks.has(courseId);
    return NextResponse.json({ bookmarked: isBookmarked });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
