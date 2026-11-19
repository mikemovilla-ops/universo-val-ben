import type { Config } from "tailwindcss";

// Paleta sacada del logo (logo1.png): burdeos, crema y verde oliva. Mismo
// esquema oscuro que el resto de apps de Valdun (Tarados: verde césped +
// amarillo; EuroAmigus: azul noche + oro). Los nombres de los tokens son
// de un primer borrador "de madera"; lo que importa es su papel:
//   nogal/nogaldark: fondos (burdeos muy oscuro)
//   corteza: tarjetas
//   crema: texto
//   miel/mielbrillante: acento (botones, enlaces activos) — verde oliva
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nogal: "#2A0E13",
        nogaldark: "#1B080C",
        corteza: "#41161E",
        burdeos: "#7F0A1E",
        crema: "#FBEFD9",
        miel: "#A9B84E",
        mielbrillante: "#C9D56E",
        salvia: "#8DC59A",
        cielo: "#8EC0E0",
        coral: "#FF8A6B",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};

export default config;
