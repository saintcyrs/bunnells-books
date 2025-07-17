"use client";
import { useState } from "react";
import BooksTable from "./page-table";
import { BookList } from "../components/book-list";
import Image from "next/image";
import { useEffect } from "react";


export default function Home() {
  const [view, setView] = useState<'table' | 'covers'>('table');
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/IMG_9613.jpg");
        const blob = await res.blob();
        const file = new File([blob], "IMG_9613.jpg", { type: "image/jpeg" });
        const heic2any = (await import("heic2any")).default;
        const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 }) as Blob;
        const convertedFile = new File([convertedBlob], "IMG_9613.jpg", { type: "image/jpeg" });
        setImageSrc(URL.createObjectURL(convertedFile));
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);
  return (
    <>
      <main className="min-h-screen bg-gray-50 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-6">
            <Image
              src={imageSrc || "/IMG_9613.jpg"}
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
