
import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "HireFlow",
  description: "Find your next career opportunity",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="uz">
      <body className="bg-[#f4f3ec] text-[#17231d]">
        {children}
      </body>
    </html>
  );
}
