"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function ClaimPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Item-specific information
  const [itemInfo, setItemInfo] = useState({
    // Phone/Tablet fields
    imei: "",
    frequentNumber1: "",
    frequentNumber2: "",
    simName: "",
    simNumber: "",
    // Laptop fields
    serialNumber: "",
    recentWebsite: "",
    signedUpEmail: "",
    // Smart Watch fields
    brand: "",
    model: "",
    watchSerialImei: "",
    // Other fields
    uniqueFeatures: "",
    purchaseDate: "",
    lastLocation: "",
  });

  // multiple images for lost item
  const [itemFiles, setItemFiles] = useState([]);
  const [itemPreviews, setItemPreviews] = useState([]);

  // single image for claimant
  const [claimantFile, setClaimantFile] = useState(null);
  const [claimantPreview, setClaimantPreview] = useState(null);

  const [purchaseReceipt, setPurchaseReceipt] = useState(null);
  const [purchaseReceiptPreview, setPurchaseReceiptPreview] = useState(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      alert("You need to log in to claim an item");
      router.push("/api/auth/signin");
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchItem = async () => {
      const { data, error } = await supabase
        .from("found-items")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching item:", error);
        setMessage("Item not found or already claimed");
      } else {
        setItem(data);
      }
      setLoading(false);
    };

    if (id) fetchItem();
  }, [id]);

  // Handle lost item images (1–3 allowed)
  const handleItemFiles = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      alert("You can only upload up to 3 images.");
      return;
    }
    setItemFiles(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setItemPreviews(previews);
  };

  // Handle claimant picture
  const handleClaimantFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setClaimantFile(file);
      setClaimantPreview(URL.createObjectURL(file));
    }
  };

  const handlePurchaseReceipt = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPurchaseReceipt(file);
      setPurchaseReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleInfoChange = (field, value) => {
    setItemInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!details) {
      alert("Please provide details about how you can prove ownership.");
      return;
    }

    if (itemFiles.length === 0) {
      alert("Please upload at least one picture of the item.");
      return;
    }

    if (!claimantFile) {
      alert("Please upload your picture for verification.");
      return;
    }

    if (!purchaseReceipt) {
      alert("Please upload your purchase receipt for verification.");
      return;
    }

    // Validate item-type specific fields
    if (item.item_type === "phone" || item.item_type === "tablet") {
      if (!itemInfo.imei) {
        alert("Please provide the IMEI number for your device.");
        return;
      }
      if (!itemInfo.frequentNumber1 || !itemInfo.frequentNumber2) {
        alert("Please provide at least two frequently called numbers.");
        return;
      }
      if (!itemInfo.simName || !itemInfo.simNumber) {
        alert("Please provide SIM card details.");
        return;
      }
    }

    if (item.item_type === "laptop") {
      if (!itemInfo.serialNumber) {
        alert("Please provide the serial number for your laptop.");
        return;
      }
      if (!itemInfo.recentWebsite) {
        alert("Please provide a recently visited website.");
        return;
      }
      if (!itemInfo.signedUpEmail) {
        alert("Please provide an email signed up on the laptop.");
        return;
      }
    }

    if (item.item_type === "smart watch") {
      if (!itemInfo.brand || !itemInfo.model) {
        alert("Please provide brand and model for your smart watch.");
        return;
      }
      if (!itemInfo.watchSerialImei) {
        alert("Please provide serial or IMEI number for your smart watch.");
        return;
      }
    }

    setSubmitting(true);

    let itemImageUrls = [];
    let claimantImageUrl = null;
    let purchaseReceiptImageUrl = null;

    try {
      // Upload lost item images
      for (const file of itemFiles) {
        const ext = file.name.split(".").pop();
        const fileName = `claims/items/${Date.now()}-${Math.random()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("claims-image")
          .upload(fileName, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          setMessage("Failed to upload item images.");
          setSubmitting(false);
          return;
        }

        const { data } = supabase.storage
          .from("claims-image")
          .getPublicUrl(fileName);

        itemImageUrls.push(data.publicUrl);
      }

      // Upload claimant image
      const ext = claimantFile.name.split(".").pop();
      const claimantFileName = `claims/claimants/${Date.now()}-${Math.random()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("claims-image")
        .upload(claimantFileName, claimantFile);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setMessage("Failed to upload claimant picture.");
        setSubmitting(false);
        return;
      }

      const { data } = supabase.storage
        .from("claims-image")
        .getPublicUrl(claimantFileName);

      claimantImageUrl = data.publicUrl;

      // Upload purchase receipt image
      const receiptExt = purchaseReceipt.name.split(".").pop();
      const receiptFileName = `claims/purchase-receipt/${Date.now()}-${Math.random()}.${receiptExt}`;

      const { error: receiptUploadError } = await supabase.storage
        .from("claims-image")
        .upload(receiptFileName, purchaseReceipt);

      if (receiptUploadError) {
        console.error("Upload error:", receiptUploadError);
        setMessage("Failed to upload purchase receipt.");
        setSubmitting(false);
        return;
      }

      const { data: receiptData } = supabase.storage
        .from("claims-image")
        .getPublicUrl(receiptFileName);

      purchaseReceiptImageUrl = receiptData.publicUrl;
      // Save claim record
      const { error: claimError } = await supabase.from("claims").insert([
        {
          item_id: id,
          claimant_email: session.user.email,
          details,
          item_image: itemImageUrls,
          claimant_image: claimantImageUrl,
          purchase_receipt: purchaseReceiptImageUrl,
          item_type: item.item_type,
          status: "pending",
          extra_info: itemInfo,
        },
      ]);

      if (claimError) {
        console.error("Error submitting claim:", claimError);
        setMessage("Failed to submit claim. Please try again.");
      } else {
        // Update found-items status
        const { error: updateError } = await supabase
          .from("found-items")
          .update({ status: "claim submitted" })
          .eq("id", id);

        if (updateError) {
          console.error("Error updating found-items:", updateError);
          setMessage("Claim submitted, but failed to update item status.");
        } else {
          setMessage(
            "Your claim has been submitted successfully! The admin will review it and contact you."
          );

          // Reset form
          setDetails("");
          setItemFiles([]);
          setItemPreviews([]);
          setClaimantFile(null);
          setPurchaseReceipt(null);
          setClaimantPreview(null);
          setPurchaseReceiptPreview(null);
          setItemInfo({
            imei: "",
            frequentNumber1: "",
            frequentNumber2: "",
            simName: "",
            simNumber: "",
            serialNumber: "",
            recentWebsite: "",
            signedUpEmail: "",
            brand: "",
            model: "",
            watchSerialImei: "",
            uniqueFeatures: "",
            purchaseDate: "",
            lastLocation: "",
          });

          setTimeout(() => router.push("/"), 5000);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setMessage("An unexpected error occurred. Please try again.");
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Item Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The item you&apos;re trying to claim may have already been claimed
            or doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Claim Item: {item.item_type}
            </h1>
            <p className="text-gray-600 mb-6">
              Provide verification details to claim this {item.item_type}
            </p>

            {/* Item Preview */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-4">
                {item.picture_url && (
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <Image
                      src={item.picture_url}
                      alt={item.item_type}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {item.item_type}
                  </h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="text-xs text-gray-500">
                    Found on {new Date(item.date_found).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proof of Ownership Details *
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  required
                  placeholder="Describe how you can prove this item belongs to you. Include specific details only the owner would know..."
                  className="w-full border border-gray-300 rounded-xl p-4 text-black focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                />
              </div>

              {/* Item-Type Specific Fields */}
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-medium text-blue-800 mb-3">
                  Additional Verification for {item.item_type}
                </h3>

                {/* Phone & Tablet Fields */}
                {(item.item_type === "Phone" ||
                  item.item_type === "Tablet") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="IMEI Number *"
                      value={itemInfo.imei}
                      onChange={(e) => handleInfoChange("imei", e.target.value)}
                      className="border border-gray-300 rounded-xl p-3 text-black"
                      required
                    />
                    <input
                      type="text"
                      placeholder="SIM Card Name *"
                      value={itemInfo.simName}
                      onChange={(e) =>
                        handleInfoChange("simName", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black"
                      required
                    />
                    <input
                      type="text"
                      placeholder="SIM Card Number *"
                      value={itemInfo.simNumber}
                      onChange={(e) =>
                        handleInfoChange("simNumber", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Frequently Called Number 1 *"
                      value={itemInfo.frequentNumber1}
                      onChange={(e) =>
                        handleInfoChange("frequentNumber1", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Frequently Called Number 2 *"
                      value={itemInfo.frequentNumber2}
                      onChange={(e) =>
                        handleInfoChange("frequentNumber2", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Model (e.g. iPhone 13) *"
                      required
                      value={itemInfo.model}
                      onChange={(e) =>
                        handleInfoChange("model", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black md:col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="Last location where you had it *"
                      required
                      value={itemInfo.lastLocation}
                      onChange={(e) =>
                        handleInfoChange("lastLocation", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black md:col-span-2"
                    />
                  </div>
                )}

                {/* Laptop Fields */}
                {item.item_type === "Laptop" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Serial Number *"
                      value={itemInfo.serialNumber}
                      onChange={(e) =>
                        handleInfoChange("serialNumber", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Recently Visited Website *"
                      value={itemInfo.recentWebsite}
                      onChange={(e) =>
                        handleInfoChange("recentWebsite", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Signed Up on Laptop *"
                      value={itemInfo.signedUpEmail}
                      onChange={(e) =>
                        handleInfoChange("signedUpEmail", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Model (e.g. Dell XPS 13) *"
                      value={itemInfo.model}
                      required
                      onChange={(e) =>
                        handleInfoChange("model", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black"
                    />
                    <input
                      type="text"
                      placeholder="Installed Apps (not default) *"
                      required
                      value={itemInfo.installedApps}
                      onChange={(e) =>
                        handleInfoChange("installedApps", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black md:col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="Last location where you had it *"
                      required
                      value={itemInfo.lastLocation}
                      onChange={(e) =>
                        handleInfoChange("lastLocation", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black md:col-span-2"
                    />
                  </div>
                )}

                {/* Smart Watch Fields */}
                {item.item_type === "Smart watch" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Brand Name *"
                      value={itemInfo.brand}
                      onChange={(e) =>
                        handleInfoChange("brand", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Model *"
                      value={itemInfo.model}
                      onChange={(e) =>
                        handleInfoChange("model", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Serial Number or IMEI *"
                      value={itemInfo.watchSerialImei}
                      onChange={(e) =>
                        handleInfoChange("watchSerialImei", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Color *"
                      value={itemInfo.color}
                      required
                      onChange={(e) =>
                        handleInfoChange("color", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black"
                    />
                    <input
                      type="text"
                      placeholder="Unique Features/Marks *"
                      required
                      value={itemInfo.uniqueFeatures}
                      onChange={(e) =>
                        handleInfoChange("uniqueFeatures", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black md:col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="Last location where you had it *"
                      required
                      value={itemInfo.lastLocation}
                      onChange={(e) =>
                        handleInfoChange("lastLocation", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black md:col-span-2"
                    />
                  </div>
                )}

                {/* Other item types */}
                {!["Phone", "Tablet", "Laptop", "Smart watch"].includes(
                  item.item_type
                ) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Unique identifying features *"
                      value={itemInfo.uniqueFeatures}
                      onChange={(e) =>
                        handleInfoChange("uniqueFeatures", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Approximate purchase date *"
                      required
                      value={itemInfo.purchaseDate}
                      onChange={(e) =>
                        handleInfoChange("purchaseDate", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black"
                    />
                    <input
                      type="text"
                      placeholder="Last location where you had it *"
                      required
                      value={itemInfo.lastLocation}
                      onChange={(e) =>
                        handleInfoChange("lastLocation", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black md:col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="Serial number or identifying marks *"
                      required
                      value={itemInfo.serialNumber}
                      onChange={(e) =>
                        handleInfoChange("serialNumber", e.target.value)
                      }
                      className="border border-gray-300 rounded-xl p-3 text-black md:col-span-2"
                    />
                  </div>
                )}
              </div>

              {/* Upload Lost Item Pictures */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Pictures of Your Item (1-3 images) *
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleItemFiles}
                  required
                  className="hidden"
                  id="itemPictures"
                />
                <label
                  htmlFor="itemPictures"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                >
                  {itemPreviews.length > 0 ? (
                    <div className="flex gap-2 w-full overflow-x-auto p-2">
                      {itemPreviews.map((preview, idx) => (
                        <div key={idx} className="relative h-20 w-20">
                          <Image
                            src={preview}
                            alt={`Preview ${idx + 1}`}
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <i className="fas fa-camera text-2xl text-gray-400 mb-2"></i>
                      <p className="text-gray-500 text-sm">
                        Click to upload item pictures
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Upload Claimant Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Your Picture (for verification) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleClaimantFile}
                  required
                  className="hidden"
                  id="claimantPicture"
                />
                <label
                  htmlFor="claimantPicture"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                >
                  {claimantPreview ? (
                    <div className="relative h-20 w-20">
                      <Image
                        src={claimantPreview}
                        alt="Claimant Preview"
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <i className="fas fa-user-circle text-2xl text-gray-400 mb-2"></i>
                      <p className="text-gray-500 text-sm">
                        Click to upload your picture
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload purchase receipt (for verification) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePurchaseReceipt}
                  required
                  className="hidden"
                  id="purchaseReceipt"
                />
                <label
                  htmlFor="purchaseReceipt"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                >
                  {purchaseReceiptPreview ? (
                    <div className="relative h-20 w-20">
                      <Image
                        src={purchaseReceiptPreview}
                        alt="Purchase receipt preview"
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <i className="fas fa-user-circle text-2xl text-gray-400 mb-2"></i>
                      <p className="text-gray-500 text-sm">
                        Click to upload receipt
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 rounded-xl font-semibold text-white transition ${
                  submitting
                    ? "bg-indigo-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Submitting...
                  </span>
                ) : (
                  "Submit Claim"
                )}
              </button>

              {message && (
                <div
                  className={`p-3 rounded-xl text-center ${
                    message.includes("successfully")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}
            </form>
          </div>

          {/* Right Column - Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Claim Process Guide
            </h2>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-start mb-2">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                    <i className="fas fa-info-circle text-indigo-600"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Item Information
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Type:</strong> {item.item_type}
                      <br />
                      <strong>Found:</strong>{" "}
                      {new Date(item.date_found).toLocaleDateString()}
                      <br />
                      {item.reporter_name && (
                        <>
                          <strong>Reported by:</strong> {item.reporter_name}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-start mb-2">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <i className="fas fa-lightbulb text-blue-600"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Verification Tips
                    </h3>
                    <ul className="text-sm text-gray-600 mt-1 list-disc pl-5 space-y-1">
                      <li>
                        Provide specific details only the owner would know
                      </li>
                      <li>Include unique features, scratches, or marks</li>
                      <li>
                        For electronics, provide serial numbers if available
                      </li>
                      <li>
                        Mention contents or data that would identify ownership
                      </li>
                      <li>
                        You may need to provide additional means of identication
                        upon collection.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-start mb-2">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <i className="fas fa-mobile-alt text-purple-600"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Device Specific Requirements
                    </h3>
                    <ul className="text-sm text-gray-600 mt-1 list-disc pl-5 space-y-1">
                      <li>
                        <strong>Phones/Tablets:</strong> IMEI, SIM details, and
                        frequent numbers
                      </li>
                      <li>
                        <strong>Laptops:</strong> Serial number, recent
                        websites, and account emails
                      </li>
                      <li>
                        <strong>Smart Watches:</strong> Brand, model, and
                        serial/IMEI number
                      </li>
                      <li>
                        Be as accurate as possible for faster verification
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-start mb-2">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <i className="fas fa-shield-alt text-green-600"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      What Happens Next
                    </h3>
                    <ul className="text-sm text-gray-600 mt-1 list-disc pl-5 space-y-1">
                      <li>Admin will review your claim within 24-48 hours</li>
                      <li>You may be contacted for additional verification</li>
                      <li>
                        If approved, you&apos;ll be instructed on how to collect
                        the item
                      </li>
                      <li>Bring valid ID when collecting your item</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
