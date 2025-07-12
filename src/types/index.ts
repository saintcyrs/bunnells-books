// Centralized app types for Bunnell's Books

// Book type (used in book-list, book-form, etc.)
export type Book = {
  id: number;
  isbn: string | null;
  title: string;
  author: string;
  edition: string | null;
  condition: string | null;
  notes: string | null;
  cover_url: string | null;
  added_at: string;
};

// BookFormValues type (used in book-form, book-list)
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

// OpenLibraryBook type (used in search page)
export type OpenLibraryBook = {
  title?: string;
  authors?: OpenLibraryBookAuthor[];
  cover?: { large?: string; medium?: string; small?: string };
  publish_date?: string;
  [key: string]: unknown;
};

export type OpenLibraryBookAuthor = {
  name: string;
};

