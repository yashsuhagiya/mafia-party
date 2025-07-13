import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/redux/StoreProvider";

export const metadata: Metadata = {
  title: "Mafia Party - Ultimate Game Night Experience",
  description: "Create thrilling Mafia games with friends. Perfect for virtual game nights and gatherings!",
  keywords: "mafia game, party game, social game, game night, role playing",
  authors: [{ name: "Mafia Party Team" }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "Mafia Party - Ultimate Game Night Experience",
    description: "Create thrilling Mafia games with friends. Perfect for virtual game nights and gatherings!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
