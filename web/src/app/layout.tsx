import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "ProFit",
  description: "Train smarter, grow stronger.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col bg-background text-text">
        {children}
      </body>
    </html>
  );
}
