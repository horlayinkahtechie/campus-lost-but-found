"use client";
import { useState} from "react";
import { useEffect } from "react";
import Head from "next/head";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function ReportFound() {
  const { data: session, error } = useSession();
  const [formData, setFormData] = useState({
    itemType: "",
    description: "",
    location: "",
    date: "",
    picture: null,
    submittedToOffice: false,
    reporterName: session?.user?.name || "",
    reporterEmail: session?.user?.email || "",
    reporterPhone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, picture: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let pictureUrl = null;
      if (formData.picture) {
        const fileExt = formData.picture.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("found-item-images")
          .upload(fileName, formData.picture);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("found-item-images")
          .getPublicUrl(fileName);

        pictureUrl = data.publicUrl;
      }

      // Insert into Supabase
      const { error } = await supabase.from("found-items").insert([
        {
          item_type: formData.itemType,
          description: formData.description,
          location_found: formData.location,
          date_found: formData.date,
          picture_url: pictureUrl,
          submitted_to_office: formData.submittedToOffice,
          status: formData.submittedToOffice ? "submitted" : "reported",
          found_by: session?.user?.email || formData.reporterEmail,
          reporter_name: formData.reporterName,
          reporter_email: formData.reporterEmail,
          reporter_phone: formData.reporterPhone,
        },
      ]);

      if (error) throw error;

      setSubmitMessage(
        "Your found item report has been submitted successfully!"
      );
      setFormData({
        itemType: "",
        description: "",
        location: "",
        date: "",
        picture: null,
        submittedToOffice: false,
        reporterName: session?.user?.name || "",
        reporterEmail: session?.user?.email || "",
        reporterPhone: "",
      });
      setImagePreview(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitMessage(
        "❌ There was an error submitting your report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <p className="text-white text-lg">
          Please <Link href="/user/signin" className="underline">log in</Link>  with your Google account to report a found item.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Head>
        <title>Report Found Item - Campus Lost & Found</title>
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-3 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Report a Found Item
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Help reunite lost items with their owners by providing details about
            what you found.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Reporter Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="reporterName"
                      value={formData.reporterName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="reporterEmail"
                      value={formData.reporterEmail}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="reporterPhone"
                    value={formData.reporterPhone}
                    onChange={handleChange}
                    required
                    placeholder="e.g. +2348012345678"
                    className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Item Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="itemType"
                    value={formData.itemType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
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

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    placeholder="Provide details like brand, model, color, size, distinguishing features"
                  />
                </div>

                {/* Location & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Where did you find it?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      When did you find it?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Upload Picture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Picture <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50">
                      {imagePreview ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            width={200}
                            height={200}
                            className="w-full h-full object-contain rounded-2xl"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData((prev) => ({
                                ...prev,
                                picture: null,
                              }));
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, JPEG (Max 5MB)
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        name="picture"
                        onChange={handleFileChange}
                        accept="image/*"
                        required
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Submitted to Office */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="submittedToOffice"
                    checked={formData.submittedToOffice}
                    onChange={handleChange}
                    required
                    className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
                  />
                  <div className="ml-3 text-sm">
                    <label className="font-medium text-gray-700">
                      I have submitted this item to the Admin/Security Office
                    </label>
                    <p className="text-gray-500 mt-1">
                      {" "}
                      Please bring found items to the Admin Office for
                      safekeeping and verification{" "}
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Report"}
                  </button>
                </div>

                {/* Message */}
                {submitMessage && (
                  <p className="mt-4 text-center text-sm text-gray-600">
                    {submitMessage}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-1">
            <div className="bg-indigo-50 rounded-2xl p-6 shadow-lg border border-indigo-100">
              <h2 className="text-xl font-semibold text-indigo-800 mb-4 flex items-center">
                <i className="fas fa-info-circle mr-2"></i>
                Important Information
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-full mr-3 mt-0.5">
                    <i className="fas fa-map-marker-alt text-indigo-600 text-sm"></i>
                  </div>
                  <span className="text-indigo-700">
                    Please bring found items to the Admin/Security Office as
                    soon as possible
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-full mr-3 mt-0.5">
                    <i className="fas fa-check-circle text-indigo-600 text-sm"></i>
                  </div>
                  <span className="text-indigo-700">
                    Our admin will verify the item against your digital record
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-full mr-3 mt-0.5">
                    <i className="fas fa-lock text-indigo-600 text-sm"></i>
                  </div>
                  <span className="text-indigo-700">
                    Once verified, the item will be stored securely until
                    claimed
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-full mr-3 mt-0.5">
                    <i className="fas fa-shield-alt text-indigo-600 text-sm"></i>
                  </div>
                  <span className="text-indigo-700">
                    The rightful owner will need to provide proof of ownership
                    to claim the item
                  </span>
                </li>
              </ul>

              <div className="mt-6 pt-4 border-t border-indigo-200">
                <h3 className="font-medium text-indigo-800 mb-2">
                  Office Hours
                </h3>
                <p className="text-indigo-700 text-sm">
                  Monday - Friday: 9AM - 5PM
                </p>
                <p className="text-indigo-700 text-sm">Saturday: 10AM - 2PM</p>

                <h3 className="font-medium text-indigo-800 mt-4 mb-2">
                  Location
                </h3>
                <p className="text-indigo-700 text-sm">
                  Admin Building, Room 102
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">
                Quick Actions
              </h3>
              <Link
                href="/report-lost-item"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 mb-3"
              >
                <div className="flex items-center">
                  <div className="bg-red-100 p-2 rounded-lg mr-3">
                    <i className="fas fa-search text-red-600"></i>
                  </div>
                  <span className="text-gray-700">Report a Lost Item</span>
                </div>
                <i className="fas fa-chevron-right text-gray-400"></i>
              </Link>
              <Link
                href="/search"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <i className="fas fa-list text-blue-600"></i>
                  </div>
                  <span className="text-gray-700">Browse Found Items</span>
                </div>
                <i className="fas fa-chevron-right text-gray-400"></i>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
