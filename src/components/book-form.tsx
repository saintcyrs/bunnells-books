"use client";

import { useForm, Controller } from "react-hook-form";
import { supabase } from "@/lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export type BookFormValues = {
  id?: number;
  cover?: FileList;
  isbn?: string;
  title: string;
  author: string;
  edition?: string;
  condition?: string;
  notes?: string;
  cover_url?: string;
};

interface BookFormProps {
  defaultValues?: Partial<BookFormValues>;
  onSuccess: () => void;
}

export function BookForm({ defaultValues, onSuccess }: BookFormProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookFormValues>({ defaultValues });

  // --- OpenLibrary Cover Search State ---
  const [searching, setSearching] = useState(false);
  const [coverResults, setCoverResults] = useState<string[]>([]);
  const [selectedCoverUrl, setSelectedCoverUrl] = useState<string | null>(defaultValues?.cover_url ?? null);

  // --- OpenLibrary Cover Search Function ---
  async function searchOpenLibraryCovers() {
    setSearching(true);
    setCoverResults([]);
    const isbn = getValues("isbn")?.replace(/-/g, "");
    const title = getValues("title");
    const author = getValues("author");
    let covers: string[] = [];
    try {
      // Try ISBN cover first
      if (isbn) {
        covers.push(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`);
      }
      // Search OpenLibrary API by title/author
      if (title || author) {
        const q = [title, author].filter(Boolean).join(" ");
        const res = await fetch(`https://openlibrary.org/search.json?${title ? `title=${encodeURIComponent(title)}` : ""}${title && author ? "&" : ""}${author ? `author=${encodeURIComponent(author)}` : ""}`);
        const data = await res.json();
        if (data.docs && Array.isArray(data.docs)) {
          data.docs.slice(0, 8).forEach((doc: any) => {
            if (doc.cover_i) {
              covers.push(`https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`);
            }
            if (doc.isbn && Array.isArray(doc.isbn)) {
              doc.isbn.slice(0, 2).forEach((isbn: string) => {
                covers.push(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`);
              });
            }
          });
        }
      }
    } catch (err) {
      console.error("OpenLibrary search failed", err);
    }
    // Remove duplicates
    covers = Array.from(new Set(covers));
    setCoverResults(covers);
    setSearching(false);
  }

  async function uploadCover(file: File): Promise<string> {
    const ext = file.name.split(".").pop();
    const id = crypto.randomUUID();
    const path = `covers/${id}.${ext}`;
    const { data, error: uploadError } = await supabase.storage.from("covers").upload(path, file);
    if (uploadError) throw uploadError;
    const { data: publicUrlData } = supabase.storage.from("covers").getPublicUrl(path);
    return publicUrlData.publicUrl;
  }

  const fetchMetadata = async (isbn: string) => {
    if (!isbn) return;
    try {
      const res = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
      );
      const json = await res.json();
      const book = json[`ISBN:${isbn}`];
      if (book) {
        setValue("title", book.title);
        setValue(
          "author",
          book.authors?.map((a: any) => a.name).join(", ") || ""
        );
      }
    } catch (err) {
      console.error("Lookup failed:", err);
    }
  };

  const onSubmit = async (data: BookFormValues) => {
    try {
      let cover_url: string | null = null;
      if (selectedCoverUrl) {
        cover_url = selectedCoverUrl;
      } else if (data.cover && data.cover.length > 0) {
        cover_url = await uploadCover(data.cover[0]);
      }

      let error;
      if (data.id) {
        // Editing existing book
        const updateFields: any = {
          isbn: data.isbn,
          title: data.title,
          author: data.author,
          edition: data.edition,
          condition: data.condition,
          notes: data.notes,
        };
        if (cover_url) updateFields.cover_url = cover_url;
        ({ error } = await supabase
          .from("books")
          .update(updateFields)
          .eq("id", data.id));
      } else {
        // Creating new book
        ({ error } = await supabase.from("books").insert([
          {
            isbn: data.isbn,
            title: data.title,
            author: data.author,
            edition: data.edition,
            condition: data.condition,
            notes: data.notes,
            cover_url,
            added_at: new Date().toISOString(),
          },
        ]));
      }
      if (error) throw error;
      reset();
      setSelectedCoverUrl(null);
      setCoverResults([]);
      queryClient.invalidateQueries({ queryKey: ["books"] });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert("Error adding book: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 bg-white rounded shadow">
      <div>
        <label className="block text-sm font-medium">Cover Image</label>
        <input
          {...register("cover")}
          type="file"
          accept="image/*"
          className="mt-1 block w-full"
          onChange={() => setSelectedCoverUrl(null)}
        />
        <div className="mt-2">
          <label className="block text-xs font-medium mb-1">Or search OpenLibrary for a cover:</label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              className="px-2 py-1 bg-gray-200 rounded text-xs"
              onClick={searchOpenLibraryCovers}
              disabled={searching}
            >
              {searching ? "Searching..." : "Search"}
            </button>
            {selectedCoverUrl && (
              <button
                type="button"
                className="px-2 py-1 bg-red-200 rounded text-xs text-red-800"
                onClick={() => setSelectedCoverUrl(null)}
              >
                Clear selected cover
              </button>
            )}
          </div>
          {coverResults.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {coverResults.map((url: string) => (
                <img
                  key={url}
                  src={url}
                  alt="OpenLibrary cover"
                  className={`w-20 h-28 object-cover border-2 rounded cursor-pointer ${selectedCoverUrl === url ? "border-blue-500 ring-2 ring-blue-400" : "border-gray-200"}`}
                  onClick={() => setSelectedCoverUrl(url)}
                  style={{ opacity: selectedCoverUrl && selectedCoverUrl !== url ? 0.5 : 1 }}
                />
              ))}
            </div>
          )}
          {selectedCoverUrl && (
            <div className="mt-2">
              <span className="text-xs text-green-700">Selected cover will be used.</span>
              <div>
                <img src={selectedCoverUrl} alt="Selected cover" className="w-24 h-32 mt-1 rounded shadow" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">ISBN (optional)</label>
        <input
          {...register("isbn", { pattern: /^[0-9\-]+$/ })}
          onBlur={() => fetchMetadata(getValues("isbn") || "")}
          className="mt-1 block w-full border rounded p-2"
          placeholder="978-..."
        />
        {errors.isbn && <p className="text-xs text-red-500">Invalid ISBN</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          {...register("title", { required: "Title is required" })}
          className="mt-1 block w-full border rounded p-2"
          placeholder="Book Title"
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Author</label>
        <input
          {...register("author", { required: "Author is required" })}
          className="mt-1 block w-full border rounded p-2"
          placeholder="Author Name"
        />
        {errors.author && <p className="text-xs text-red-500">{errors.author.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm">Edition</label>
          <input
            {...register("edition")}
            className="mt-1 block w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm">Condition</label>
          <Controller
            name="condition"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="mt-1 block w-full border rounded p-2"
              >
                <option value="">– select –</option>
                <option>Like New</option>
                <option>Very Good</option>
                <option>Good</option>
                <option>Acceptable</option>
              </select>
            )}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm">Notes</label>
        <textarea
          {...register("notes")}
          className="mt-1 block w-full border rounded p-2"
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {isSubmitting ? "Saving…" : defaultValues ? "Save Changes" : "Add Book"}
      </button>
    </form>
  );
}