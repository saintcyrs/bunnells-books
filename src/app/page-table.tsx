"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useState, useMemo } from "react";
import type { Book } from "@/types";
import { BookForm } from "@/components/book-form";

export default function BooksTable() {
  const { data: books = [], isLoading, error } = useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("added_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Book | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [editingBook, setEditingBook] = useState<Partial<Book> | null>(null);

  const sortedBooks = useMemo(() => {
    const booksToSort = [...books];
    if (sortKey) {
      booksToSort.sort((a, b) => {
        const aVal = a[sortKey] ?? "";
        const bVal = b[sortKey] ?? "";
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    return booksToSort;
  }, [books, sortKey, sortDirection]);

  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        (book.isbn ? book.isbn.toLowerCase().includes(q) : false)
    );
  }, [books, search]);

  function handleSort(key: keyof Book) {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  function handleRowClick(book: Book) {
    setEditingBook({ ...book });
  }

  function handleClose() {
    setEditingBook(null);
  }

  return (
    <>
    <section className="w-full max-w-4xl mx-auto mt-8 bg-white rounded shadow p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold">My Books</h2>
        <input
          type="text"
          className="border rounded px-3 py-2 w-full sm:w-64"
          placeholder="Search by title, author, or ISBN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading books...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Failed to load books.</div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No books found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border-b text-left cursor-pointer" onClick={() => handleSort("title")}>Title {sortKey === "title" && (sortDirection === "asc" ? "▲" : "▼")}</th>
                <th className="px-3 py-2 border-b text-left cursor-pointer" onClick={() => handleSort("author")}>Author {sortKey === "author" && (sortDirection === "asc" ? "▲" : "▼")}</th>
                <th className="px-3 py-2 border-b text-left cursor-pointer" onClick={() => handleSort("isbn")}>ISBN {sortKey === "isbn" && (sortDirection === "asc" ? "▲" : "▼")}</th>
                <th className="px-3 py-2 border-b text-left cursor-pointer" onClick={() => handleSort("edition")}>Edition {sortKey === "edition" && (sortDirection === "asc" ? "▲" : "▼")}</th>
                <th className="px-3 py-2 border-b text-left cursor-pointer" onClick={() => handleSort("condition")}>Condition {sortKey === "condition" && (sortDirection === "asc" ? "▲" : "▼")}</th>
                <th className="px-3 py-2 border-b text-left cursor-pointer" onClick={() => handleSort("notes")}>Notes {sortKey === "notes" && (sortDirection === "asc" ? "▲" : "▼")}</th>
                <th className="px-3 py-2 border-b text-left cursor-pointer" onClick={() => handleSort("added_at")}>Added {sortKey === "added_at" && (sortDirection === "asc" ? "▲" : "▼")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length === 0 ? null :
                sortedBooks.filter((book) => filteredBooks.includes(book)).map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleRowClick(book)}
                  >
                    <td className="px-3 py-2 border-b font-medium">{book.title}</td>
                    <td className="px-3 py-2 border-b">{book.author}</td>
                    <td className="px-3 py-2 border-b">{book.isbn || "—"}</td>
                    <td className="px-3 py-2 border-b">{book.edition || "—"}</td>
                    <td className="px-3 py-2 border-b">{book.condition || "—"}</td>
                    <td className="px-3 py-2 border-b">{book.notes || "—"}</td>
                    <td className="px-3 py-2 border-b">{new Date(book.added_at).toLocaleDateString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
    {editingBook && (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-40 z-50 p-2 sm:p-0">
        <div className="bg-white rounded shadow-lg max-w-md w-full relative">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
            onClick={handleClose}
            title="Close"
          >
            &times;
          </button>
          <BookForm
  defaultValues={{
    ...editingBook,
    isbn: editingBook.isbn ?? undefined,
    edition: editingBook.edition ?? undefined,
    condition: editingBook.condition ?? undefined,
    notes: editingBook.notes ?? undefined,
    cover_url: editingBook.cover_url ?? undefined,
  }}
  onSuccess={handleClose}
/>
        </div>
      </div>
    )}
  </>
  );
}
