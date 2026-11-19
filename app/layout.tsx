import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import VersionPopup from "@/components/VersionPopup";
import BarraVerComo from "@/components/BarraVerComo";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Universo Val-Ben",
  description: "La app de la familia Val-Ben: árbol familiar, recetas y álbum de fotos",
  // Al guardarla en la pantalla de inicio del iPhone: se abre a pantalla
  // completa (sin la barra de Safari) y con este nombre bajo el icono
  // (app/apple-icon.png, generado desde logo1.png — ver README).
  appleWebApp: { capable: true, title: "Val-Ben", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#1B080C" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`${display.variable} ${body.variable} font-body bg-nogal text-crema flex min-h-screen flex-col fondo-arbol`}
      >
        <Providers>
          <BarraVerComo />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <VersionPopup />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
