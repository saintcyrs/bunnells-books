import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-6">Bunnell&apos;s Books</h1>
      <div className="space-x-4">
        <Link href="/collection" className="px-4 py-2 bg-blue-600 text-white rounded">
          View My Library
        </Link>
        <Link href="/search" className="px-4 py-2 bg-green-600 text-white rounded">
          Search & Import
        </Link>
      </div>
    </main>
  );
}
