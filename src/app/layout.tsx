import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Asset Generator",
  description: "Google for Startups",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}