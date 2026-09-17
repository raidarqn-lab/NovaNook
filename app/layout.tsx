import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Nova Nook · Nova Sapphire",
  description: "Nova Sapphire's multilingual alliance bulletin board.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
