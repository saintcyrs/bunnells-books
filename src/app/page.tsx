"use client";
import { useState } from "react";
import BooksTable from "./page-table";
import { BookList } from "../components/book-list";
import Image from "next/image";


export default function Home() {
  const [view, setView] = useState<'table' | 'covers'>('table');
  return (
    <>
      <main className="min-h-screen bg-gray-50 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-6">
            <Image
              src={"/IMG_9613.jpg"}
              alt="Bunnell's Books"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto object-contain"
            />
          </header>
          <div className="bg-white rounded-t-lg shadow-sm border border-b-0 border-gray-200 px-6 pt-6 pb-4">
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                className={`px-4 py-2 rounded font-medium transition-colors ${view === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                onClick={() => setView('table')}
              >
                Table view
              </button>
              <button
                className={`px-4 py-2 rounded font-medium transition-colors ${view === 'covers' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                onClick={() => setView('covers')}
              >
                Covers view
              </button>
            </div>
            <div className="w-full overflow-x-auto">
              {view === 'table' ? <BooksTable /> : <BookList />}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
