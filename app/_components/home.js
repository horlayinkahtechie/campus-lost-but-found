"use client";
import Link from "next/link";
import Head from "next/head";
import { useState, useEffect } from "react";
import Navigation from "./navigation";

export default function Home() {
  const [stats, setStats] = useState({ found: 1243, returned: 892 });

  // Simulate loading animation for stats
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({ found: 1287, returned: 945 });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Head>
        <title>Campus Lost & Found</title>
        <meta
          name="description"
          content="Report and claim lost items on campus"
        />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </Head>

      {/* Hero Section */}
      <section className="relative pt-16 pb-28 px-4 sm:px-6 lg:px-8 h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight lg:pt-20 pt-18">
              Lost Something on <span className="text-indigo-600">Campus</span>?
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              Our smart lost and found system helps reunite students with their
              belongings quickly and securely.
            </p>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <Link
                href="/report-lost-item"
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <i className="fas fa-search mr-3"></i>Report Lost Item
              </Link>
              <Link
                href="/report-found-item"
                className="bg-white text-indigo-600 border border-indigo-200 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-50 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                <i className="fas fa-hand-holding-heart mr-3"></i>Report Found
                Item
              </Link>
            </div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 right-0 -z-10 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl opacity-30"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Our process is simple, secure, and designed to get your belongings
            back to you quickly
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="bg-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <span className="text-indigo-600 text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-indigo-600">
                Report Item
              </h3>
              <p className="text-gray-600">
                Submit details about your lost item or a found item using our
                simple forms.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="bg-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <span className="text-indigo-600 text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-indigo-600">
                Verification
              </h3>
              <p className="text-gray-600">
                Our admin team verifies found items and matches them with lost
                reports.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="bg-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <span className="text-indigo-600 text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-indigo-600">
                Claim Item
              </h3>
              <p className="text-gray-600">
                Provide proof of ownership to claim your item securely from the
                admin office.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Our System
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white hover:border-indigo-100">
              <div className="text-indigo-600 text-2xl mb-4">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-indigo-600">
                Secure Process
              </h3>
              <p className="text-gray-600 text-sm">
                Admin verification ensures items go to the right owner.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white hover:border-indigo-100">
              <div className="text-green-600 text-2xl mb-4">
                <i className="fas fa-bolt"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-indigo-600">
                Quick Recovery
              </h3>
              <p className="text-gray-600 text-sm">
                Guaranateed return if found in the lost items database.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white hover:border-indigo-100">
              <div className="text-blue-600 text-2xl mb-4">
                <i className="fas fa-camera"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-indigo-600">
                Photo Verification
              </h3>
              <p className="text-gray-600 text-sm">
                Visual confirmation makes identifying items easier.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white hover:border-indigo-100">
              <div className="text-purple-600 text-2xl mb-4">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-indigo-600">
                Mobile Friendly
              </h3>
              <p className="text-gray-600 text-sm">
                Report and search for items from any device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Find Your Lost Item?
          </h2>
          <p className="text-indigo-100 max-w-2xl mx-auto mb-8">
            Join thousands of students who have successfully recovered their
            lost belongings through our system.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              href="/report-lost-item"
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-md"
            >
              Report a Lost Item
            </Link>
            <Link
              href="/report-found-item"
              className="bg-indigo-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 border border-indigo-500"
            >
              Report a Found Item
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
