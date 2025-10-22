// /app/api/suggestions/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Suggestion from '@/models/Suggestion';

export async function GET() {
  await dbConnect();

  try {
    const suggestions = await Suggestion.find({});
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}

// We export this to force dynamic fetching on Vercel/Netlify.
// This ensures our suggested trips are always fresh.
export const dynamic = 'force-dynamic';