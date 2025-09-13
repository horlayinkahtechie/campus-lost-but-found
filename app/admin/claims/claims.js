"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "@/app/_components/adminSidebar";
import AdminSidebar from "@/app/_components/adminSidebar";

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/unauthorized");
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchClaims = async () => {
      let query = supabase
        .from("claims")
        .select(
          "id, claimant_email, details, item_image, status, item_id, claimant_image, purchase_receipt, item_type, extra_info, created_at, found-items(item_type, description, location_found)"
        )
        .order("created_at", { ascending: false });

      // Apply filter if not "all"
      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching claims:", error);
      } else {
        const parsed = (data || []).map((claim) => ({
          ...claim,
          item_image: claim.item_image ? JSON.parse(claim.item_image) : [],
        }));
        setClaims(parsed);
      }
      setLoading(false);
    };

    fetchClaims();
  }, [filter]);

  const handleStatusUpdate = async (id, newStatus, itemId) => {
    const { error: claimError } = await supabase
      .from("claims")
      .update({ status: newStatus })
      .eq("id", id);

    if (claimError) {
      console.error("Error updating claim status:", claimError);
      return;
    }

    if (newStatus === "approved" && itemId) {
      const { error: itemError } = await supabase
        .from("found-items")
        .update({ status: "claimed" })
        .eq("id", itemId);

      if (itemError) {
        console.error("Error updating found item status:", itemError);
      }
    }

    setClaims((prev) =>
      prev.map((claim) =>
        claim.id === id ? { ...claim, status: newStatus } : claim
      )
    );
  };

  const viewClaimDetails = (claim) => {
    setSelectedClaim(claim);
    setShowModal(true);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Pending Review";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading claims...</p>
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
            Claim Requests
          </h1>
          <p className="text-gray-600">
            Review and manage item claim requests from users
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filter === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Claims
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filter === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filter === "approved"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filter === "rejected"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-xl mr-4">
                <i className="fas fa-list text-indigo-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Claims</p>
                <p className="text-2xl font-bold text-gray-900">
                  {claims.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-xl mr-4">
                <i className="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {claims.filter((c) => c.status === "pending").length}
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
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {claims.filter((c) => c.status === "approved").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-xl mr-4">
                <i className="fas fa-times-circle text-red-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {claims.filter((c) => c.status === "rejected").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Claims List */}
        {claims.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No claims found
            </h3>
            <p className="text-gray-500">
              {filter !== "all"
                ? `No ${filter} claims at the moment.`
                : "No claims have been submitted yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {claim.item_type || "Unknown Item"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {claim.claimant_email}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        claim.status
                      )}`}
                    >
                      {getStatusText(claim.status)}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {claim.details}
                  </p>

                  <div className="flex space-x-3 mb-4">
                    {claim.item_image?.length > 0 && (
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">
                          Item Images
                        </p>
                        <div className="flex gap-2">
                          {claim.item_image.map((img, idx) => (
                            <div
                              key={idx}
                              className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100"
                            >
                              <Image
                                src={img}
                                alt={`Item ${idx + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {claim.claimant_image && (
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">
                          Proof Image
                        </p>
                        <div className="relative h-20 w-full rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={claim.claimant_image}
                            alt="Claimant Proof"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                      onClick={() => viewClaimDetails(claim)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      View Details
                    </button>

                    {claim.status === "pending" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleStatusUpdate(
                              claim.id,
                              "approved",
                              claim.item_id
                            )
                          }
                          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                          title="Approve Claim"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(
                              claim.id,
                              "rejected",
                              claim.item_id
                            )
                          }
                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                          title="Reject Claim"
                        >
                          <i className="fas fa-times"></i>
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

      {/* Claim Detail Modal */}
      {showModal && selectedClaim && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Claim Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Claimant Email
                  </h3>
                  <p className="text-gray-900">
                    {selectedClaim.claimant_email}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Status
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                      selectedClaim.status
                    )}`}
                  >
                    {getStatusText(selectedClaim.status)}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Item Type
                  </h3>
                  <p className="text-gray-900">
                    {selectedClaim.item_type || "Not specified"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Date Submitted
                  </h3>
                  <p className="text-gray-900">
                    {new Date(selectedClaim.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Claim Details
                </h3>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {selectedClaim.details}
                </p>
              </div>

              {selectedClaim.extra_info && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Ownership Proof (Extra Info)
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    {(() => {
                      const info = selectedClaim.extra_info;

                      switch (selectedClaim.item_type) {
                        case "Phone":
                        case "Tablet":
                          return (
                            <>
                              <p className="text-black">
                                <span className="font-medium">IMEI:</span>{" "}
                                {info.imei}
                              </p>
                              <p className="text-black">
                                <span className="font-medium">
                                  Frequent Number 1:
                                </span>{" "}
                                {info.frequentNumber1}
                              </p>
                              <p className="text-black">
                                <span className="font-medium">
                                  Frequent Number 2:
                                </span>{" "}
                                {info.frequentNumber2}
                              </p>
                              <p className="text-black">
                                <span className="font-medium">SIM Name:</span>{" "}
                                {info.simName}
                              </p>
                              <p className="text-black">
                                <span className="font-medium">SIM Number:</span>{" "}
                                {info.simNumber}
                              </p>
                              <p className="text-black">
                                <span className="font-medium">Model:</span>{" "}
                                {info.model}
                              </p>
                              <p className="text-black">
                                <span className="font-medium">
                                  Last location Found:
                                </span>{" "}
                                {info.lastLocation}
                              </p>
                            </>
                          );

                        case "Laptop":
                          return (
                            <>
                              <p className="text-black">
                                <span className="font-medium">
                                  Serial Number:
                                </span>{" "}
                                {info.serialNumber}
                              </p>
                              <p className="text-black">
                                <span className="font-medium">
                                  Recent Website:
                                </span>{" "}
                                {info.recentWebsite}
                              </p>
                              <p className="text-black">
                                <span className="font-medium">
                                  Signed Up Email:
                                </span>{" "}
                                {info.signedUpEmail}
                              </p>
                              <p className="text-black">
                                <span className="font-medium">Model:</span>{" "}
                                {info.model}
                              </p>
                              <p className="text-black">
                                <span className="font-medium">
                                  Installed Apps:
                                </span>{" "}
                                {info.installedApps}
                              </p>
                              <p className="text-black">
                                <span className="font-medium">
                                  Last location Found:
                                </span>{" "}
                                {info.lastLocation}
                              </p>
                            </>
                          );

                        case "Smart watch":
                          return (
                            <>
                              <p className="text-black">
                                <span className="font-medium">Brand:</span>{" "}
                                {info.brand}
                              </p>
                              <p className="text-black">
                                <span className="font-medium">Model:</span>{" "}
                                {info.model}
                              </p>
                              <p className="text-black">
                                <span className="font-medium">
                                  Serial/IMEI:
                                </span>{" "}
                                {info.watchSerialImei}
                              </p>
                              <p className="text-black">
                                <span className="font-medium">Color:</span>{" "}
                                {info.color}
                              </p>
                              <p className="text-black">
                                <span className="font-medium">
                                  Unique Features/Marks:
                                </span>{" "}
                                {info.uniqueFeatures}
                              </p>

                              <p className="text-black">
                                <span className="font-medium">
                                  Last location Found:
                                </span>{" "}
                                {info.lastLocation}
                              </p>
                            </>
                          );

                        default:
                          return (
                            <>
                              <p className="text-black">
                                <span className="font-medium">
                                  Unique Features:
                                </span>{" "}
                                {info.uniqueFeatures}
                              </p>
                              <p className="text-black">
                                <span className="font-medium">
                                  Purchase Date:
                                </span>{" "}
                                {info.purchaseDate}
                              </p>
                              <p className="text-black">
                                <span className="font-medium">
                                  Last Location Found:
                                </span>{" "}
                                {info.lastLocation}
                              </p>
                            </>
                          );
                      }
                    })()}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {selectedClaim.item_image?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Item Image
                    </h3>
                    {selectedClaim.item_image.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative h-80 w-full rounded-lg overflow-hidden bg-gray-100 mb-2"
                      >
                        <Image
                          src={img}
                          alt={`Item ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {selectedClaim.claimant_image && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Proof Image
                    </h3>
                    <div className="relative h-80 w-full rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={selectedClaim.claimant_image}
                        alt="Claimant Proof"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {selectedClaim.purchase_receipt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Purchase receipt
                  </h3>
                  <div className="relative h-64 w-full rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={selectedClaim.purchase_receipt}
                      alt="Purchase receipt"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {selectedClaim.found_items && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Found Item Details
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-900">
                      <span className="font-medium">Type:</span>{" "}
                      {selectedClaim.found_items.item_type}
                    </p>
                    <p className="text-gray-900 mt-2">
                      <span className="font-medium">Description:</span>{" "}
                      {selectedClaim.found_items.description}
                    </p>
                    <p className="text-gray-900 mt-2">
                      <span className="font-medium">Found At:</span>{" "}
                      {selectedClaim.found_items.location_found}
                    </p>
                  </div>
                </div>
              )}

              {selectedClaim.status === "pending" && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedClaim.id, "approved");
                      setShowModal(false);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors"
                  >
                    Approve Claim
                  </button>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedClaim.id, "rejected");
                      setShowModal(false);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors"
                  >
                    Reject Claim
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
