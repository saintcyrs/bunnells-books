"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { BookForm } from "./book-form";
import type { Book, BookFormValues } from "@/types";
import Image from "next/image";
import Button from "@/components/ui/Button";

export function BookList() {
  // Track natural image sizes by book id
  const [imageSizes, setImageSizes] = useState<Record<number, { width: number; height: number }>>({});
  const queryClient = useQueryClient();
  const [editingBook, setEditingBook] = useState<Partial<BookFormValues>>();

  const handleEdit = (book: Book) => {
    setEditingBook({
      id: book.id,
      isbn: book.isbn || undefined,
      title: book.title,
      author: book.author,
      edition: book.edition || undefined,
      condition: book.condition || undefined,
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

  return (
    <>
      <div className="grid gap-4 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {data!.map((book: Book) => (
          <div
            key={book.id}
            className="bg-white rounded shadow overflow-hidden relative group cursor-pointer transition-transform hover:scale-[1.01] active:scale-95"
            onClick={() => handleEdit(book)}
          >
            <button
              className="absolute top-2 right-2 z-10 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete book"
              onClick={async (e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to delete “${book.title}”? This cannot be undone.`)) {
                  deleteMutation.mutate(book.id);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              &#128465;
            </button>
            {book.cover_url ? (
              <div
                style={{
                  width: 200,
                  height: imageSizes[book.id]?.height
                    ? (200 * imageSizes[book.id].height) / imageSizes[book.id].width
                    : 300, // fallback to 2:3 aspect ratio
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
              <div className="w-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm" style={{ height: 300, width: 200, margin: "0 auto", borderRadius: "0.5rem" }}>
                No Cover
              </div>
            )}
            <div className="p-3 sm:p-4">
              <h3 className="font-semibold text-base sm:text-lg">{book.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600">{book.author}</p>
              {book.isbn && <p className="text-xs mt-2">ISBN: {book.isbn}</p>}
            </div>
          </div>
        ))}
      </div>
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
            <BookForm defaultValues={editingBook} onSuccess={handleClose}>
              <div className="flex justify-center gap-2 px-6 pb-4">
                <Button
                  variant="danger"
                  size="md"
                  className="w-full"
                  disabled={deleteMutation.isPending}
                  onClick={async () => {
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