"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useState, useMemo } from "react";
import type { Book } from "@/types";
import { BookForm } from "@/components/book-form";
import Button from "@/components/ui/Button";

export default function BooksTable() {
  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

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

  // No filtering, just show all books
  const filteredBooks = books;

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
    <section className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold">My Books</h2>
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
      <div className="fixed inset-0 flex items-start justify-center bg-white/75 backdrop-blur-sm z-50 p-2 pt-16 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative my-4 border border-gray-100">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl z-10"
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
          >
            <div className="flex justify-center gap-2 pt-2">
              <Button
                variant="danger"
                size="md"
                className="w-full py-3"
                disabled={deleteMutation.isPending}
                onClick={async (e) => {
                  e.preventDefault();
                  if (window.confirm("Are you sure you want to delete this book? This cannot be undone.")) {
                    await deleteMutation.mutateAsync(editingBook.id!);
                    handleClose();
                  }
                }}
              >
                Delete Book
              </Button>
            </div>
          </BookForm>
        </div>
      </div>
    )}
  </>
  );
}
