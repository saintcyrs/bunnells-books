"use client";

import { useState } from "react";
import { BookForm } from "@/components/book-form";
import { BookList } from "@/components/book-list";

export default function CollectionPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Library</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Add Manually
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl">Add a New Book</h2>
              <button onClick={() => setShowForm(false)}>✕</button>
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

      <BookList key={refreshKey} />
    </div>
  );
}
