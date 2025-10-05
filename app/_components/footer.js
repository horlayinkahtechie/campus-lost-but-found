import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <i className="fas fa-search text-white"></i>
            </div>
            <span className="text-xl font-bold">CampusLost&Found</span>
          </div>
          <p className="text-gray-400">
            Helping students reunite with their lost belongings.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/report-lost-item"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Report Lost
              </Link>
            </li>
            <li>
              <Link
                href="/report-found-item"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Report Found
              </Link>
            </li>
            <li>
              <Link
                href="/search"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Found Items
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Contact Info</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-center">
              <i className="fas fa-map-marker-alt mr-3 text-indigo-500"></i>
              <span>Admin Building, Room 102</span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-clock mr-3 text-indigo-500"></i>
              <span>Mon-Fri: 9AM - 5PM</span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-phone mr-3 text-indigo-500"></i>
              <span>(555) 123-4567</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>
          © {new Date().getFullYear()} Campus Lost & Found System. All rights
          reserved. Developed by{" "} GROUP 13
        </p>
      </div>
    </footer>
  );
}
