import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get('isbn');
  const title = searchParams.get('title');
  const author = searchParams.get('author');
  const limit = searchParams.get('limit') || '10';

  try {
    if (isbn) {
      // Search by ISBN
      const response = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch from OpenLibrary');
      }
      
      const data = await response.json();
      return NextResponse.json({ book: data[`ISBN:${isbn}`] || null });
    } 
    
    // Search by title or author
    const field = title ? 'title' : 'author';
    const query = title || author || '';
    
    const response = await fetch(
      `https://openlibrary.org/search.json?${field}=${encodeURIComponent(query)}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search OpenLibrary');
    }
    
    const data = await response.json();
    return NextResponse.json({ results: data.docs || [] });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}
