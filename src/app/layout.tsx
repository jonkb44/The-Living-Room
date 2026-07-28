import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Living Room — quiet company, online",
  description:
    "A place to be near other people without having to perform. No swiping, no follower counts, no pressure to talk.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
