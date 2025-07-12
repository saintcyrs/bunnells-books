// src/app/search/page.tsx
"use client";

import { useState } from "react";
import {BookForm} from "@/components/book-form";
import type { OpenLibraryBook, OpenLibraryBookAuthor } from "@/types";
export default function SearchPage() {
  const [isbn, setIsbn] = useState("");
  const [data, setData] = useState<OpenLibraryBook | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const lookup = async (): Promise<void> => {
    if (!isbn) return;
    setLoading(true);
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
    );
    const json: Record<string, OpenLibraryBook> = await res.json();
    setData(json[`ISBN:${isbn}`] || null);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Search & Import</h1>
      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 border rounded p-2"
          placeholder="Enter ISBN"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
        />
        <button
          onClick={lookup}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Looking up…" : "Lookup"}
        </button>
      </div>

      {data && (
        <div className="space-y-4">
          <div>
            <strong>Title:</strong> {data.title}
          </div>
          <div>
            <strong>Authors:</strong>{" "}
            {data.authors?.map((a: OpenLibraryBookAuthor) => a.name).join(", ")}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                setShowForm(true)
              }
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Import Directly
            </button>
            <button
              onClick={() =>
                setShowForm(true)
              }
              className="px-4 py-2 bg-yellow-600 text-white rounded"
            >
              Edit & Import
            </button>
          </div>

          {showForm && (
            <BookForm
              defaultValues={{
                isbn,
                title: data.title,
                author: data.authors?.map((a: OpenLibraryBookAuthor) => a.name).join(", "),
              }}
              onSuccess={() => {
                setShowForm(false);
                setData(null);
                setIsbn("");
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
  
