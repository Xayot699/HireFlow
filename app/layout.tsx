
import type { Metadata } from "next";
import type { ReactNode } from "react";
import PreferencesBootstrap from "@/components/layout/PreferencesBootstrap";

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
    <html lang="en" data-theme="light">
      <body className="bg-[#f4f3ec] text-[#17231d]">
        <PreferencesBootstrap />
        {children}
      </body>
    </html>
  );
}
