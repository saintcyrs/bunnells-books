"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { BookForm } from "./book-form";
import type { Book, BookFormValues } from "@/types";
import Image from "next/image";

export function BookList() {
  const queryClient = useQueryClient();
  const [editingBook, setEditingBook] = useState<Partial<BookFormValues>>();

  const handleEdit = (book: Book) => {
    setEditingBook({
      isbn: book.isbn || undefined,
      title: book.title,
      author: book.author,
      edition: book.edition || undefined,
      condition: book.condition || undefined,
      notes: book.notes || undefined,
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

  if (isLoading) return <p className="text-center">Loading…</p>;
  if (error) return <p className="text-red-500 text-center">Error: {(error as Error).message}</p>;

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data!.map((book: Book) => (
          <div
            key={book.id}
            className="bg-white rounded shadow overflow-hidden relative group cursor-pointer"
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
              <Image
                src={book.cover_url!}
                alt={book.title}
                width={320}
                height={192}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                No Cover
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg">{book.title}</h3>
              <p className="text-sm text-gray-600">{book.author}</p>
              {book.isbn && <p className="text-xs mt-2">ISBN: {book.isbn}</p>}
            </div>
          </div>
        ))}
      </div>
      {editingBook && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded shadow-lg max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
              onClick={handleClose}
              title="Close"
            >
              &times;
            </button>
            <BookForm defaultValues={editingBook} onSuccess={handleClose} />
          </div>
        </div>
      )}
    </>
  );
}