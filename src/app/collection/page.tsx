"use client";

import { useState } from "react";
import { BookForm } from "@/components/book-form";
import { BookList } from "@/components/book-list";

export default function CollectionPage() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-3 sm:p-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">My Library</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
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
