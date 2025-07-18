"use client";

import { useForm, Controller } from "react-hook-form";
import { supabase } from "@/lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Image from "next/image";
import { Field, Fieldset, Input, Label, Legend, Textarea, Menu, MenuButton, MenuItem, MenuItems, Button as HButton } from '@headlessui/react'
import Button from "@/components/ui/Button";
import { BookFormValues, OpenLibraryBookAuthor } from "@/types";



interface BookFormProps {
  defaultValues?: Partial<BookFormValues>;
  onSuccess: () => void;
}

export function BookForm({ defaultValues, onSuccess, children }: React.PropsWithChildren<BookFormProps>) {
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
  // Local blob preview for newly chosen file
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

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
        // Removed unused variable 'q' (was: const q = [title, author].filter(Boolean).join(" ");)
        const res = await fetch(`https://openlibrary.org/search.json?${title ? `title=${encodeURIComponent(title)}` : ""}${title && author ? "&" : ""}${author ? `author=${encodeURIComponent(author)}` : ""}`);
        const data = await res.json();
        if (data.docs && Array.isArray(data.docs)) {
          data.docs.slice(0, 8).forEach((doc: Record<string, unknown>) => {
            if (doc.cover_i) {
              covers.push(`https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`);
            }
            if (doc.isbn && Array.isArray(doc.isbn)) {
              (doc.isbn as string[]).slice(0, 2).forEach((isbn: string) => {
                covers.push(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`);
              });
            }
          });
        }
      }
    } catch (err) {
      console.error("OpenLibrary search failed", err as Error);
    }
    // Remove duplicates
    covers = Array.from(new Set(covers));
    setCoverResults(covers);
    setSearching(false);
  }

  async function uploadCover(originalFile: File): Promise<string> {
    let file = originalFile;
    let ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    if (ext === "jpeg") {
      // Normalize jpeg to jpg for consistent storage paths
      ext = "jpg";
      // Rename file so that Supabase object key ends with .jpg
      file = new File([file], file.name.replace(/\.jpeg$/i, ".jpg"), { type: file.type });
    }

    // Convert HEIC/HEIF to JPEG in-browser using dynamic import to keep bundle small
    if (file.type === "image/heic" || file.type === "image/heif" || ext === "heic" || ext === "heif") {
      const heic2any = (await import("heic2any")).default;
      const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 }) as Blob;
      file = new File([convertedBlob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
        type: "image/jpeg",
      });
      ext = "jpg";
    }

    const id = crypto.randomUUID();
    const path = `${id}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("covers").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("covers").getPublicUrl(path);
    return data.publicUrl;
  }

  const fetchMetadata = async (isbn: string): Promise<void> => {
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
          book.authors?.map((a: OpenLibraryBookAuthor) => a.name).join(", ") || ""
        );
        if (book.edition_name) {
          setValue("edition", book.edition_name);
        }
        if (book.publish_date) {
          const match = (book.publish_date as string).match(/\d{4}/);
          const pub = match ? match[0] : book.publish_date;
          setValue("publication_date", pub, { shouldDirty: true, shouldValidate: true });
        }
      }
    } catch (err) {
      console.error("Lookup failed:", err as Error);
    }
  };

  const normalizeDate = (input?: string): string | null => {
    if (!input) return null;
    const trimmed = input.trim();
    if (/^\d{4}$/.test(trimmed)) {
      return `${trimmed}-01-01`; // year only => Jan 1
    }
    return trimmed; // assume YYYY-MM-DD or other full date string
  };

  const onSubmit = async (data: BookFormValues): Promise<void> => {
    try {
      let cover_url: string | null = null;
      if (data.cover && data.cover.length > 0) {
        cover_url = await uploadCover(data.cover[0]);
      } else if (selectedCoverUrl) {
        cover_url = selectedCoverUrl;
      }

      let error;
      if (data.id) {
        // Editing existing book
        // Only include cover_url in update if a new cover was selected or uploaded
        const updateFields: Partial<BookFormValues> = {
          isbn: data.isbn,
          title: data.title,
          author: data.author,
          edition: data.edition,
          condition: data.condition,
          publication_date: normalizeDate(data.publication_date) ?? undefined,
          notes: data.notes,
        };
        if (cover_url !== null && cover_url !== undefined) {
          updateFields.cover_url = cover_url;
        }
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
            publication_date: normalizeDate(data.publication_date) ?? undefined,
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err);
      }
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="space-y-4 w-full mx-auto p-4 max-h-[80vh] overflow-auto"
    >
      <Fieldset>
        <Legend className="block text-2xl font-bold text-center mb-6 py-2">
  {defaultValues && defaultValues.title ? `Editing: ${defaultValues.title}` : "Add a book"}
</Legend>
        {/* ISBN */}
        <Field className="mb-3">
          <Label htmlFor="isbn">ISBN</Label>
          <Input
            id="isbn"
            {...register("isbn", { pattern: /^[0-9\-]+$/ })}
            onBlur={() => fetchMetadata(getValues("isbn") || "")}
            className="mt-1 block w-full border rounded p-2"
            placeholder="978-..."
          />
          {errors.isbn && <p className="text-xs text-red-500">Invalid ISBN</p>}
        </Field>
        {/* Cover Upload & OpenLibrary Search */}
        <Field className="mb-3">
          <Label>Cover Image</Label>
          <label className="inline-block mt-1 px-3 py-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 px-2 py-1 bg-gray-200 rounded text-sm">
            <Input
               type="file"
               accept="image/*"
               {...register("cover", {
                 onChange: (e) => {
                    const input = e.target as HTMLInputElement;
                    setSelectedCoverUrl(null);
                    const file = input.files?.[0];
                    if (file) {
                      const previewUrl = URL.createObjectURL(file);
                      setCoverPreview(previewUrl);
                    }
                    // return FileList so react-hook-form receives it
                    return input.files;
                 },
               })}
               className="hidden"
             />
            Upload Image
          </label>
          <div className="mt-2">
            <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded mb-2 text-xs">
              You must enter an ISBN to use OpenLibrary cover search.
            </div>
            <Label className="block text-xs font-medium mb-1">Or search OpenLibrary for a cover:</Label>
            <div className="flex gap-2 mb-2">
              <HButton
                type="button"
                className="px-2 py-1 bg-gray-200 rounded text-sm"
                onClick={searchOpenLibraryCovers}
                disabled={searching || !getValues("isbn")}
              >
                {searching ? "Searching..." : "Search"}
              </HButton>
              {selectedCoverUrl && (
                <HButton
                  type="button"
                  className="px-2 py-1 bg-red-200 rounded text-xs text-red-800"
                  onClick={() => setSelectedCoverUrl(null)}
                >
                  Clear selected cover
                </HButton>
              )}
            </div>
            {coverResults.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {coverResults.map((url: string) => (
                  <Image
                    key={url}
                    src={url}
                    alt="OpenLibrary cover"
                    width={80}
                    height={112}
                    className={`w-20 h-28 object-cover border-2 rounded cursor-pointer ${selectedCoverUrl === url ? "border-blue-500 ring-2 ring-blue-400" : "border-gray-200"}`}
                    onClick={() => setSelectedCoverUrl(url)}
                    style={{ opacity: selectedCoverUrl && selectedCoverUrl !== url ? 0.5 : 1 }}
                  />
                ))}
              </div>
            )}
            {coverPreview && (
              <div className="mt-2">
                <span className="text-xs text-green-700">Image to be uploaded</span>
                <div>
                  <Image src={coverPreview} alt="Cover preview" width={96} height={128} className="w-24 h-32 mt-1 rounded shadow" />
                </div>
              </div>
            )}
            {selectedCoverUrl && (
              <div className="mt-2">
                <span className="text-xs text-green-700">Selected cover will be used.</span>
                <div>
                  <Image src={selectedCoverUrl} alt="Selected cover" width={96} height={128} className="w-24 h-32 mt-1 rounded shadow" />
                </div>
              </div>
            )}
          </div>
        </Field>
        {/* Title */}
        <Field className="mb-3">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...register("title", { required: "Title is required" })}
            className="mt-1 block w-full border rounded p-2"
            placeholder="Book Title"
          />
          {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
        </Field>
        {/* Author */}
        <Field className="mb-3">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            {...register("author", { required: "Author is required" })}
            className="mt-1 block w-full border rounded p-2"
            placeholder="Author Name"
          />
          {errors.author && <p className="text-xs text-red-500">{errors.author.message}</p>}
        </Field>
        {/* Edition & Condition */}
        <div className="mb-3">
  <Field>
    <Label htmlFor="edition">Edition</Label>
    <Input
      id="edition"
      {...register("edition")}
      className="mt-1 block w-full border rounded p-2"
    />
  </Field>
</div>
<div className="mb-3">
  <Field>
    <Label htmlFor="publication_date">Publication Date</Label>
    <Input
      id="publication_date"
      {...register("publication_date")}
      className="mt-1 block w-full border rounded p-2"
    />
  </Field>
</div>
<div className="mb-3">
  <Field>
    <Label htmlFor="condition">Condition</Label>
    <Controller
      control={control}
      name="condition"
      defaultValue="Like New"
      render={({ field: { value, onChange } }) => (
        <Menu>
          <MenuButton as={HButton} className="w-full border rounded p-2 text-left">
            {value || 'Like New'}
          </MenuButton>
          <MenuItems className="mt-2 w-full bg-white shadow-lg rounded-lg">
            {['Like New', 'Very Good', 'Good', 'Acceptable'].map((option) => (
  <MenuItem key={option}>
    {({ active }) => (
      <HButton
        className={`group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500${
          value === option ? ' bg-blue-100' : ''
        }${active ? ' bg-blue-50' : ''}`}
        type="button"
        onClick={() => onChange(option)}
      >
        {option}
        <kbd className="ml-auto hidden font-sans text-xs text-white/50 group-data-focus:inline">⌘E</kbd>
      </HButton>
    )}
  </MenuItem>
))}
          </MenuItems>
        </Menu>
      )}
    />
  </Field>
</div>
        <Field className="mb-3">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            className="mt-1 block w-full border rounded p-2"
            rows={3}
          />
        </Field>
        <Button
  type="submit"
  variant="primary"
  size="md"
  className="w-full py-3"
  disabled={isSubmitting}
>
  {isSubmitting ? "Saving…" : defaultValues ? "Save Changes" : "Add Book"}
</Button>
        {children}
      </Fieldset>
    </form>
  );
}