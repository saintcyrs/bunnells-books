
import BooksTable from "./page-table";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-50 p-3 sm:p-0">
      <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-center">Bunnell&apos;s Books</h1>
      <BooksTable />
    </main>
  );
}
