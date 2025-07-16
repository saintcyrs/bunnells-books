"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookForm } from "@/components/book-form";
import { BookList } from "@/components/book-list";

// Create a separate component for the content that uses useSearchParams
function CollectionPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Sync search query with URL on initial load
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
  }, [searchParams]);

  // Update URL when search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.set('q', searchQuery);
      }
      const queryString = params.toString();
      const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
      
      // Only update URL if it's different to prevent unnecessary history entries
      if (newUrl !== window.location.pathname + window.location.search) {
        router.push(newUrl, { scroll: false });
      }
    }, 300); // Debounce to prevent too many URL updates

    return () => clearTimeout(timer);
  }, [searchQuery, router]);

  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-3 sm:p-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">My Library</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 whitespace-nowrap"
          >
            + Add Manually
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-white bg-opacity-30 flex items-center justify-center p-2 sm:p-0 z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <button onClick={() => setShowForm(false)} className="text-2xl text-gray-500 hover:text-black">&times;</button>
            </div>
            <BookForm
              onSuccess={() => {
                setShowForm(false);
                setRefreshKey((k) => k + 1);
              }}
            />
          </div>
        </div>
      )}

      <BookList key={refreshKey} search={searchQuery} />
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    }>
      <CollectionPageContent />
    </Suspense>
  );
}
