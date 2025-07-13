"use client";
import { useState } from "react";
import BooksTable from "./page-table";
import { BookList } from "../components/book-list";


export default function Home() {
  const [view, setView] = useState<'table' | 'covers'>('table');

  return (
    <>
      <main className="min-h-screen flex flex-col items-center bg-gray-50 p-3 sm:p-0">
        {/* <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-center">Bunnell&apos;s Books</h1> */}
        <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-center">Bunnell&apos;s Books</h1>
        <div className="flex gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded font-medium transition-colors ${view === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setView('table')}
          >
            Table
          </button>
          <button
            className={`px-4 py-2 rounded font-medium transition-colors ${view === 'covers' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setView('covers')}
          >
            Covers
          </button>
        </div>
        {view === 'table' ? <BooksTable /> : <BookList />}
      </main>
    </>
  );
}
