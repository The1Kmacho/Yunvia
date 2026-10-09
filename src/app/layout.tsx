import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yunvia | Build together. Live better.",
  description: "Community-powered projects, shared resources and collective progress. Born in Puerto Rico.",
  applicationName: "Yunvia"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
