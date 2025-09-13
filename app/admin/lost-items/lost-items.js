"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AdminSidebar from "@/app/_components/adminSidebar";

export default function AdminLostItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, found, not_found
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [imageViewer, setImageViewer] = useState({
    open: false,
    images: [],
    currentIndex: 0,
  });

  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/unauthorized");
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchItems = async () => {
      let query = supabase
        .from("lost-items")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply filter if not "all"
      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      // Apply search if term exists
      if (searchTerm) {
        query = query.or(
          `description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,reporter_name.ilike.%${searchTerm}%,item_name.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching lost items:", error);
      } else {
        // Parse picture_urls if they exist
        const itemsWithParsedImages = data.map((item) => ({
          ...item,
          parsedPictureUrls: item.picture_urls
            ? JSON.parse(item.picture_urls)
            : [],
        }));
        setItems(itemsWithParsedImages || []);
      }
      setLoading(false);
    };

    fetchItems();
  }, [filter, searchTerm]);

  const updateItemStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from("lost-items")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error);
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
      setSelectedItem((prev) =>
        prev && prev.id === id ? { ...prev, status: newStatus } : prev
      );
    }
  };

  const viewItemDetails = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const openImageGallery = (images, index = 0) => {
    setImageViewer({
      open: true,
      images: images,
      currentIndex: index,
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "found":
        return "bg-green-100 text-green-800";
      case "claimed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "found":
        return "Found";
      case "claimed":
        return "Claimed";
      default:
        return "Not Found";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading lost items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 ">
      <AdminSidebar />
      {/* Header */}
      <div className="flex-1 p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lost Items Management
          </h1>
          <p className="text-gray-600">
            Manage and track all lost items reported by users
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Items</option>
                <option value="not_found">Not Found</option>
                <option value="found">Found</option>
                <option value="claimed">Claimed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Items
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by item name, description, location, or reporter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-xl mr-4">
                <i className="fas fa-cube text-indigo-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {items.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-xl mr-4">
                <i className="fas fa-search text-yellow-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Not Found</p>
                <p className="text-2xl font-bold text-gray-900">
                  {items.filter((item) => item.status === "not_found").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-xl mr-4">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Found</p>
                <p className="text-2xl font-bold text-gray-900">
                  {items.filter((item) => item.status === "found").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-xl mr-4">
                <i className="fas fa-check-double text-blue-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Claimed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {items.filter((item) => item.status === "claimed").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items List */}
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No items found
            </h3>
            <p className="text-gray-500">
              {filter !== "all" || searchTerm
                ? `No items match your current filters. Try adjusting your search criteria.`
                : "No items have been reported yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Item Images */}
                {item.parsedPictureUrls &&
                  item.parsedPictureUrls.length > 0 && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={item.parsedPictureUrls[0]}
                        alt={item.item_name || item.item_type}
                        fill
                        className="object-cover"
                      />
                      {item.parsedPictureUrls.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-lg text-xs">
                          +{item.parsedPictureUrls.length - 1} more
                        </div>
                      )}
                    </div>
                  )}

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {item.item_name || item.item_type}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        item.status
                      )}`}
                    >
                      {getStatusText(item.status)}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <i className="fas fa-map-marker-alt mr-2 text-indigo-500"></i>
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-calendar-alt mr-2 text-indigo-500"></i>
                      <span>{formatDate(item.date_lost)}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-user mr-2 text-indigo-500"></i>
                      <span>{item.reporter_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                      onClick={() => viewItemDetails(item)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      View Details
                    </button>

                    {item.status !== "claimed" && (
                      <div className="flex space-x-2">
                        {item.status !== "found" && (
                          <button
                            onClick={() => updateItemStatus(item.id, "found")}
                            className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors"
                          >
                            Mark as Found
                          </button>
                        )}
                        <button
                          onClick={() => updateItemStatus(item.id, "claimed")}
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                        >
                          Mark as Claimed
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Item Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-6">
              {/* Image Gallery */}
              {selectedItem.parsedPictureUrls &&
                selectedItem.parsedPictureUrls.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Item Images
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedItem.parsedPictureUrls.map((url, index) => (
                        <div
                          key={index}
                          className="relative h-24 rounded-lg overflow-hidden cursor-pointer"
                          onClick={() =>
                            openImageGallery(
                              selectedItem.parsedPictureUrls,
                              index
                            )
                          }
                        >
                          <Image
                            src={url}
                            alt={`${
                              selectedItem.item_name || selectedItem.item_type
                            } - Image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Item Name
                  </h3>
                  <p className="text-gray-900">
                    {selectedItem.item_name || "Not specified"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Item Type
                  </h3>
                  <p className="text-gray-900 capitalize">
                    {selectedItem.item_type}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Status
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                      selectedItem.status
                    )}`}
                  >
                    {getStatusText(selectedItem.status)}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Location Lost
                  </h3>
                  <p className="text-gray-900">{selectedItem.location}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Date Lost
                  </h3>
                  <p className="text-gray-900">
                    {formatDate(selectedItem.date_lost)}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Description
                </h3>
                <p className="text-gray-900">{selectedItem.description}</p>
              </div>

              {selectedItem.proof_url && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Proof of Ownership
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <a
                      href={selectedItem.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 flex items-center"
                    >
                      <i className="fas fa-external-link-alt mr-2"></i>
                      View proof document
                    </a>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Reporter Information
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-900">
                      <span className="font-medium">Name:</span>{" "}
                      {selectedItem.reporter_name}
                    </p>
                    <p className="text-gray-900 mt-2">
                      <span className="font-medium">Email:</span>{" "}
                      {selectedItem.reporter_email}
                    </p>
                    {selectedItem.reporter_phone && (
                      <p className="text-gray-900 mt-2">
                        <span className="font-medium">Phone:</span>{" "}
                        {selectedItem.reporter_phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Item Actions
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    {selectedItem.status === "not_found" && (
                      <button
                        onClick={() => {
                          updateItemStatus(selectedItem.id, "found");
                          setShowModal(false);
                        }}
                        className="w-full bg-green-600 text-white py-2 rounded-xl font-medium hover:bg-green-700 transition-colors"
                      >
                        Mark as Found
                      </button>
                    )}

                    {selectedItem.status === "found" && (
                      <button
                        onClick={() => {
                          updateItemStatus(selectedItem.id, "claimed");
                          setShowModal(false);
                        }}
                        className="w-full bg-blue-600 text-white py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                      >
                        Mark as Claimed
                      </button>
                    )}

                    {selectedItem.status === "claimed" && (
                      <button
                        onClick={() => {
                          updateItemStatus(selectedItem.id, "not_found");
                          setShowModal(false);
                        }}
                        className="w-full bg-yellow-600 text-white py-2 rounded-xl font-medium hover:bg-yellow-700 transition-colors"
                      >
                        Reopen Case
                      </button>
                    )}

                    <button className="w-full bg-indigo-600 text-white py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                      Contact Reporter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {imageViewer.open && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl w-full max-h-full">
            <button
              onClick={() =>
                setImageViewer({ open: false, images: [], currentIndex: 0 })
              }
              className="absolute top-4 right-4 text-white z-10 bg-black bg-opacity-50 rounded-full p-2"
            >
              <i className="fas fa-times text-xl"></i>
            </button>

            <div className="relative h-96 md:h-[500px] w-full">
              <Image
                src={imageViewer.images[imageViewer.currentIndex]}
                alt={`Image ${imageViewer.currentIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {imageViewer.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setImageViewer((prev) => ({
                      ...prev,
                      currentIndex:
                        prev.currentIndex > 0
                          ? prev.currentIndex - 1
                          : prev.images.length - 1,
                    }))
                  }
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-3"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>

                <button
                  onClick={() =>
                    setImageViewer((prev) => ({
                      ...prev,
                      currentIndex:
                        prev.currentIndex < prev.images.length - 1
                          ? prev.currentIndex + 1
                          : 0,
                    }))
                  }
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-3"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 rounded-full px-3 py-1">
                  {imageViewer.currentIndex + 1} / {imageViewer.images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
