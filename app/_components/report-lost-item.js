"use client";
import { useState } from "react";
import Head from "next/head";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function ReportLost() {
  const { data: session, error } = useSession();
  const [formData, setFormData] = useState({
    itemType: "",
    description: "",
    location: "",
    date: "",
    picture: null,
    itemName: "",
    pictures: [],
    proof: null,
    reporterName: session?.user?.name || "",
    reporterPhone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  // const [imagePreview, setImagePreview] = useState(null);
  const [imagePreview, setImagePreview] = useState([]);
  const [proofPreview, setProofPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle lost item pictures (1–3 files)
  const handlePicturesChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setFormData((prev) => ({ ...prev, pictures: files }));

    // Previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const handleProofChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, proof: file }));
    if (file) {
      setProofPreview(URL.createObjectURL(file));
    } else {
      setProofPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload pictures
      let pictureUrls = [];
      for (const file of formData.pictures) {
        const ext = file.name.split(".").pop();
        const fileName = `lost-items/${Date.now()}-${Math.random()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("lost-item-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("lost-item-images")
          .getPublicUrl(fileName);

        pictureUrls.push(data.publicUrl);
      }

      // Upload proof
      let proofUrl = null;
      if (formData.proof) {
        const ext = formData.proof.name.split(".").pop();
        const fileName = `lost-items/proofs/${Date.now()}-${Math.random()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("lost-item-images")
          .upload(fileName, formData.proof);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("lost-item-images")
          .getPublicUrl(fileName);

        proofUrl = data.publicUrl;
      }

      // Insert lost item record
      const { error } = await supabase.from("lost-items").insert([
        {
          item_name: formData.itemName,
          item_type: formData.itemType,
          description: formData.description,
          location: formData.location,
          date_lost: formData.date,
          picture_urls: pictureUrls,
          proof_url: proofUrl,
          status: "reported",
          reporter_name: formData.reporterName,
          reporter_phone: formData.reporterPhone,
          reporter_email: session?.user?.email || null,
        },
      ]);

      if (error) throw error;

      setSubmitMessage(
        "Your lost item report has been submitted successfully!"
      );
      setFormData({
        itemName: "",
        itemType: "",
        description: "",
        location: "",
        date: "",
        pictures: [],
        proof: null,
        reporterName: session?.user?.name || "",
        reporterPhone: "",
      });
      setImagePreview([]);
      setProofPreview(null);
    } catch (err) {
      console.error("Error submitting form:", err);
      setSubmitMessage(
        "There was an error submitting your report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Head>
        <title>Report Lost Item - Campus Lost & Found</title>
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Report a Lost Item
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Help us help you find your lost item by providing detailed
            information about what you&apos;ve lost.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      name="reporterName"
                      value={formData.reporterName}
                      required
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Phone Number
                    </label>
                    <input
                      type="tel"
                      name="reporterPhone"
                      value={formData.reporterPhone}
                      onChange={handleChange}
                      required
                      placeholder="e.g., +2348123456789"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={session.user.email}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Item Type */}
                <div>
                  <label
                    htmlFor="itemType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Item Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="itemType"
                    name="itemType"
                    value={formData.itemType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-black"
                  >
                    <option value="">Select an item type</option>
                    <option value="Phone">Phone</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Smart watch">Smart watch</option>
                    <option value="ID card">ID Cards</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., iPhone 13 Pro, HP Laptop"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-black"
                    placeholder="Provide a detailed description of your lost item including brand, color, size, and any distinguishing features"
                  />
                </div>

                {/* Location and Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Where did you lose it?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Around the mid seat in 1200 LT"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="date"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      When did you lose it?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Image proof Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload 1–3 pictures of the lost item{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePicturesChange}
                    required
                    className="hidden"
                    id="itemPictures"
                  />
                  <label
                    htmlFor="itemPictures"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50"
                  >
                    {imagePreview.length > 0 ? (
                      <div className="flex gap-2 w-full overflow-x-auto p-2">
                        {imagePreview.map((preview, idx) => (
                          <Image
                            key={idx}
                            src={preview}
                            alt={`Preview ${idx + 1}`}
                            width={100}
                            height={100}
                            unoptimized
                            className="rounded-xl object-contain"
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        Click to upload item pictures
                      </p>
                    )}
                  </label>
                </div>

                {/* Image ID upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Proof (Receipt, Warranty, ID)
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProofChange}
                    required
                    className="hidden"
                    id="proofPicture"
                  />
                  <label
                    htmlFor="proofPicture"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50"
                  >
                    {proofPreview ? (
                      <Image
                        src={proofPreview}
                        alt="Claimant Preview"
                        width={100}
                        height={100}
                        unoptimized
                        className="rounded-xl object-contain"
                      />
                    ) : (
                      <p className="text-gray-500">
                        Click to upload your picture
                      </p>
                    )}
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Submitting...
                      </span>
                    ) : (
                      <span>Submit Report</span>
                    )}
                  </button>
                </div>

                {/* Status Message */}
                {submitMessage && (
                  <div
                    className={`p-4 rounded-xl ${
                      submitMessage.includes("error")
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-green-100 text-green-700 border border-green-200"
                    }`}
                  >
                    <div className="flex items-center">
                      <i
                        className={`fas ${
                          submitMessage.includes("error")
                            ? "fa-exclamation-circle"
                            : "fa-check-circle"
                        } mr-2`}
                      ></i>
                      {submitMessage}
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-1">
            <div className="bg-blue-50 rounded-2xl p-6 shadow-lg border border-blue-100">
              <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                <i className="fas fa-info-circle mr-2"></i>
                What happens next?
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3 mt-0.5">
                    <i className="fas fa-database text-blue-600 text-sm"></i>
                  </div>
                  <span className="text-blue-700">
                    Your report will be stored in our database
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3 mt-0.5">
                    <i className="fas fa-bell text-blue-600 text-sm"></i>
                  </div>
                  <span className="text-blue-700">
                    You&apos;ll be notified if someone finds a matching item
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3 mt-0.5">
                    <i className="fas fa-check-circle text-blue-600 text-sm"></i>
                  </div>
                  <span className="text-blue-700">
                    Our admin will verify any matching found items
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3 mt-0.5">
                    <i className="fas fa-shield-alt text-blue-600 text-sm"></i>
                  </div>
                  <span className="text-blue-700">
                    You&apos;ll need to provide proof of ownership to claim your
                    item
                  </span>
                </li>
              </ul>

              <div className="mt-6 pt-4 border-t border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">
                  Tips for Recovery
                </h3>
                <p className="text-blue-700 text-sm mb-2">
                  <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                  Include specific details in your description
                </p>
                <p className="text-blue-700 text-sm mb-2">
                  <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                  Provide a photo if possible for easier identification
                </p>
                <p className="text-blue-700 text-sm">
                  <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                  Check back regularly for updates on your report
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">
                Quick Actions
              </h3>
              <Link
                href="/report-found-item"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 mb-3"
              >
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <i className="fas fa-hand-holding-heart text-green-600"></i>
                  </div>
                  <span className="text-gray-700">Report a Found Item</span>
                </div>
                <i className="fas fa-chevron-right text-gray-400"></i>
              </Link>
              <Link
                href="/search"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <i className="fas fa-search text-purple-600"></i>
                  </div>
                  <span className="text-gray-700">Search Found Items</span>
                </div>
                <i className="fas fa-chevron-right text-gray-400"></i>
              </Link>
            </div>

            {/* Support Card */}
            <div className="mt-6 bg-indigo-50 rounded-2xl p-6 shadow-lg border border-indigo-100">
              <h3 className="font-semibold text-indigo-800 mb-3">Need Help?</h3>
              <p className="text-indigo-700 text-sm mb-4">
                Contact the Lost & Found office for assistance with your report.
              </p>
              <div className="flex items-center text-indigo-700 text-sm mb-2">
                <i className="fas fa-map-marker-alt mr-2"></i>
                <span>Admin Building, Room 102</span>
              </div>
              <div className="flex items-center text-indigo-700 text-sm">
                <i className="fas fa-clock mr-2"></i>
                <span>Mon-Fri: 9AM - 5PM</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
