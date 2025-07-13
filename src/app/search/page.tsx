// src/app/search/page.tsx
"use client";

import { useState } from "react";
import {BookForm} from "@/components/book-form";
import type { BookFormValues, OpenLibraryBook, OpenLibraryBookAuthor } from "@/types";
export default function SearchPage() {
  const [isbn, setIsbn] = useState("");
  const [data, setData] = useState<OpenLibraryBook | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formDefaultValues, setFormDefaultValues] = useState<Partial<BookFormValues>>({});
  const lookup = async (): Promise<void> => {
    if (!isbn) return;
    setLoading(true);
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
    );
    const json: Record<string, OpenLibraryBook> = await res.json();
    const result = json[`ISBN:${isbn}`] || null;
    setData(result);
    // If form is open, update the form values with new lookup result
    if (showForm && result) {
      setFormDefaultValues({
        isbn,
        title: result.title,
        author: result.authors?.map((a: OpenLibraryBookAuthor) => a.name).join(", "),
      });
    }
    setLoading(false);
  };


  return (
    <>
    <div className="p-3 sm:p-6 max-w-lg mx-auto w-full">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Search & Import</h1>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          className="flex-1 border rounded p-2 w-full"
          placeholder="Enter ISBN"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
        />
        <button
          onClick={lookup}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Looking up…" : "Lookup"}
        </button>
        <button
          onClick={() => {
            // Prefill with ISBN if present, otherwise empty
            setFormDefaultValues(isbn ? { isbn } : {});
            setShowForm(true);
          }}
          className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Add Manually
        </button>
      </div>

      {showForm && (
        <BookForm
          defaultValues={formDefaultValues}
          onSuccess={() => {
            setShowForm(false);
            setFormDefaultValues({});
            setData(null);
            setIsbn("");
          }}
        />
      )}

      {data && !showForm && (
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
              onClick={() => {
                // Import Directly: prefill form with all data and submit immediately, or just open the form for confirmation
                setFormDefaultValues({
                  isbn,
                  title: data.title,
                  author: data.authors?.map((a: OpenLibraryBookAuthor) => a.name).join(", "),
                });
                setShowForm(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Import Directly
            </button>
            <button
              onClick={() => {
                // Edit & Import: prefill form with data, let user edit
                setFormDefaultValues({
                  isbn,
                  title: data.title,
                  author: data.authors?.map((a: OpenLibraryBookAuthor) => a.name).join(", "),
                });
                setShowForm(true);
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded"
            >
              Edit & Import
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
  
