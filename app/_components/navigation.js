"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Navigation() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 p-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <i className="fas fa-search text-white text-lg"></i>
              </div>
              <Link href="/" className="text-xl font-bold text-gray-900">
                Campus<span className="text-indigo-600">Lost&Found</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/report-lost-item"
              className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 hidden md:block"
            >
              Report Lost
            </Link>
            <Link
              href="/report-found-item"
              className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 hidden md:block"
            >
              Report Found
            </Link>
            <Link
              href="/search"
              className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 hidden md:block"
            >
              Found Items
            </Link>

            {status === "loading" ? (
              <span className="text-gray-500">Loading...</span>
            ) : session ? (
              <Link
                href="/api/auth/signout"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-md"
              >
                Log out
              </Link>
            ) : (
              <Link
                href="/user/signin"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-md"
              >
                Log in
              </Link>
            )}

            <button className="md:hidden text-gray-700">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
