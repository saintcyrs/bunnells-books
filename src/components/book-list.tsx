"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { BookForm } from "./book-form";
import type { Book, BookFormValues } from "@/types";
import Image from "next/image";
import Button from "@/components/ui/Button";

interface BookListProps {
  search?: string;
}

export function BookList({ search = "" }: BookListProps) {
  // Track natural image sizes by book id
  const [imageSizes, setImageSizes] = useState<Record<number, { width: number; height: number }>>({});
  const queryClient = useQueryClient();
  const [editingBook, setEditingBook] = useState<Partial<BookFormValues>>();
  // Track which book's note is currently open
  const [openNoteId, setOpenNoteId] = useState<number | null>(null);
  // Close note popovers when clicking anywhere else
  useEffect(() => {
    if (openNoteId === null) return;
    const handler = () => setOpenNoteId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openNoteId]);

  const handleEdit = (book: Book) => {
    setEditingBook({
      id: book.id,
      isbn: book.isbn || undefined,
      title: book.title,
      author: book.author,
      edition: book.edition || undefined,
      condition: book.condition || undefined,
      publication_date: book.publication_date || undefined,
      notes: book.notes || undefined,
      cover_url: book.cover_url || undefined,
    });
  };
  const handleClose = () => setEditingBook(undefined);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("books").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });

  const { data, isLoading, error } = useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("added_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-center text-sm sm:text-base">Loading…</p>;
  if (error) return <p className="text-red-500 text-center text-sm sm:text-base">Error: {(error as Error).message}</p>;

  // Filter books by search
  const filteredBooks = (data || []).filter(book => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      (book.isbn ? book.isbn.toLowerCase().includes(q) : false)
    );
  });

  return (
    <div className="space-y-4">
      {filteredBooks.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
          {search ? 'No books match your search.' : 'No books found.'}
        </div>
      ) : (
        <div className="grid gap-4 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-lg shadow overflow-hidden relative group cursor-pointer transition-transform hover:scale-[1.01] active:scale-95"
              onClick={() => handleEdit(book)}
            >
              {book.notes && (
                <button
                  className="absolute top-2 left-2 z-10 p-1.5 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-700"
                  title="View note"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenNoteId(openNoteId === book.id ? null : book.id);
                  }}
                >
                  <span className="text-lg" role="img" aria-label="note">💬</span>
                </button>
              )}

              {book.notes && openNoteId === book.id && (
                <div
                  className="absolute top-12 left-2 bg-white border rounded shadow-lg p-3 text-sm w-56 z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="whitespace-pre-wrap">{book.notes}</p>
                </div>
              )}

              <button
                className="absolute top-2 right-2 z-10 p-1.5 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                title="Delete book"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (window.confirm(`Are you sure you want to delete "${book.title}"? This cannot be undone.`)) {
                    deleteMutation.mutate(book.id);
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                <span className="text-lg" role="img" aria-label="delete">🗑️</span>
              </button>
              {book.cover_url ? (
                <div
                  style={{
                    width: 200,
                    height: imageSizes[book.id]?.height
                      ? (200 * imageSizes[book.id].height) / imageSizes[book.id].width
                      : 300,
                    overflow: "hidden",
                    margin: "0 auto",
                  }}
                  className="bg-gray-100 rounded-t flex items-center justify-center"
                >
                  <Image
                    src={book.cover_url!}
                    alt={book.title}
                    width={imageSizes[book.id]?.width || 200}
                    height={imageSizes[book.id]?.height || 300}
                    className="object-contain w-full h-full"
                    onLoadingComplete={(img) => {
                      setImageSizes((prev) => ({
                        ...prev,
                        [book.id]: {
                          width: img.naturalWidth,
                          height: img.naturalHeight,
                        },
                      }));
                    }}
                  />
                </div>
              ) : (
                <div className="w-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm" style={{ height: 300, width: 200, margin: "0 auto" }}>
                  No Cover
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-base text-gray-900 line-clamp-2">{book.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{book.author}</p>
                {book.isbn && <p className="text-xs text-gray-500 mt-2">ISBN: {book.isbn}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
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
              defaultValues={editingBook} 
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
    </div>
  );
}