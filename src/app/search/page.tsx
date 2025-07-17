// src/app/search/page.tsx
"use client";

import { useState } from "react";
import { BookForm } from "@/components/book-form";
import type { BookFormValues, OpenLibraryBook, OpenLibraryBookAuthor } from "@/types";
import Image from "next/image";

type SearchType = 'isbn' | 'title' | 'author';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>('isbn');
  const [data, setData] = useState<OpenLibraryBook | OpenLibraryBook[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formDefaultValues, setFormDefaultValues] = useState<Partial<BookFormValues>>({});

  const getPlaceholder = () => {
    switch (searchType) {
      case 'isbn':
        return 'Enter ISBN (e.g., 9780307474278)';
      case 'title':
        return 'Enter book title';
      case 'author':
        return 'Enter author name';
      default:
        return 'Search...';
    }
  };

  const lookup = async (): Promise<void> => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setData(null);

    try {
      let result;
      if (searchType === 'isbn') {
        // Search by ISBN using our API route
        const res = await fetch(`/api/search?isbn=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error('Failed to search by ISBN');
        const data = await res.json();
        result = data.book || null;
        setData(result);
        
        if (showForm && result) {
          setFormDefaultValues({
            isbn: searchQuery,
            title: result.title,
            author: result.authors?.map((a: OpenLibraryBookAuthor) => a.name).join(", "),
            ...(result.cover?.medium && { cover_url: result.cover.medium })
          });
        }
      } else {
        // Search by title or author using our API route
        const field = searchType;
        const res = await fetch(`/api/search?${field}=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error(`Failed to search by ${field}`);
        const data = await res.json();
        setData(data.results || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setData(null);
    } finally {
      setLoading(false);
    }
  };


  // Handle manual add with current search query
  const handleManualAdd = () => {
    setFormDefaultValues({
      ...(searchType === 'isbn' && { isbn: searchQuery }),
      ...(searchType === 'title' && { title: searchQuery }),
      ...(searchType === 'author' && { author: searchQuery })
    });
    setShowForm(true);
  };

  // Helper function to extract book data for the form
  const getBookData = (book: OpenLibraryBook, isbn?: string) => {
    const coverUrl = isbn 
      ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg` 
      : book.cover?.medium;
      
    return {
      title: book.title || '',
      author: book.authors?.map(a => a.name).join(", ") || '',
      ...(isbn && { isbn }),
      ...(coverUrl && { cover_url: coverUrl })
    };
  };

  return (
    <>
    <div className="p-3 sm:p-6 max-w-3xl mx-auto w-full bg-white min-h-screen">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Search & Import</h1>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1 flex">
          <input
            className="flex-1 border rounded-l p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={getPlaceholder()}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookup()}
          />
          <div className="relative">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as SearchType)}
              className="h-full border-l-0 rounded-r border-gray-300 bg-gray-50 text-gray-700 py-2 pl-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="isbn">ISBN</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
            </select>
          </div>
        </div>
        <button
          onClick={lookup}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
          disabled={loading || !searchQuery.trim()}
        >
          {loading ? "Searching…" : "Search"}
        </button>
        <button
          onClick={handleManualAdd}
          className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 whitespace-nowrap"
        >
          + Add book manually
        </button>
      </div>

      {showForm && (
        <BookForm
          defaultValues={formDefaultValues}
          onSuccess={() => {
            setShowForm(false);
            setFormDefaultValues({});
            setData(null);
            setSearchQuery('');
          }}
        />
      )}

      {data && !showForm && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">
            {Array.isArray(data) 
              ? `Found ${data.length} ${data.length === 1 ? 'result' : 'results'}`
              : 'Book Details'}
          </h3>
          
          {Array.isArray(data) ? (
            <div className="space-y-4">
              {data.map((book: OpenLibraryBook, index: number) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                  <h4 className="font-semibold">{book.title}</h4>
                  {book.authors?.map((author: OpenLibraryBookAuthor) => author.name).join(", ") && (
                    <p className="text-sm text-gray-600">
                      By {book.authors?.map((author: OpenLibraryBookAuthor) => author.name).join(", ")}
                    </p>
                  )}
                  {book.publish_date && (
                    <p className="text-sm text-gray-500">
                      First published: {book.publish_date}
                    </p>
                  )}
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => {
                        const isbn = Array.isArray(book.isbn) ? book.isbn[0] : undefined;
                        const coverUrl = isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg` : null;
                        setFormDefaultValues({
                          title: book.title || '',
                          author: book.authors?.map((author: OpenLibraryBookAuthor) => author.name).join(", ") || '',
                          ...(isbn && { isbn }),
                          ...(coverUrl && { cover_url: coverUrl })
                        });
                        setShowForm(true);
                      }}
                      className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add to Library
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border rounded-lg">
              <p className="mb-2"><span className="font-semibold">Title:</span> {data.title || 'N/A'}</p>
              <p className="mb-3">
                <span className="font-semibold">Author(s):</span> 
                {data.authors?.map((a: OpenLibraryBookAuthor) => a.name).join(", ") || 'N/A'}
              </p>
              {data.cover?.medium && (
                <Image
                  src={data.cover.medium}
                  alt={`Cover of ${data.title || 'book'}`}
                  width={128}
                  height={192}
                  className="mb-3 rounded shadow-sm"
                />
              )}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    // For ISBN search, we already have the ISBN from the search query
                    const isbn = searchType === 'isbn' ? searchQuery : undefined;
                    setFormDefaultValues({
                      ...getBookData(data, isbn)
                    });
                    setShowForm(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add to Library
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
