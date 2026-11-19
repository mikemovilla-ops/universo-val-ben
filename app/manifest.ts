import type { MetadataRoute } from "next";

// Para "Añadir a pantalla de inicio": nombre, colores e iconos de la app
// (el iPhone usa además app/apple-icon.png). Los iconos se generan desde
// logo1.png con scripts/generar-iconos.ps1 (ver README).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Universo Val-Ben",
    short_name: "Val-Ben",
    description: "Árbol familiar, recetas y álbum de la familia Val-Ben",
    start_url: "/",
    display: "standalone",
    background_color: "#1B080C",
    theme_color: "#1B080C",
    icons: [
      { src: "/icono-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
