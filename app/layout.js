"use client";
import { Toaster } from "react-hot-toast";
import Footer from "./_components/footer";
import Navigation from "./_components/navigation";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* <head>
        <link rel="icon" href="/lolaselan.jpg" type="image/jpg" />
      </head> */}

      <body>
        <SessionProvider>
          <Navigation />
          <Toaster position="top-right" />

          {children}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
