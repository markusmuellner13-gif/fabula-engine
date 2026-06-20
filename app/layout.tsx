import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fabula Engine — AI-native game engine",
  description:
    "Fabula Engine: design, build and ship 2D & 3D games. Describe your idea and watch it become a playable world, or build by hand. From prototype to store-ready.",
  applicationName: "Fabula Engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
