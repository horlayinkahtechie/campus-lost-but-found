"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Image from "next/image";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LostItemsPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const ITEMS_PER_PAGE = 9;

  const handleClaimClick = (itemId) => {
    if (!session) {
      toast.error("You need to log in to claim this item.");
      return;
    }
    router.push(`/claim/${itemId}`);
  };

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);

      let query = supabase.from("found-items").select("*", { count: "exact" });

      if (filter !== "all") {
        query = query.eq("item_type", filter);
      }

      if (searchTerm) {
        query = query.or(
          `description.ilike.%${searchTerm}%,location_found.ilike.%${searchTerm}%`
        );
      }

      const { count } = await query;
      setTotalCount(count || 0);

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching items:", error);
      } else {
        setItems(data);
      }
      setLoading(false);
    };

    fetchItems();
  }, [page, filter, searchTerm]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const itemTypes = [
    { value: "All", label: "All Items" },
    { value: "Phone", label: "Phone" },
    { value: "Laptop", label: "Laptop" },
    { value: "Tablet", label: "Tablet" },
    { value: "Smart watch", label: "Smart watch" },
    { value: "ID card", label: "ID Cards" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Head>
        <title>Lost & Found Items - Campus Lost & Found</title>
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No items found
            </h3>
            <p className="text-gray-500">
              {searchTerm || filter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No items have been reported yet. Check back later."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {item.picture_url ? (
                    <div className="relative h-48 w-full">
                      <Image
                        src={item.picture_url}
                        alt={item.item_type}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                      <i className="fas fa-image text-3xl"></i>
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                        {item.item_type}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === "claimed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {item.description.substring(0, 40)}
                      {item.description.length > 40 ? "..." : ""}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                      Description: {item.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                      {item.status === "claimed" ? (
                        <button
                          disabled
                          className="w-full bg-gray-200 text-gray-600 py-2 px-4 rounded-xl font-medium cursor-not-allowed"
                        >
                          Already Claimed
                        </button>
                      ) : (
                        <button
                          onClick={() => handleClaimClick(item.id)}
                          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-xl font-medium text-center hover:bg-indigo-700 transition-colors duration-200"
                        >
                          Claim This Item
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
