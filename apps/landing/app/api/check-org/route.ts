import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.skillment.in/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json(
      { error: 'Organization name is required' },
      { status: 400 }
    );
  }

  try {
    // Check if organization exists via backend API
    const response = await fetch(`${API_BASE_URL}/organizations/${encodeURIComponent(name)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          available: false,
          orgName: name,
          url: null,
        });
      }
      throw new Error(`Backend returned ${response.status}`);
    }

    const org = await response.json();
    
    return NextResponse.json({
      available: true,
      orgName: org.name || name,
      url: `https://${org.name.toLowerCase()}.skillment.in`,
    });
  } catch (error) {
    console.error('Error checking organization:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check organization availability',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
