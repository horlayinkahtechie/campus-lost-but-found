"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Search,
  ClipboardCheck,
  Users,
  BarChart,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function AdminSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto close on route change (for mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    {
      name: "Found Items",
      href: "/admin/found-items",
      icon: <Package size={20} />,
    },
    {
      name: "Lost Items",
      href: "/admin/lost-items",
      icon: <Search size={20} />,
    },
    {
      name: "Claims",
      href: "/admin/claims",
      icon: <ClipboardCheck size={20} />,
    },
    { name: "Users", href: "/admin/users", icon: <Users size={20} /> },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 m-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 lg:hidden"
      >
        <Menu size={22} />
      </button>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-900 text-white shadow-xl
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}
          lg:translate-x-0 lg:static
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800 border-b border-gray-700">
          {!isCollapsed && (
            <div className="ml-3">
              <h1 className="font-semibold">CampusLost&Found</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          )}

          {/* Collapse / Close buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex text-gray-400 hover:text-white"
            >
              {isCollapsed ? <Menu size={18} /> : <X size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div
          className={`p-4 border-b border-gray-800 ${
            isCollapsed ? "lg:px-2" : ""
          }`}
        >
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center font-semibold">
              {session?.user?.name?.charAt(0) || "A"}
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <p className="font-medium">{session?.user?.name || "Admin"}</p>
                <p className="text-sm text-gray-400">
                  {session?.user?.email || "admin@example.com"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors
                  ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-gray-800 text-gray-300"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
              >
                {item.icon}
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
                {item.badge && !isCollapsed && (
                  <span className="ml-auto bg-indigo-500 text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          <button
            onClick={() => signOut()}
            className={`flex items-center w-full text-gray-300 hover:text-white ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
