import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GenBI Jatim",
  description: "Energi Baru untuk Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
