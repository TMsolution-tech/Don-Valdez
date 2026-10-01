import type { Metadata } from "next";
import { Rubik_Wet_Paint, Inter } from "next/font/google";
import "./globals.css";

// Tipografía estilo logo (graffiti/spray) — para títulos
const rubikWet = Rubik_Wet_Paint({
  variable: "--font-rubik-wet",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Don Valdez · Barber Studio",
  description: "Reservá tu turno en Don Valdez Barber Studio — Salta, Argentina",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${rubikWet.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
